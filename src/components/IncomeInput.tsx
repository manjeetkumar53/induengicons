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
  TrendingUp,
  Save
} from 'lucide-react'

interface Project {
  _id: string
  name: string
  description?: string
  status: string
}

interface TransactionCategory {
  _id: string
  name: string
  description?: string
  type: string
}

interface IncomeFormData {
  amount: string
  description: string
  date: string
  projectId: string
  transactionCategoryId: string
  source: string
  paymentMethod: 'cash' | 'bank' | 'cheque' | 'upi' | 'card' | 'other'
  receiptNumber: string
}

interface IncomeInputProps {
  userId: string
  onSuccess?: () => void
}

export default function IncomeInput({ userId, onSuccess }: IncomeInputProps) {
  const [formData, setFormData] = useState<IncomeFormData>({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    projectId: '',
    transactionCategoryId: '',
    source: '',
    paymentMethod: 'cash',
    receiptNumber: ''
  })

  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<TransactionCategory[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [filteredCategories, setFilteredCategories] = useState<TransactionCategory[]>([])
  
  const [projectSearch, setProjectSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [newCategory, setNewCategory] = useState({ name: '', description: '', type: 'business' })

  const projectInputRef = useRef<HTMLInputElement>(null)
  const categoryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    // Filter projects based on search
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(projectSearch.toLowerCase())
    )
    setFilteredProjects(filtered)
  }, [projects, projectSearch])

  useEffect(() => {
    // Filter categories based on search
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    )
    setFilteredCategories(filtered)
  }, [categories, categorySearch])

  const loadInitialData = async () => {
    try {
      const [projectsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/admin/accounting/projects'),
        fetch('/api/admin/accounting/transaction-categories')
      ])

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.projects || [])
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories || [])
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

  const createNewCategory = async () => {
    if (!newCategory.name.trim()) return

    try {
      const response = await fetch('/api/admin/accounting/transaction-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name.trim(),
          description: newCategory.description.trim(),
          type: newCategory.type
        })
      })

      if (response.ok) {
        const data = await response.json()
        const createdCategory = data.category
        
        setCategories(prev => [createdCategory, ...prev])
        setFormData(prev => ({ ...prev, transactionCategoryId: createdCategory.id }))
        setCategorySearch(createdCategory.name)
        setNewCategory({ name: '', description: '', type: 'business' })
        setShowNewCategoryForm(false)
        setShowCategoryDropdown(false)
      }
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const selectProject = (project: Project) => {
    setFormData(prev => ({ ...prev, projectId: project._id }))
    setProjectSearch(project.name)
    setShowProjectDropdown(false)
  }

  const selectCategory = (category: TransactionCategory) => {
    setFormData(prev => ({ ...prev, transactionCategoryId: category._id }))
    setCategorySearch(category.name)
    setShowCategoryDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Validate required fields
      if (!formData.amount || !formData.description || !formData.transactionCategoryId) {
        setError('Amount, description, and category are required')
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
        credentials: 'include',
        body: JSON.stringify({
          type: 'income',
          amount: amount,
          description: formData.description.trim(),
          date: formData.date,
          projectId: formData.projectId || undefined,
          transactionCategoryId: formData.transactionCategoryId,
          source: formData.source.trim() || undefined,
          paymentMethod: formData.paymentMethod,
          receiptNumber: formData.receiptNumber.trim() || undefined,
          createdBy: userId
        })
      })

      if (response.ok) {
        setSuccess('Income recorded successfully!')
        // Reset form
        setFormData({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          projectId: '',
          transactionCategoryId: '',
          source: '',
          paymentMethod: 'cash',
          receiptNumber: ''
        })
        setProjectSearch('')
        setCategorySearch('')
        
        if (onSuccess) {
          onSuccess()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to record income')
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
        <div className="bg-green-100 p-2 rounded-lg">
          <TrendingUp className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Record Income</h2>
          <p className="text-sm text-gray-600">Add new income or revenue entry</p>
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
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
              placeholder="e.g., Payment received from ABC Company for project milestone"
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
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Search or create project..."
            />
            <button
              type="button"
              onClick={() => setShowNewProjectForm(true)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-600 hover:text-green-700"
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

        {/* Category Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={categoryInputRef}
              type="text"
              value={categorySearch}
              onChange={(e) => {
                setCategorySearch(e.target.value)
                setShowCategoryDropdown(true)
              }}
              onFocus={() => setShowCategoryDropdown(true)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Search or create category..."
              required
            />
            <button
              type="button"
              onClick={() => setShowNewCategoryForm(true)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-600 hover:text-green-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Category Dropdown */}
          {showCategoryDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => selectCategory(category)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{category.type}</div>
                  </button>
                ))
              ) : categorySearch ? (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No categories found. Click + to create &quot;{categorySearch}&quot;
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
              Source (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="e.g., ABC Company, John Doe"
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
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as IncomeFormData['paymentMethod'] }))}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
            Receipt Number (Optional)
          </label>
          <input
            type="text"
            value={formData.receiptNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            placeholder="e.g., RCT-001, INV-123"
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
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Recording Income...
            </div>
          ) : (
            <div className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Record Income
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Project name"
                autoFocus
              />
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                placeholder="Project description (optional)"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={createNewProject}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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

      {/* New Category Modal */}
      {showNewCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Category</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Category name"
                autoFocus
              />
              <select
                value={newCategory.type}
                onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="project">Project Income</option>
                <option value="business">Business Income</option>
                <option value="personal">Personal Income</option>
                <option value="operational">Operational Income</option>
              </select>
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                placeholder="Category description (optional)"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={createNewCategory}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryForm(false)}
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
      {(showProjectDropdown || showCategoryDropdown) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowProjectDropdown(false)
            setShowCategoryDropdown(false)
          }}
        />
      )}
    </div>
  )
}