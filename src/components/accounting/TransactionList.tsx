'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Edit,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react'

interface Transaction {
  _id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  projectId?: string
  categoryId?: string
  source?: string
  paymentMethod: 'cash' | 'bank' | 'cheque' | 'upi' | 'card' | 'other'
  receiptNumber?: string
  createdAt: string
  updatedAt?: string
  // Populated fields
  project?: {
    _id: string
    name: string
  }
  category?: {
    _id: string  
    name: string
  }
}

interface TransactionListProps {
  type: 'income' | 'expense'
  transactions: Transaction[]
  isLoading: boolean
  totalCount: number
  currentPage: number
  totalPages: number
  searchQuery: string
  onSearchChange: (query: string) => void
  onPageChange: (page: number) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (transactionId: string) => void
  onDuplicate: (transaction: Transaction) => void
  onClearFilters: () => void
  dateRange: { start: string; end: string }
  onDateRangeChange: (range: { start: string; end: string }) => void
  selectedProject: string
  onProjectChange: (projectId: string) => void
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

export default function TransactionList({
  type,
  transactions,
  isLoading,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
  onSearchChange,
  onPageChange,
  onEdit,
  onDelete,
  onDuplicate,
  onClearFilters,
  dateRange,
  onDateRangeChange,
  selectedProject,
  onProjectChange,
  selectedCategory,
  onCategoryChange
}: TransactionListProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Payment method display mapping
  const paymentMethodLabels = {
    cash: '💰 Cash',
    bank: '🏦 Bank',
    cheque: '📄 Cheque',
    upi: '📱 UPI',
    card: '💳 Card',
    other: '🔄 Other'
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(transactions.map(t => t._id))
    }
    setSelectAll(!selectAll)
  }

  const toggleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId)
      } else {
        return [...prev, transactionId]
      }
    })
  }

  const hasActiveFilters = searchQuery || dateRange.start || dateRange.end || selectedProject || selectedCategory

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {type === 'income' ? 'Income' : 'Expense'} Transactions
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {totalCount} transaction{totalCount !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters || hasActiveFilters
                    ? type === 'income' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions, descriptions, sources..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => onProjectChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="">All Projects</option>
                    {/* Project options will be populated dynamically */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="">All Categories</option>
                    {/* Category options will be populated dynamically */}
                  </select>
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Active filters applied</span>
                  <button
                    onClick={onClearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedTransactions.length > 0 && (
          <div className="p-4 bg-indigo-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">
                {selectedTransactions.length} transaction{selectedTransactions.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                  Bulk Edit
                </button>
                <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedTransactions([])
                    setSelectAll(false)
                  }}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction List */}
        <div className="divide-y divide-gray-100">
          {/* Header Row */}
          <div className="p-4 bg-gray-50 text-sm font-medium text-gray-600">
            <div className="flex items-center">
              <div className="w-8">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="flex-1 grid grid-cols-12 gap-4">
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Payment</div>
                <div className="col-span-2">Project/Category</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
          </div>

          {/* Transaction Rows */}
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-3 text-gray-500">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                <span>Loading transactions...</span>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {type === 'income' ? (
                  <TrendingUp className={`h-8 w-8 ${type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {type} transactions found
              </h3>
              <p className="text-gray-600">
                {hasActiveFilters 
                  ? 'Try adjusting your search criteria or filters'
                  : `Start by adding your first ${type} transaction`
                }
              </p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-8">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction._id)}
                      onChange={() => toggleSelectTransaction(transaction._id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    {/* Description */}
                    <div className="col-span-3">
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      {transaction.source && (
                        <p className="text-sm text-gray-600">from {transaction.source}</p>
                      )}
                      {transaction.receiptNumber && (
                        <p className="text-xs text-gray-500">#{transaction.receiptNumber}</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="col-span-2">
                      <p className={`font-bold ${
                        type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <p className="text-sm text-gray-900">{formatDate(transaction.date)}</p>
                    </div>

                    {/* Payment Method */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {paymentMethodLabels[transaction.paymentMethod]}
                      </span>
                    </div>

                    {/* Project/Category */}
                    <div className="col-span-2">
                      {transaction.project && (
                        <p className="text-sm text-blue-600">{transaction.project.name}</p>
                      )}
                      {transaction.category && (
                        <p className="text-xs text-gray-500">{transaction.category.name}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(transaction)}
                          className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit transaction"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDuplicate(transaction)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Duplicate transaction"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(transaction._id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} • {totalCount} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page = i + 1
                    if (totalPages > 5 && currentPage > 3) {
                      page = currentPage - 2 + i
                      if (page > totalPages) page = totalPages - 4 + i
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}