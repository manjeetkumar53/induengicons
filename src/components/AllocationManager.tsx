'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Plus, 
  Calendar, 
  Building2, 
  DollarSign,
  Target,
  ArrowRight,
  Percent,
  Check,
  Save,
  Trash2,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react'

interface Project {
  _id: string
  name: string
  description?: string
  status: string
}

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  projectId?: string
  allocatedAmount?: number
  remainingAmount?: number
}

interface Allocation {
  id: string
  sourceTransactionId: string
  targetProjectId: string
  amount: number
  percentage?: number
  description: string
  date: string
  createdBy: string
  sourceDescription?: string
  targetProjectName?: string
}

interface AllocationFormData {
  sourceTransactionId: string
  targetProjectId: string
  amount: string
  percentage: string
  description: string
  date: string
  allocationType: 'amount' | 'percentage'
}

interface AllocationManagerProps {
  userId: string
  onSuccess?: () => void
}

export default function AllocationManager({ userId, onSuccess }: AllocationManagerProps) {
  const [formData, setFormData] = useState<AllocationFormData>({
    sourceTransactionId: '',
    targetProjectId: '',
    amount: '',
    percentage: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    allocationType: 'amount'
  })

  const [projects, setProjects] = useState<Project[]>([])
  const [incomeTransactions, setIncomeTransactions] = useState<Transaction[]>([])
  const [allocations, setAllocations] = useState<Allocation[]>([])
  
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  
  const [projectSearch, setProjectSearch] = useState('')
  const [transactionSearch, setTransactionSearch] = useState('')
  
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showTransactionDropdown, setShowTransactionDropdown] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [viewMode, setViewMode] = useState<'form' | 'list'>('form')

  const projectInputRef = useRef<HTMLInputElement>(null)
  const transactionInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(projectSearch.toLowerCase())
    )
    setFilteredProjects(filtered)
  }, [projects, projectSearch])

  useEffect(() => {
    const filtered = incomeTransactions.filter(transaction =>
      transaction.description.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      (transaction.remainingAmount && transaction.remainingAmount > 0)
    )
    setFilteredTransactions(filtered)
  }, [incomeTransactions, transactionSearch])

  const loadInitialData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [projectsResponse, transactionsResponse, allocationsResponse] = await Promise.all([
        fetch('/api/admin/accounting/projects'),
        fetch('/api/admin/accounting/transactions?type=income'),
        fetch('/api/admin/accounting/allocations')
      ])

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.projects || [])
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        const transactions = transactionsData.transactions || []
        
        // Calculate remaining amounts for each transaction
        const transactionsWithRemaining = transactions.map((transaction: Transaction) => ({
          ...transaction,
          allocatedAmount: 0, // Will be calculated from allocations
          remainingAmount: transaction.amount // Will be updated after loading allocations
        }))
        
        setIncomeTransactions(transactionsWithRemaining)
      }

      if (allocationsResponse.ok) {
        const allocationsData = await allocationsResponse.json()
        setAllocations(allocationsData.allocations || [])
        
        // Update remaining amounts based on allocations
        updateRemainingAmounts(allocationsData.allocations || [])
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
      setError('Failed to load data. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const updateRemainingAmounts = (allocations: Allocation[]) => {
    setIncomeTransactions(prev => prev.map(transaction => {
      const transactionAllocations = allocations.filter(
        allocation => allocation.sourceTransactionId === transaction.id
      )
      const allocatedAmount = transactionAllocations.reduce(
        (sum, allocation) => sum + allocation.amount, 0
      )
      return {
        ...transaction,
        allocatedAmount,
        remainingAmount: transaction.amount - allocatedAmount
      }
    }))
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
        setFormData(prev => ({ ...prev, targetProjectId: createdProject._id }))
        setProjectSearch(createdProject.name)
        setNewProject({ name: '', description: '' })
        setShowNewProjectForm(false)
        setShowProjectDropdown(false)
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const selectProject = (project: Project) => {
    setFormData(prev => ({ ...prev, targetProjectId: project._id }))
    setProjectSearch(project.name)
    setShowProjectDropdown(false)
  }

  const selectTransaction = (transaction: Transaction) => {
    setFormData(prev => ({ ...prev, sourceTransactionId: transaction.id }))
    setTransactionSearch(`${transaction.description} (₹${transaction.amount.toLocaleString()})`)
    setSelectedTransaction(transaction)
    setShowTransactionDropdown(false)
    
    // Auto-fill remaining amount if available
    if (transaction.remainingAmount && transaction.remainingAmount > 0) {
      setFormData(prev => ({ 
        ...prev, 
        amount: transaction.remainingAmount?.toString() || '' 
      }))
    }
  }

  const calculateAllocationAmount = () => {
    if (!selectedTransaction) return 0
    
    if (formData.allocationType === 'percentage') {
      const percentage = parseFloat(formData.percentage) || 0
      return (selectedTransaction.amount * percentage) / 100
    } else {
      return parseFloat(formData.amount) || 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Validate required fields
      if (!formData.sourceTransactionId || !formData.targetProjectId || !formData.description) {
        setError('Source transaction, target project, and description are required')
        return
      }

      const allocationAmount = calculateAllocationAmount()
      
      if (!allocationAmount || allocationAmount <= 0) {
        setError('Please enter a valid allocation amount or percentage')
        return
      }

      if (selectedTransaction && allocationAmount > (selectedTransaction.remainingAmount || 0)) {
        setError('Allocation amount cannot exceed remaining amount')
        return
      }

      const response = await fetch('/api/admin/accounting/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceTransactionId: formData.sourceTransactionId,
          targetProjectId: formData.targetProjectId,
          amount: allocationAmount,
          percentage: formData.allocationType === 'percentage' ? parseFloat(formData.percentage) : undefined,
          description: formData.description.trim(),
          date: formData.date,
          createdBy: userId
        })
      })

      if (response.ok) {
        setSuccess('Allocation created successfully!')
        
        // Reset form
        setFormData({
          sourceTransactionId: '',
          targetProjectId: '',
          amount: '',
          percentage: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          allocationType: 'amount'
        })
        setProjectSearch('')
        setTransactionSearch('')
        setSelectedTransaction(null)
        
        // Reload data
        loadInitialData()
        
        if (onSuccess) {
          onSuccess()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create allocation')
      }
    } catch (error) {
      console.error('Submit error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteAllocation = async (allocationId: string) => {
    if (!confirm('Are you sure you want to delete this allocation?')) return

    try {
      const response = await fetch(`/api/admin/accounting/allocations?id=${allocationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Allocation deleted successfully!')
        loadInitialData()
      } else {
        setError('Failed to delete allocation')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('Network error. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Fund Allocation</h2>
            <p className="text-sm text-gray-600">Loading allocation data...</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Fund Allocation</h2>
            <p className="text-sm text-gray-600">Allocate income to specific projects</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('form')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'form' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            New Allocation
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            View Allocations
          </button>
        </div>
      </div>

      {/* Form View */}
      {viewMode === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Source Transaction Selection */}
            <div className="relative mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Income <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={transactionInputRef}
                  type="text"
                  value={transactionSearch}
                  onChange={(e) => {
                    setTransactionSearch(e.target.value)
                    setShowTransactionDropdown(true)
                  }}
                  onFocus={() => setShowTransactionDropdown(true)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Search income transactions..."
                  required
                />
              </div>

              {/* Transaction Dropdown */}
              {showTransactionDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <button
                        key={transaction.id}
                        type="button"
                        onClick={() => selectTransaction(transaction)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{transaction.description}</div>
                            <div className="text-sm text-gray-600">
                              Total: ₹{transaction.amount.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              Available: ₹{(transaction.remainingAmount || 0).toLocaleString()}
                            </div>
                            {transaction.allocatedAmount && transaction.allocatedAmount > 0 && (
                              <div className="text-xs text-gray-500">
                                Allocated: ₹{transaction.allocatedAmount.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No income transactions found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Transaction Info */}
            {selectedTransaction && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-green-900">Selected Income</h4>
                    <p className="text-sm text-green-700 mt-1">{selectedTransaction.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-900">
                      ₹{(selectedTransaction.remainingAmount || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">Available to allocate</div>
                  </div>
                </div>
              </div>
            )}

            {/* Target Project Selection */}
            <div className="relative mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Project <span className="text-red-500">*</span>
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
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Search or create project..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewProjectForm(true)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-700"
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

            {/* Allocation Type Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Allocation Method
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, allocationType: 'amount' }))}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    formData.allocationType === 'amount'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Fixed Amount
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, allocationType: 'percentage' }))}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    formData.allocationType === 'percentage'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Percent className="h-4 w-4 mr-2" />
                  Percentage
                </button>
              </div>
            </div>

            {/* Amount/Percentage Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {formData.allocationType === 'amount' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allocation Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedTransaction?.remainingAmount || undefined}
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allocation Percentage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0.0"
                      required
                    />
                  </div>
                </div>
              )}

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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Calculated Amount Preview */}
            {selectedTransaction && (formData.amount || formData.percentage) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Allocation Preview</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {formData.allocationType === 'percentage' 
                        ? `${formData.percentage}% of ₹${selectedTransaction.amount.toLocaleString()}`
                        : `Fixed amount`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-900">
                      ₹{calculateAllocationAmount().toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600">Will be allocated</div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="e.g., Allocating funds for foundation work, Equipment purchase allocation..."
                  required
                />
              </div>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  {success}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Allocation...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Create Allocation
                </div>
              )}
            </button>
          </div>
        </form>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Allocations</h3>
            <p className="text-sm text-gray-600 mt-1">
              {allocations.length} allocation{allocations.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {allocations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {allocations.map((allocation) => (
                <div key={allocation.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="bg-blue-100 p-1 rounded">
                          <ArrowRight className="h-3 w-3 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">{allocation.description}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <div className="font-medium">From:</div>
                          <div>{allocation.sourceDescription || 'Income Source'}</div>
                        </div>
                        <div>
                          <div className="font-medium">To:</div>
                          <div>{allocation.targetProjectName || 'Project'}</div>
                        </div>
                        <div>
                          <div className="font-medium">Amount:</div>
                          <div className="text-lg font-bold text-blue-600">
                            ₹{allocation.amount.toLocaleString()}
                            {allocation.percentage && (
                              <span className="text-sm text-gray-500 ml-1">
                                ({allocation.percentage}%)
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Date:</div>
                          <div>{new Date(allocation.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteAllocation(allocation.id)}
                      className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Allocations Yet</h3>
              <p className="text-gray-600 mb-4">Start by creating your first fund allocation.</p>
              <button
                onClick={() => setViewMode('form')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Allocation
              </button>
            </div>
          )}
        </div>
      )}

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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Project name"
                autoFocus
              />
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Project description (optional)"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={createNewProject}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

      {/* Click outside handlers */}
      {(showProjectDropdown || showTransactionDropdown) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowProjectDropdown(false)
            setShowTransactionDropdown(false)
          }}
        />
      )}
    </div>
  )
}