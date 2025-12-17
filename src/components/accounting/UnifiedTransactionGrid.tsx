'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import AdvancedDataGrid, { GridColumn, GridRow } from './AdvancedDataGrid'
import QuickCategoryModal from '../modals/QuickCategoryModal'
import QuickProjectModal from '../modals/QuickProjectModal'
import { ProjectRow, CategoryRow, TransactionRow } from '@/types/components'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Tag,
  User,
  FileText,
  Building,
  CreditCard,
  Receipt
} from 'lucide-react'

interface Transaction extends GridRow {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  category?: string
  project?: string
  source?: string
  vendor?: string
  paymentMethod: string
  receiptNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface UnifiedTransactionGridProps {
  userId?: string
}

export default function UnifiedTransactionGrid({ userId }: UnifiedTransactionGridProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Quick creation modals
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [pendingTransactionData, setPendingTransactionData] = useState<Record<string, unknown> | null>(null)

  // Stats
  const stats = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    netAmount: 0,
    transactionCount: transactions.length
  }
  stats.netAmount = stats.totalIncome - stats.totalExpenses

  // Fetch data
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadTransactions(),
        loadProjects(),
        loadCategories()
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/admin/accounting/transactions')
      if (!response.ok) throw new Error('Failed to load transactions')
      const data = await response.json()
      // Normalize source/vendor to always have a value in 'source' for the grid
      // Also ensure each transaction has a proper string ID
      const normalizedTransactions = (data.transactions || []).map((t: Record<string, unknown> & { _id?: string; id?: string }, index: number) => ({
        ...t,
        id: String(t._id || t.id || `transaction-${index}`), // Ensure we have a unique string ID
        source: String(t.source || (t as Record<string, unknown>).vendor || ''),
        category: String((t as any).categoryId?.name || (t as any).categoryName || ''),
        project: String((t as any).projectId?.name || (t as any).projectName || '')
      }))
      console.log('Loaded transactions with IDs:', normalizedTransactions.slice(0, 3).map((t: Transaction) => ({ id: t.id, description: t.description })))
      setTransactions(normalizedTransactions)
    } catch (err) {
      console.error('Failed to load transactions:', err)
      throw err
    }
  }

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/admin/accounting/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/accounting/transaction-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  // CRUD Operations
  const handleAdd = useCallback(async (newTransaction: Partial<Transaction>) => {
    try {
      console.log('Received transaction data:', newTransaction)
      console.log('Available categories:', categories)
      console.log('Available projects:', projects)

      // Ensure we have a category
      let categoryId = null
      if (newTransaction.category) {
        // Try to find category by name
        const foundCategory = categories.find(c => c.name === newTransaction.category)
        if (foundCategory) {
          categoryId = foundCategory._id
        }
      }

      // If no category found and we have categories available, use the first one as fallback
      if (!categoryId && categories.length > 0) {
        categoryId = categories[0]._id
        console.warn('No category provided or found, using first available category:', categories[0].name)
      }

      // If still no category, this is an error
      if (!categoryId) {
        throw new Error('No transaction category available. Please ensure categories are loaded.')
      }

      // Map project name to projectId
      let projectId = null
      if (newTransaction.project) {
        const foundProject = projects.find(p => p.name === newTransaction.project)
        if (foundProject) {
          projectId = foundProject._id
        }
      }

      // Prepare the API data with all required fields
      const apiData = {
        type: newTransaction.type,
        amount: Number(newTransaction.amount),
        description: newTransaction.description?.trim() || '',
        date: newTransaction.date,
        transactionCategoryId: categoryId,
        paymentMethod: newTransaction.paymentMethod || 'cash',
        ...(projectId && { projectId }),
        ...(newTransaction.source && { source: newTransaction.source.trim() }),
        ...(newTransaction.receiptNumber && { receiptNumber: newTransaction.receiptNumber.trim() }),
        ...(newTransaction.notes && { notes: newTransaction.notes.trim() }),
        ...(newTransaction.tags ? { tags: newTransaction.tags } : {}),
        ...(userId && { userId })
      }

      console.log('Prepared API data:', apiData)

      // Validate required fields before sending
      const requiredFields = {
        type: apiData.type,
        amount: apiData.amount,
        description: apiData.description,
        date: apiData.date,
        transactionCategoryId: apiData.transactionCategoryId,
        paymentMethod: apiData.paymentMethod
      }

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || (key === 'amount' && isNaN(value as number)))
        .map(([key]) => key)

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields)
        console.error('Required fields validation:', requiredFields)
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      const response = await fetch('/api/admin/accounting/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        console.error('API Error:', errorMessage, 'Status:', response.status)
        console.error('Sent data:', apiData)
        throw new Error(`Failed to create transaction: ${errorMessage}`)
      }

      const result = await response.json()
      // Refresh the data after successful creation
      await loadTransactions()
      return result.transaction
    } catch (err) {
      console.error('Failed to add transaction:', err)
      // Re-throw the original error with context
      if (err instanceof Error) {
        throw err
      }
      throw new Error('Failed to create transaction: Unknown error')
    }
  }, [userId, projects, categories, loadTransactions])

  // Quick creation handlers
  const handleCategoryCreated = useCallback((newCategory: CategoryRow) => {
    setCategories(prev => [...prev, newCategory])
    setShowCategoryModal(false)

    // If we have pending transaction data, continue with it
    if (pendingTransactionData) {
      const updatedData = { ...pendingTransactionData, category: newCategory.name }
      handleAdd(updatedData)
      setPendingTransactionData(null)
    }
  }, [pendingTransactionData])

  const handleProjectCreated = useCallback((newProject: ProjectRow) => {
    console.log('Project created, updating state:', newProject)
    setProjects(prev => [...prev, newProject])
    setShowProjectModal(false)

    // If we have pending transaction data, continue with it
    if (pendingTransactionData) {
      const updatedData = { ...pendingTransactionData, project: newProject.name }
      handleAdd(updatedData)
      setPendingTransactionData(null)
    }
  }, [pendingTransactionData])

  const handleAddWithQuickCreate = useCallback(async (newTransaction: Partial<Transaction>) => {
    // Check if category exists when user typed a new category name
    const categoryExists = categories.find(c => c.name.toLowerCase() === newTransaction.category?.toLowerCase())
    const projectExists = newTransaction.project ? projects.find(p => p.name.toLowerCase() === newTransaction.project?.toLowerCase()) : true

    // If category doesn't exist and it's not empty, ask to create it
    if (newTransaction.category && !categoryExists) {
      if (confirm(`Category "${newTransaction.category}" doesn't exist. Would you like to create it?`)) {
        setPendingTransactionData(newTransaction)
        setShowCategoryModal(true)
        return
      } else {
        // User declined to create category, remove it from transaction
        newTransaction = { ...newTransaction, category: categories.length > 0 ? categories[0].name : '' }
      }
    }

    // If project doesn't exist and it's not empty, ask to create it
    if (newTransaction.project && !projectExists) {
      if (confirm(`Project "${newTransaction.project}" doesn't exist. Would you like to create it?`)) {
        setPendingTransactionData(newTransaction)
        setShowProjectModal(true)
        return
      } else {
        // User declined to create project, remove it from transaction
        newTransaction = { ...newTransaction, project: '' }
      }
    }

    // Proceed with normal transaction creation
    return handleAdd(newTransaction)
  }, [categories, projects, handleAdd])

  const handleEdit = useCallback(async (id: string, updatedData: Partial<Transaction>) => {
    try {
      // Find original transaction to check type if needed
      const originalTransaction = transactions.find(t => t.id === id)

      // Handle source/vendor mapping
      // If 'source' was edited, we might need to send it as 'vendor' if it's an expense
      // or 'source' if it's an income.
      // However, the API might expect specific fields.
      // Let's assume the API handles 'source' and 'vendor' separately.

      const apiData: Record<string, unknown> = { ...updatedData }

      // If source is present in updatedData, ensure it's passed as source
      // The backend uses 'source' for both income (payer) and expense (vendor)
      if ('source' in updatedData) {
        apiData.source = updatedData.source
      }

      // Handle category mapping (name -> id)
      if (updatedData.category) {
        const foundCategory = categories.find(c => c.name === updatedData.category)
        if (foundCategory) {
          apiData.transactionCategoryId = foundCategory._id
          delete apiData.category
        }
      }

      // Handle project mapping (name -> id)
      if (updatedData.project) {
        const foundProject = projects.find(p => p.name === updatedData.project)
        if (foundProject) {
          apiData.projectId = foundProject._id
          delete apiData.project
        } else if (updatedData.project === '') {
          apiData.projectId = null
          delete apiData.project
        }
      }

      const response = await fetch(`/api/admin/accounting/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) throw new Error('Failed to update transaction')

      // Refresh data
      await loadTransactions()
    } catch (err) {
      console.error('Failed to edit transaction:', err)
      throw new Error('Failed to update transaction')
    }
  }, [transactions, categories, projects])

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/accounting/transactions/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete transaction')

      // Refresh data
      await loadTransactions()
    } catch (err) {
      console.error('Failed to delete transaction:', err)
      throw new Error('Failed to delete transaction')
    }
  }, [])

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/accounting/transactions/${id}`, {
            method: 'DELETE'
          })
        )
      )

      // Refresh data
      await loadTransactions()
    } catch (err) {
      console.error('Failed to bulk delete:', err)
      throw new Error('Failed to delete transactions')
    }
  }, [])

  // Column definitions
  const columns: GridColumn[] = useMemo(() => [
    {
      key: 'type',
      title: 'Type',
      type: 'badge',
      width: '120px',
      editable: true,
      sortable: true,
      filterable: true,
      required: true,
      options: [
        { value: 'income', label: 'Income', color: 'bg-green-100 text-green-800' },
        { value: 'expense', label: 'Expense', color: 'bg-red-100 text-red-800' }
      ]
    },
    {
      key: 'date',
      title: 'Date',
      type: 'date',
      width: '120px',
      editable: true,
      sortable: true,
      filterable: true,
      required: true,
      placeholder: 'Select date'
    },
    {
      key: 'description',
      title: 'Description',
      type: 'text',
      width: '250px',
      editable: true,
      sortable: true,
      filterable: true,
      required: true,
      placeholder: 'Enter description...'
    },
    {
      key: 'amount',
      title: 'Amount',
      type: 'currency',
      width: '130px',
      editable: true,
      sortable: true,
      required: true,
      validate: (value) => {
        const num = Number(value)
        if (isNaN(num) || num <= 0) {
          return 'Amount must be a positive number'
        }
        return null
      }
    },
    {
      key: 'category',
      title: 'Category',
      type: 'creatable-select',
      width: '150px',
      editable: true,
      sortable: true,
      filterable: true,
      required: true,
      options: categories.map(c => ({ value: c.name, label: c.name })),
      onCreate: (value) => {
        setPendingTransactionData({ category: value })
        setShowCategoryModal(true)
      }
    },
    {
      key: 'project',
      title: 'Project',
      type: 'creatable-select',
      width: '150px',
      editable: true,
      sortable: true,
      filterable: true,
      options: projects.map(p => ({ value: p.name, label: p.name })),
      onCreate: (value) => {
        setPendingTransactionData({ project: value })
        setShowProjectModal(true)
      }
    },
    {
      key: 'source',
      title: 'Source/Vendor',
      type: 'text',
      width: '150px',
      editable: true,
      sortable: true,
      filterable: true,
      placeholder: 'Enter source or vendor...'
    },
    {
      key: 'paymentMethod',
      title: 'Payment Method',
      type: 'select',
      width: '140px',
      editable: true,
      sortable: true,
      filterable: true,
      required: true,
      options: [
        { value: 'cash', label: 'Cash' },
        { value: 'bank', label: 'Bank Transfer' },
        { value: 'upi', label: 'UPI' },
        { value: 'card', label: 'Debit/Credit Card' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'neft', label: 'NEFT' },
        { value: 'rtgs', label: 'RTGS' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      key: 'receiptNumber',
      title: 'Receipt #',
      type: 'text',
      width: '120px',
      editable: true,
      sortable: true,
      filterable: true,
      placeholder: 'Receipt number...'
    },
    {
      key: 'notes',
      title: 'Notes',
      type: 'text',
      width: '200px',
      editable: true,
      sortable: false,
      filterable: true,
      placeholder: 'Additional notes...'
    },
    {
      key: 'createdAt',
      title: 'Created',
      type: 'readonly',
      width: '120px',
      editable: false,
      sortable: true,
      render: (value) => value && typeof value === 'string' ? new Date(value).toLocaleDateString('en-IN') : '-'
    }
  ], [categories, projects])

  // Custom actions
  const customActions = [
    {
      label: 'View Receipt',
      icon: Receipt,
      onClick: (row: GridRow) => {
        console.log('View receipt for:', row)
        // Could open receipt viewer
      },
      className: 'text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors'
    }
  ]

  // Default values for new transactions - computed dynamically when categories are available
  const defaultValues = useMemo(() => ({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    amount: '',
    description: '',
    category: ''
  }), [categories])

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Income</p>
              <p className="text-2xl font-bold">₹{stats.totalIncome.toLocaleString('en-IN')}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold">₹{stats.totalExpenses.toLocaleString('en-IN')}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-200" />
          </div>
        </div>

        <div className={`bg-gradient-to-r rounded-lg p-6 text-white ${stats.netAmount >= 0
          ? 'from-blue-500 to-blue-600'
          : 'from-orange-500 to-orange-600'
          }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${stats.netAmount >= 0 ? 'text-blue-100' : 'text-orange-100'}`}>
                Net Amount
              </p>
              <p className="text-2xl font-bold">₹{stats.netAmount.toLocaleString('en-IN')}</p>
            </div>
            <DollarSign className={`h-8 w-8 ${stats.netAmount >= 0 ? 'text-blue-200' : 'text-orange-200'
              }`} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold">{stats.transactionCount}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Advanced Data Grid */}
      <AdvancedDataGrid
        title="All Transactions"
        subtitle="Manage all your income and expense transactions in one place"
        columns={columns}
        data={transactions}
        loading={loading}
        error={error}
        searchPlaceholder="Search transactions, descriptions, categories..."
        pageSize={25}
        enableAdd={true}
        enableEdit={true}
        enableDelete={true}
        enableBulkActions={true}
        enableFullscreen={true}
        enableFilters={true}
        onAdd={handleAddWithQuickCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onRefresh={loadAllData}
        customActions={customActions}
        defaultValues={defaultValues}
      />

      {/* Quick Creation Modals */}
      <QuickCategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false)
          setPendingTransactionData(null)
        }}
        onSave={(newCategory: any) => handleCategoryCreated(newCategory)}
        defaultType={pendingTransactionData?.type === 'income' ? 'revenue' : 'expense'}
      />

      <QuickProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false)
          setPendingTransactionData(null)
        }}
        onSave={(newProject: any) => handleProjectCreated(newProject)}
        initialName={typeof pendingTransactionData?.project === 'string' ? pendingTransactionData.project : ''}
      />
    </div>
  )
}