'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Building2, 
  DollarSign, 
  CreditCard,
  FileText,
  TrendingDown,
  Save,
  Package,
  Truck,
  Users,
  Wrench
} from 'lucide-react'

interface Project {
  _id: string
  name: string
  description?: string
  status: string
}

interface ExpenseCategory {
  _id: string
  name: string
  description?: string
  type: 'material' | 'labor' | 'equipment' | 'transport' | 'other'
}

interface TransactionCategory {
  _id: string
  name: string
  description?: string
  type: string
}

interface ExpenseFormData {
  amount: string
  description: string
  date: string
  projectId: string
  expenseCategoryId: string
  transactionCategoryId: string
  source: string
  paymentMethod: 'cash' | 'bank' | 'cheque' | 'upi' | 'card' | 'other'
  receiptNumber: string
}

interface ExpenseOutputProps {
  userId: string
  onSuccess?: () => void
}

export default function ExpenseOutput({ userId, onSuccess }: ExpenseOutputProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    expenseCategoryId: '',
    transactionCategoryId: '',
    source: '',
    paymentMethod: 'cash',
    receiptNumber: ''
  })

  const [projects, setProjects] = useState<Project[]>([])
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
  const [transactionCategories, setTransactionCategories] = useState<TransactionCategory[]>([])
  
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [filteredExpenseCategories, setFilteredExpenseCategories] = useState<ExpenseCategory[]>([])
  const [filteredTransactionCategories, setFilteredTransactionCategories] = useState<TransactionCategory[]>([])
  
  const [projectSearch, setProjectSearch] = useState('')
  const [expenseCategorySearch, setExpenseCategorySearch] = useState('')
  const [transactionCategorySearch, setTransactionCategorySearch] = useState('')
  
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showExpenseCategoryDropdown, setShowExpenseCategoryDropdown] = useState(false)
  const [showTransactionCategoryDropdown, setShowTransactionCategoryDropdown] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [showNewExpenseCategoryForm, setShowNewExpenseCategoryForm] = useState(false)
  const [showNewTransactionCategoryForm, setShowNewTransactionCategoryForm] = useState(false)
  
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [newExpenseCategory, setNewExpenseCategory] = useState({ name: '', description: '', type: 'material' })
  const [newTransactionCategory, setNewTransactionCategory] = useState({ name: '', description: '', type: 'project' })

  const projectInputRef = useRef<HTMLInputElement>(null)
  const expenseCategoryInputRef = useRef<HTMLInputElement>(null)
  const transactionCategoryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(projectSearch.toLowerCase())
    )
    setFilteredProjects(filtered)
  }, [projects, projectSearch])

  useEffect(() => {
    const filtered = expenseCategories.filter(category =>
      category.name.toLowerCase().includes(expenseCategorySearch.toLowerCase())
    )
    setFilteredExpenseCategories(filtered)
  }, [expenseCategories, expenseCategorySearch])

  useEffect(() => {
    const filtered = transactionCategories.filter(category =>
      category.name.toLowerCase().includes(transactionCategorySearch.toLowerCase())
    )
    setFilteredTransactionCategories(filtered)
  }, [transactionCategories, transactionCategorySearch])

  const loadInitialData = async () => {
    try {
      const [projectsResponse, expenseCategoriesResponse, transactionCategoriesResponse] = await Promise.all([
        fetch('/api/admin/accounting/projects'),
        fetch('/api/admin/accounting/expense-categories'),
        fetch('/api/admin/accounting/transaction-categories')
      ])

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.projects || [])
      }

      if (expenseCategoriesResponse.ok) {
        const expenseCategoriesData = await expenseCategoriesResponse.json()
        setExpenseCategories(expenseCategoriesData.categories || [])
      }

      if (transactionCategoriesResponse.ok) {
        const transactionCategoriesData = await transactionCategoriesResponse.json()
        setTransactionCategories(transactionCategoriesData.categories || [])
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    }
  }

  const createNewProject = async () => {
    if (!newProject.name.trim()) return

    try {
      const response = await fetch('/api/admin/accounting/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProject.name.trim(),
          description: newProject.description.trim(),
          status: 'active',
          startDate: new Date().toISOString()
        })
      })

      if (response.ok) {
        const data = await response.json()
        const createdProject = data.project
        
        setProjects(prev => [createdProject, ...prev])
        setFormData(prev => ({ ...prev, projectId: createdProject.id }))
        setProjectSearch(createdProject.name)
        setNewProject({ name: '', description: '' })
        setShowNewProjectForm(false)
        setShowProjectDropdown(false)
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const createNewExpenseCategory = async () => {
    if (!newExpenseCategory.name.trim()) return

    try {
      const response = await fetch('/api/admin/accounting/expense-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newExpenseCategory.name.trim(),
          description: newExpenseCategory.description.trim(),
          type: newExpenseCategory.type
        })
      })

      if (response.ok) {
        const data = await response.json()
        const createdCategory = data.category
        
        setExpenseCategories(prev => [createdCategory, ...prev])
        setFormData(prev => ({ ...prev, expenseCategoryId: createdCategory.id }))
        setExpenseCategorySearch(createdCategory.name)
        setNewExpenseCategory({ name: '', description: '', type: 'material' })
        setShowNewExpenseCategoryForm(false)
        setShowExpenseCategoryDropdown(false)
      }
    } catch (error) {
      console.error('Failed to create expense category:', error)
    }
  }

  const createNewTransactionCategory = async () => {
    if (!newTransactionCategory.name.trim()) return

    try {
      const response = await fetch('/api/admin/accounting/transaction-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTransactionCategory.name.trim(),
          description: newTransactionCategory.description.trim(),
          type: newTransactionCategory.type
        })
      })

      if (response.ok) {
        const data = await response.json()
        const createdCategory = data.category
        
        setTransactionCategories(prev => [createdCategory, ...prev])
        setFormData(prev => ({ ...prev, transactionCategoryId: createdCategory.id }))
        setTransactionCategorySearch(createdCategory.name)
        setNewTransactionCategory({ name: '', description: '', type: 'project' })
        setShowNewTransactionCategoryForm(false)
        setShowTransactionCategoryDropdown(false)
      }
    } catch (error) {
      console.error('Failed to create transaction category:', error)
    }
  }

  const selectProject = (project: Project) => {
    setFormData(prev => ({ ...prev, projectId: project._id }))
    setProjectSearch(project.name)
    setShowProjectDropdown(false)
  }

  const selectExpenseCategory = (category: ExpenseCategory) => {
    setFormData(prev => ({ ...prev, expenseCategoryId: category._id }))
    setExpenseCategorySearch(category.name)
    setShowExpenseCategoryDropdown(false)
  }

  const selectTransactionCategory = (category: TransactionCategory) => {
    setFormData(prev => ({ ...prev, transactionCategoryId: category._id }))
    setTransactionCategorySearch(category.name)
    setShowTransactionCategoryDropdown(false)
  }

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'material': return Package
      case 'labor': return Users
      case 'equipment': return Wrench
      case 'transport': return Truck
      default: return FileText
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Validate required fields
      if (!formData.amount || !formData.description || !formData.transactionCategoryId) {
        setError('Amount, description, and transaction category are required')
        return
      }

      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount')
        return
      }

      const response = await fetch('/api/admin/accounting/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'expense',
          amount: amount,
          description: formData.description.trim(),
          date: formData.date,
          projectId: formData.projectId || undefined,
          expenseCategoryId: formData.expenseCategoryId || undefined,
          transactionCategoryId: formData.transactionCategoryId,
          source: formData.source.trim() || undefined,
          paymentMethod: formData.paymentMethod,
          receiptNumber: formData.receiptNumber.trim() || undefined,
          createdBy: userId
        })
      })

      if (response.ok) {
        setSuccess('Expense recorded successfully!')
        // Reset form
        setFormData({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          projectId: '',
          expenseCategoryId: '',
          transactionCategoryId: '',
          source: '',
          paymentMethod: 'cash',
          receiptNumber: ''
        })
        setProjectSearch('')
        setExpenseCategorySearch('')
        setTransactionCategorySearch('')
        
        if (onSuccess) {
          onSuccess()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to record expense')
      }
    } catch (error) {
      console.error('Submit error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-red-100 p-2 rounded-lg">
          <TrendingDown className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Record Expense</h2>
          <p className="text-sm text-gray-600">Add new expense or cost entry</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount & Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
              placeholder="e.g., Purchased 10 tons of sand for foundation work"
              required
            />
          </div>
        </div>

        {/* Project Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={projectInputRef}
              type="text"
              value={projectSearch}
              onChange={(e) => {
                setProjectSearch(e.target.value)
                setShowProjectDropdown(true)
              }}
              onFocus={() => setShowProjectDropdown(true)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="Search or create project..."
            />
            <button
              type="button"
              onClick={() => setShowNewProjectForm(true)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-red-600 hover:text-red-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Project Dropdown */}
          {showProjectDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <button
                    key={project._id}
                    type="button"
                    onClick={() => selectProject(project)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{project.name}</div>
                    {project.description && (
                      <div className="text-sm text-gray-600">{project.description}</div>
                    )}
                  </button>
                ))
              ) : projectSearch ? (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No projects found. Click + to create &quot;{projectSearch}&quot;
                </div>
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  Start typing to search projects
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expense Category Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expense Category (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={expenseCategoryInputRef}
              type="text"
              value={expenseCategorySearch}
              onChange={(e) => {
                setExpenseCategorySearch(e.target.value)
                setShowExpenseCategoryDropdown(true)
              }}
              onFocus={() => setShowExpenseCategoryDropdown(true)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="Search or create expense category (e.g., Sand, Cement, Labor)..."
            />
            <button
              type="button"
              onClick={() => setShowNewExpenseCategoryForm(true)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-red-600 hover:text-red-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Expense Category Dropdown */}
          {showExpenseCategoryDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredExpenseCategories.length > 0 ? (
                filteredExpenseCategories.map((category) => {
                  const IconComponent = getCategoryIcon(category.type)
                  return (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => selectExpenseCategory(category)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <IconComponent className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-600 capitalize">{category.type}</div>
                        </div>
                      </div>
                    </button>
                  )
                })
              ) : expenseCategorySearch ? (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No categories found. Click + to create &quot;{expenseCategorySearch}&quot;
                </div>
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  Start typing to search expense categories
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transaction Category Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={transactionCategoryInputRef}
              type="text"
              value={transactionCategorySearch}
              onChange={(e) => {
                setTransactionCategorySearch(e.target.value)
                setShowTransactionCategoryDropdown(true)
              }}
              onFocus={() => setShowTransactionCategoryDropdown(true)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="Search or create transaction category..."
              required
            />
            <button
              type="button"
              onClick={() => setShowNewTransactionCategoryForm(true)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-red-600 hover:text-red-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Transaction Category Dropdown */}
          {showTransactionCategoryDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredTransactionCategories.length > 0 ? (
                filteredTransactionCategories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => selectTransactionCategory(category)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{category.type}</div>
                  </button>
                ))
              ) : transactionCategorySearch ? (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No categories found. Click + to create &quot;{transactionCategorySearch}&quot;
                </div>
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  Start typing to search categories
                </div>
              )}
            </div>
          )}
        </div>

        {/* Source & Payment Method Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor/Supplier (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="e.g., ABC Suppliers, XYZ Hardware"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as ExpenseFormData['paymentMethod'] }))}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                required
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Receipt Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receipt/Invoice Number (Optional)
          </label>
          <input
            type="text"
            value={formData.receiptNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="e.g., INV-001, RCT-123"
          />
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Recording Expense...
            </div>
          ) : (
            <div className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Record Expense
            </div>
          )}
        </button>
      </form>

      {/* New Project Modal */}
      {showNewProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Project name"
                autoFocus
              />
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                placeholder="Project description (optional)"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={createNewProject}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProjectForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Expense Category Modal */}
      {showNewExpenseCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Expense Category</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newExpenseCategory.name}
                onChange={(e) => setNewExpenseCategory(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Category name (e.g., Sand, Cement, Labor)"
                autoFocus
              />
              <select
                value={newExpenseCategory.type}
                onChange={(e) => setNewExpenseCategory(prev => ({ ...prev, type: e.target.value as 'material' | 'labor' | 'equipment' | 'transport' | 'other' }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="material">Material</option>
                <option value="labor">Labor</option>
                <option value="equipment">Equipment</option>
                <option value="transport">Transport</option>
                <option value="other">Other</option>
              </select>
              <textarea
                value={newExpenseCategory.description}
                onChange={(e) => setNewExpenseCategory(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                placeholder="Category description (optional)"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={createNewExpenseCategory}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewExpenseCategoryForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Transaction Category Modal */}
      {showNewTransactionCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Transaction Category</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newTransactionCategory.name}
                onChange={(e) => setNewTransactionCategory(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Category name"
                autoFocus
              />
              <select
                value={newTransactionCategory.type}
                onChange={(e) => setNewTransactionCategory(prev => ({ ...prev, type: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="project">Project Expense</option>
                <option value="business">Business Expense</option>
                <option value="personal">Personal Expense</option>
                <option value="operational">Operational Expense</option>
              </select>
              <textarea
                value={newTransactionCategory.description}
                onChange={(e) => setNewTransactionCategory(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                placeholder="Category description (optional)"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={createNewTransactionCategory}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTransactionCategoryForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {(showProjectDropdown || showExpenseCategoryDropdown || showTransactionCategoryDropdown) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowProjectDropdown(false)
            setShowExpenseCategoryDropdown(false)
            setShowTransactionCategoryDropdown(false)
          }}
        />
      )}
    </div>
  )
}