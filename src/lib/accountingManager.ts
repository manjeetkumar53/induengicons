import { createClient } from 'redis'

// Simple shared Redis client 
let redis: any = null

async function getRedisClient() {
  if (!redis) {
    console.log('Creating Redis client...')
    redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
    
    redis.on('error', (err: Error) => {
      console.error('Redis Client Error:', err)
    })
    
    await redis.connect()
    console.log('Redis connected successfully')
  }
  
  return redis
}

// Data Interfaces
export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'on-hold' | 'cancelled'
  startDate: string
  endDate?: string
  budget?: number
  createdAt: string
  updatedAt: string
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  type: 'material' | 'labor' | 'equipment' | 'transport' | 'other'
  createdAt: string
}

export interface TransactionCategory {
  id: string
  name: string
  description?: string
  type: 'project' | 'business' | 'personal' | 'operational'
  createdAt: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  projectId?: string
  expenseCategoryId?: string
  transactionCategoryId: string
  source?: string // For income: who paid, For expense: vendor/supplier
  paymentMethod: 'cash' | 'bank' | 'cheque' | 'upi' | 'card' | 'other'
  receiptNumber?: string
  createdAt: string
  updatedAt: string
  createdBy: string // Admin user ID
}

export interface Allocation {
  id: string
  amount: number
  fromTransactionId: string // Source income transaction
  toProjectId: string
  description?: string
  date: string
  createdAt: string
  createdBy: string
}

// Manager Class
export class AccountingManager {
  private async getRedisClient() {
    return await getRedisClient()
  }

  // Project Management
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const redis = await this.getRedisClient()
    
    const project: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const projectKey = `accounting:project:${project.id}`
    await redis.set(projectKey, JSON.stringify(project))
    await redis.lPush('accounting:projects', projectKey)
    await redis.set(`accounting:project_name:${project.name.toLowerCase()}`, project.id)

    return project
  }

  async getAllProjects(): Promise<Project[]> {
    console.log('getAllProjects: Starting...')
    const redis = await this.getRedisClient()
    console.log('getAllProjects: Got redis client:', redis ? 'not null' : 'null', redis?.isOpen ? 'open' : 'closed')
    
    if (!redis) {
      throw new Error('Redis client is null in getAllProjects')
    }
    
    const projectKeys = await redis.lRange('accounting:projects', 0, -1)
    console.log('getAllProjects: Got project keys:', projectKeys)
    const projects: Project[] = []

    for (const key of projectKeys) {
      const projectData = await redis.get(key)
      if (projectData) {
        projects.push(JSON.parse(projectData))
      }
    }

    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async findProjectByName(name: string): Promise<Project | null> {
    const redis = await this.getRedisClient()
    
    const projectId = await redis.get(`accounting:project_name:${name.toLowerCase()}`)
    if (!projectId) return null

    const projectData = await redis.get(`accounting:project:${projectId}`)
    return projectData ? JSON.parse(projectData) : null
  }

  // Expense Category Management
  async createExpenseCategory(categoryData: Omit<ExpenseCategory, 'id' | 'createdAt'>): Promise<ExpenseCategory> {
    const redis = await this.getRedisClient()
    
    const category: ExpenseCategory = {
      id: `exp_cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...categoryData,
      createdAt: new Date().toISOString()
    }

    const categoryKey = `accounting:expense_category:${category.id}`
    await redis.set(categoryKey, JSON.stringify(category))
    await redis.lPush('accounting:expense_categories', categoryKey)
    await redis.set(`accounting:expense_category_name:${category.name.toLowerCase()}`, category.id)

    return category
  }

  async getAllExpenseCategories(): Promise<ExpenseCategory[]> {
    const redis = await this.getRedisClient()
    
    const categoryKeys = await redis.lRange('accounting:expense_categories', 0, -1)
    const categories: ExpenseCategory[] = []

    for (const key of categoryKeys) {
      const categoryData = await redis.get(key)
      if (categoryData) {
        categories.push(JSON.parse(categoryData))
      }
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name))
  }

  // Transaction Category Management
  async createTransactionCategory(categoryData: Omit<TransactionCategory, 'id' | 'createdAt'>): Promise<TransactionCategory> {
    const redis = await this.getRedisClient()
    
    const category: TransactionCategory = {
      id: `txn_cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...categoryData,
      createdAt: new Date().toISOString()
    }

    const categoryKey = `accounting:transaction_category:${category.id}`
    await redis.set(categoryKey, JSON.stringify(category))
    await redis.lPush('accounting:transaction_categories', categoryKey)
    await redis.set(`accounting:transaction_category_name:${category.name.toLowerCase()}`, category.id)

    return category
  }

  async getAllTransactionCategories(): Promise<TransactionCategory[]> {
    console.log('getAllTransactionCategories: Starting...')
    const redis = await this.getRedisClient()
    console.log('getAllTransactionCategories: Got redis client:', redis ? 'not null' : 'null', redis?.isOpen ? 'open' : 'closed')
    
    if (!redis) {
      throw new Error('Redis client is null in getAllTransactionCategories')
    }
    
    const categoryKeys = await redis.lRange('accounting:transaction_categories', 0, -1)
    console.log('getAllTransactionCategories: Got category keys:', categoryKeys)
    const categories: TransactionCategory[] = []

    for (const key of categoryKeys) {
      const categoryData = await redis.get(key)
      if (categoryData) {
        categories.push(JSON.parse(categoryData))
      }
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name))
  }

  // Transaction Management
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const redis = await this.getRedisClient()
    
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...transactionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const transactionKey = `accounting:transaction:${transaction.id}`
    await redis.set(transactionKey, JSON.stringify(transaction))
    await redis.lPush('accounting:transactions', transactionKey)
    
    // Add to type-specific lists
    await redis.lPush(`accounting:transactions:${transaction.type}`, transactionKey)
    
    // Add to date index
    const dateKey = transaction.date.split('T')[0] // YYYY-MM-DD format
    await redis.lPush(`accounting:transactions:date:${dateKey}`, transactionKey)

    return transaction
  }

  async getAllTransactions(type?: 'income' | 'expense'): Promise<Transaction[]> {
    const redis = await this.getRedisClient()
    
    const listKey = type ? `accounting:transactions:${type}` : 'accounting:transactions'
    const transactionKeys = await redis.lRange(listKey, 0, -1)
    const transactions: Transaction[] = []

    for (const key of transactionKeys) {
      const transactionData = await redis.get(key)
      if (transactionData) {
        transactions.push(JSON.parse(transactionData))
      }
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Allocation Management
  async createAllocation(allocationData: Omit<Allocation, 'id' | 'createdAt'>): Promise<Allocation> {
    const redis = await this.getRedisClient()
    
    const allocation: Allocation = {
      id: `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...allocationData,
      createdAt: new Date().toISOString()
    }

    const allocationKey = `accounting:allocation:${allocation.id}`
    await redis.set(allocationKey, JSON.stringify(allocation))
    await redis.lPush('accounting:allocations', allocationKey)
    
    // Add to project-specific allocations
    await redis.lPush(`accounting:allocations:project:${allocation.toProjectId}`, allocationKey)

    return allocation
  }

  async getAllocations(projectId?: string): Promise<Allocation[]> {
    const redis = await this.getRedisClient()
    
    const listKey = projectId ? `accounting:allocations:project:${projectId}` : 'accounting:allocations'
    const allocationKeys = await redis.lRange(listKey, 0, -1)
    const allocations: Allocation[] = []

    for (const key of allocationKeys) {
      const allocationData = await redis.get(key)
      if (allocationData) {
        allocations.push(JSON.parse(allocationData))
      }
    }

    return allocations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Reporting Methods
  async getProjectSummary(projectId: string) {
    const [transactions, allocations] = await Promise.all([
      this.getAllTransactions(),
      this.getAllocations(projectId)
    ])

    const projectTransactions = transactions.filter(t => t.projectId === projectId)
    const projectIncome = projectTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const projectExpenses = projectTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const allocatedAmount = allocations.reduce((sum, a) => sum + a.amount, 0)

    return {
      projectId,
      directIncome: projectIncome,
      directExpenses: projectExpenses,
      allocatedAmount,
      totalAvailable: projectIncome + allocatedAmount,
      netAmount: (projectIncome + allocatedAmount) - projectExpenses,
      transactionCount: projectTransactions.length,
      allocationCount: allocations.length
    }
  }
}

// Export singleton instance
export const accountingManager = new AccountingManager()