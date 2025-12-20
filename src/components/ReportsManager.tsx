'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Target,
  Building2,
  PieChart,
  BarChart3,
  Search,
  RefreshCw,
  ArrowUpDown,
  DollarSign
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
  type: string
}

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  projectId?: string
  projectName?: string
  expenseCategoryId?: string
  expenseCategoryName?: string
  transactionCategoryId?: string
  transactionCategoryName?: string
  source?: string
  paymentMethod?: string
  receiptNumber?: string
  createdBy: string
}

interface Allocation {
  id: string
  sourceTransactionId: string
  targetProjectId: string
  amount: number
  percentage?: number
  description: string
  date: string
  sourceDescription?: string
  targetProjectName?: string
}

interface ReportFilters {
  startDate: string
  endDate: string
  projectId: string
  transactionType: 'all' | 'income' | 'expense'
  expenseCategoryId: string
  transactionCategoryId: string
  paymentMethod: string
}

interface ReportStats {
  totalIncome: number
  totalExpense: number
  netAmount: number
  transactionCount: number
  projectCount: number
  allocatedAmount: number
}



export default function ReportsManager() {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    projectId: '',
    transactionType: 'all',
    expenseCategoryId: '',
    transactionCategoryId: '',
    paymentMethod: ''
  })

  const [projects, setProjects] = useState<Project[]>([])
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([])
  const [transactionCategories, setTransactionCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allocations, setAllocations] = useState<Allocation[]>([])

  const [reportStats, setReportStats] = useState<ReportStats>({
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    transactionCount: 0,
    projectCount: 0,
    allocatedAmount: 0
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('summary')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'project'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    generateReport()
  }, [filters])

  const loadInitialData = async () => {
    setIsLoading(true)
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

      await generateReport()
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async () => {
    setIsGenerating(true)
    try {
      // Build query parameters
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const [transactionsResponse, allocationsResponse] = await Promise.all([
        fetch(`/api/admin/accounting/reports?${params.toString()}`),
        fetch('/api/admin/accounting/allocations')
      ])

      if (transactionsResponse.ok) {
        const data = await transactionsResponse.json()
        setTransactions(data.transactions || [])
        setReportStats(data.stats || reportStats)
      }

      if (allocationsResponse.ok) {
        const allocationsData = await allocationsResponse.json()
        const filteredAllocations = (allocationsData.allocations || []).filter((allocation: Allocation) => {
          const allocationDate = new Date(allocation.date)
          const startDate = new Date(filters.startDate)
          const endDate = new Date(filters.endDate)

          return allocationDate >= startDate && allocationDate <= endDate &&
            (!filters.projectId || allocation.targetProjectId === filters.projectId)
        })

        setAllocations(filteredAllocations)

        // Update allocated amount in stats
        const totalAllocated = filteredAllocations.reduce((sum: number, allocation: Allocation) => sum + allocation.amount, 0)
        setReportStats(prev => ({ ...prev, allocatedAmount: totalAllocated }))
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      projectId: '',
      transactionType: 'all',
      expenseCategoryId: '',
      transactionCategoryId: '',
      paymentMethod: ''
    })
  }

  const exportReport = () => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Description', 'Project', 'Category', 'Payment Method'].join(','),
      ...transactions.map(transaction => [
        new Date(transaction.date).toLocaleDateString(),
        transaction.type,
        transaction.amount,
        `"${transaction.description.replace(/"/g, '""')}"`,
        transaction.projectName || '',
        transaction.transactionCategoryName || '',
        transaction.paymentMethod || ''
      ].join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `accounting-report-${filters.startDate}-to-${filters.endDate}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }



  const filteredTransactions = transactions.filter(transaction =>
    searchTerm === '' ||
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transactionCategoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case 'amount':
        aValue = a.amount
        bValue = b.amount
        break
      case 'project':
        aValue = a.projectName || ''
        bValue = b.projectName || ''
        break
      default:
        aValue = new Date(a.date)
        bValue = new Date(b.date)
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const projectSummary = projects.map(project => {
    const projectTransactions = transactions.filter(t => t.projectId === project._id)
    const projectAllocations = allocations.filter(a => a.targetProjectId === project._id)

    const income = projectTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = projectTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const allocated = projectAllocations.reduce((sum, a) => sum + a.amount, 0)

    return {
      project,
      income,
      expense,
      allocated,
      net: income - expense + allocated,
      transactionCount: projectTransactions.length
    }
  }).filter(p => p.transactionCount > 0 || p.allocated > 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Financial Reports</h2>
            <p className="text-sm text-gray-600">Loading report data...</p>
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
          <div className="bg-purple-100 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Financial Reports</h2>
            <p className="text-sm text-gray-600">Comprehensive financial analysis and reporting</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={resetFilters}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </button>
          <button
            onClick={exportReport}
            disabled={transactions.length === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
          {isGenerating && (
            <div className="ml-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={filters.projectId}
              onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <select
              value={filters.transactionType}
              onChange={(e) => setFilters(prev => ({ ...prev, transactionType: e.target.value as any }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          {/* Category Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Category</label>
            <select
              value={filters.expenseCategoryId}
              onChange={(e) => setFilters(prev => ({ ...prev, expenseCategoryId: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="">All Categories</option>
              {expenseCategories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Category</label>
            <select
              value={filters.transactionCategoryId}
              onChange={(e) => setFilters(prev => ({ ...prev, transactionCategoryId: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="">All Categories</option>
              {transactionCategories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="">All Methods</option>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{reportStats.totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expense</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{reportStats.totalExpense.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${reportStats.netAmount >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <DollarSign className={`h-6 w-6 ${reportStats.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Amount</p>
              <p className={`text-2xl font-semibold ${reportStats.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ₹{reportStats.netAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Allocated</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{reportStats.allocatedAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'summary', name: 'Summary', icon: PieChart },
              { id: 'transactions', name: 'Transactions', icon: BarChart3 },
              { id: 'projects', name: 'Projects', icon: Building2 },
              { id: 'allocations', name: 'Allocations', icon: Target }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'dashboard' | 'profit-loss' | 'cash-flow' | 'transactions' | 'income-sources' | 'expense-categories')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expense Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <PieChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Income vs Expense</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Income:</span>
                      <span className="font-medium">₹{reportStats.totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Expense:</span>
                      <span className="font-medium">₹{reportStats.totalExpense.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-gray-900 font-medium">Net:</span>
                      <span className={`font-bold ${reportStats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{reportStats.netAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Monthly Trend Placeholder */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Period Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Transactions:</span>
                      <span className="font-medium">{reportStats.transactionCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active Projects:</span>
                      <span className="font-medium">{reportStats.projectCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Allocated Funds:</span>
                      <span className="font-medium">₹{reportStats.allocatedAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    placeholder="Search transactions..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'project')}
                    className="block px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="project">Sort by Project</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">
                    {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                  </h4>
                </div>

                {filteredTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {transaction.type === 'income' ? (
                                  <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                                )}
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === 'income'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}>
                                  {transaction.type.toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="max-w-xs truncate" title={transaction.description}>
                                {transaction.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.projectName || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.transactionCategoryName || transaction.expenseCategoryName || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                {transaction.paymentMethod?.toUpperCase() || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="max-w-xs truncate" title={transaction.source}>
                                {transaction.source || '-'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No transactions found matching the current filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">
                    {projectSummary.length} project{projectSummary.length !== 1 ? 's' : ''} with activity
                  </h4>
                </div>

                {projectSummary.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {projectSummary.map((item) => (
                      <div key={item.project._id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.project.name}</h4>
                            {item.project.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.project.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${item.net >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                              ₹{item.net.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Net Position</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Income</div>
                            <div className="font-medium text-green-600">₹{item.income.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Expense</div>
                            <div className="font-medium text-red-600">₹{item.expense.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Allocated</div>
                            <div className="font-medium text-purple-600">₹{item.allocated.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Transactions</div>
                            <div className="font-medium text-gray-900">{item.transactionCount}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No projects found with financial activity in the selected period.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Allocations Tab */}
          {activeTab === 'allocations' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">
                    {allocations.length} allocation{allocations.length !== 1 ? 's' : ''} found
                  </h4>
                </div>

                {allocations.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {allocations.map((allocation) => (
                      <div key={allocation.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Target className="h-4 w-4 text-purple-600" />
                              <h4 className="font-medium text-gray-900">{allocation.description}</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">From:</span> {allocation.sourceDescription || 'Income Source'}
                              </div>
                              <div>
                                <span className="font-medium">To:</span> {allocation.targetProjectName || 'Project'}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {new Date(allocation.date).toLocaleDateString()}
                              </div>
                              {allocation.percentage && (
                                <div>
                                  <span className="font-medium">Percentage:</span> {allocation.percentage}%
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-600">
                              ₹{allocation.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Allocated</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No allocations found in the selected period.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}