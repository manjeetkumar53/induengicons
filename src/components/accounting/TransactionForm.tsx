'use client'

import { useState, useEffect } from 'react'
import { 
  Save, 
  X, 
  Search, 
  Calendar, 
  User, 
  Building2, 
  DollarSign, 
  CreditCard,
  FileText,
  Check,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface Project {
  _id: string
  name: string
  description?: string
  status: string
}

interface Category {
  _id: string
  name: string
  description?: string
  type: string
}

interface Transaction {
  _id?: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  projectId?: string
  categoryId?: string
  source?: string
  paymentMethod: 'cash' | 'bank' | 'cheque' | 'upi' | 'card' | 'other'
  receiptNumber?: string
}

interface TransactionFormProps {
  type: 'income' | 'expense'
  transaction?: Transaction | null
  isOpen: boolean
  onSave: () => void
  onCancel: () => void
}

export default function TransactionForm({ 
  type, 
  transaction, 
  isOpen, 
  onSave, 
  onCancel 
}: TransactionFormProps) {
  const [formData, setFormData] = useState<{
    amount: string
    description: string
    date: string
    projectId: string
    categoryId: string
    source: string
    paymentMethod: 'cash' | 'bank' | 'cheque' | 'upi' | 'card' | 'other'
    receiptNumber: string
  }>({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    categoryId: '',
    source: '',
    paymentMethod: 'cash',
    receiptNumber: ''
  })

  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  
  const [projectSearch, setProjectSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  


  // Load data when component mounts or type changes
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen, type])

  // Populate form when editing
  useEffect(() => {
    if (transaction && transaction._id) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date,
        projectId: transaction.projectId || '',
        categoryId: transaction.categoryId || '',
        source: transaction.source || '',
        paymentMethod: transaction.paymentMethod,
        receiptNumber: transaction.receiptNumber || ''
      })
    } else {
      // Reset form for new transaction
      setFormData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        projectId: '',
        categoryId: '',
        source: '',
        paymentMethod: 'cash',
        receiptNumber: ''
      })
    }
    setError('')
    setSuccess('')
  }, [transaction, isOpen])

  // Filter projects and categories
  useEffect(() => {
    setFilteredProjects(
      projects.filter(project =>
        project.name.toLowerCase().includes(projectSearch.toLowerCase())
      )
    )
  }, [projects, projectSearch])

  useEffect(() => {
    setFilteredCategories(
      categories.filter(category =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
        category.type === (type === 'income' ? 'business' : 'material')
      )
    )
  }, [categories, categorySearch, type])

  const loadInitialData = async () => {
    try {
      const [projectsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/accounting/projects'),
        fetch('/api/admin/accounting/transaction-categories')
      ])

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData.projects)
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        // Filter categories based on transaction type if needed
        const filteredCategories = type === 'income' 
          ? categoriesData.categories.filter((cat: Category) => cat.type === 'revenue')
          : categoriesData.categories.filter((cat: Category) => cat.type === 'expense')
        setCategories(filteredCategories.length > 0 ? filteredCategories : categoriesData.categories)
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.amount || !formData.description) {
      setError('Amount and description are required')
      return
    }

    setIsSubmitting(true)

    try {
      const url = transaction?._id 
        ? `/api/admin/accounting/transactions/${transaction._id}`
        : '/api/admin/accounting/transactions'
      
      const method = transaction?._id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type,
          amount: parseFloat(formData.amount),
          // Map categoryId to transactionCategoryId for API compatibility
          transactionCategoryId: formData.categoryId,
          categoryId: undefined // Remove the old field
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save transaction')
      }

      setSuccess(`${type === 'income' ? 'Income' : 'Expense'} ${transaction?._id ? 'updated' : 'recorded'} successfully!`)
      
      setTimeout(() => {
        onSave()
      }, 1000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectProject = (project: Project) => {
    setFormData(prev => ({ ...prev, projectId: project._id }))
    setProjectSearch(project.name)
    setShowProjectDropdown(false)
  }

  const selectCategory = (category: Category) => {
    setFormData(prev => ({ ...prev, categoryId: category._id }))
    setCategorySearch(category.name)
    setShowCategoryDropdown(false)
  }

  if (!isOpen) {
    return null
  }

  const colorClasses = type === 'income' 
    ? {
        gradient: 'from-green-500 to-emerald-600',
        light: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-700',
        bg: 'bg-green-50',
        button: 'bg-green-600 hover:bg-green-700'
      }
    : {
        gradient: 'from-red-500 to-pink-600',
        light: 'from-red-50 to-pink-50',
        border: 'border-red-200',
        text: 'text-red-700',
        bg: 'bg-red-50',
        button: 'bg-red-600 hover:bg-red-700'
      }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`p-6 bg-gradient-to-r ${colorClasses.light} border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${colorClasses.gradient} rounded-xl flex items-center justify-center`}>
              {type === 'income' ? (
                <TrendingUp className="h-5 w-5 text-white" />
              ) : (
                <TrendingDown className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {transaction?._id ? 'Edit' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
              </h3>
              <p className="text-sm text-gray-600">
                {transaction?._id ? 'Update transaction details' : `Record new ${type}`}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800">Success</h4>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Amount and Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-lg font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Description *
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={`Enter ${type} description`}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            required
          />
        </div>

        {/* Source and Receipt Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              {type === 'income' ? 'Source' : 'Vendor/Supplier'}
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              placeholder={type === 'income' ? 'From whom' : 'Paid to whom'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Receipt/Invoice Number
            </label>
            <input
              type="text"
              value={formData.receiptNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
              placeholder="Reference number"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <CreditCard className="inline h-4 w-4 mr-1" />
            Payment Method
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'bank' | 'cheque' | 'upi' | 'card' | 'other' }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
          >
            <option value="cash">💰 Cash</option>
            <option value="bank">🏦 Bank Transfer</option>
            <option value="cheque">📄 Cheque</option>
            <option value="upi">📱 UPI</option>
            <option value="card">💳 Card</option>
            <option value="other">🔄 Other</option>
          </select>
        </div>

        {/* Project Selection */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Building2 className="inline h-4 w-4 mr-1" />
            Project (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={projectSearch}
              onChange={(e) => {
                setProjectSearch(e.target.value)
                setShowProjectDropdown(true)
              }}
              onFocus={() => setShowProjectDropdown(true)}
              placeholder="Search or select project..."
              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            
            {showProjectDropdown && filteredProjects.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {filteredProjects.map((project) => (
                  <button
                    key={project._id}
                    type="button"
                    onClick={() => selectProject(project)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{project.name}</div>
                    {project.description && (
                      <div className="text-sm text-gray-600">{project.description}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Selection */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Category (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => {
                setCategorySearch(e.target.value)
                setShowCategoryDropdown(true)
              }}
              onFocus={() => setShowCategoryDropdown(true)}
              placeholder="Search or select category..."
              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            
            {showCategoryDropdown && filteredCategories.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {filteredCategories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => selectCategory(category)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-gray-600">{category.description}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses.button} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {transaction?._id ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                {transaction?._id ? 'Update' : 'Save'} {type === 'income' ? 'Income' : 'Expense'}
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}