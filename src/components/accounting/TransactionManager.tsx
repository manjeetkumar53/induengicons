'use client'

import { useState, useEffect } from 'react'
import TransactionList from './TransactionList'
import TransactionForm from './TransactionForm'

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

interface TransactionManagerProps {
  type: 'income' | 'expense'
  userId: string
  onStatsChange?: () => void
}

export default function TransactionManager({ type, userId, onStatsChange }: TransactionManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    loadTransactions()
  }, [currentPage, searchQuery, dateRange, selectedProject, selectedCategory])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      setError('')

      const params = new URLSearchParams({
        type,
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
        ...(selectedProject && { projectId: selectedProject }),
        ...(selectedCategory && { categoryId: selectedCategory })
      })

      const response = await fetch(`/api/admin/accounting/transactions?${params}`)

      if (!response.ok) {
        throw new Error('Failed to load transactions')
      }

      const data = await response.json()
      setTransactions(data.transactions)
      setTotalPages(data.pagination.totalPages)
      setTotalCount(data.pagination.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransactionSaved = async () => {
    await loadTransactions()
    setShowForm(false)
    setEditingTransaction(null)
    onStatsChange?.()
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/accounting/transactions/${transactionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      await loadTransactions()
      onStatsChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
    }
  }

  const handleDuplicateTransaction = (transaction: Transaction) => {
    const duplicated = {
      ...transaction,
      _id: '',
      date: new Date().toISOString().split('T')[0],
      receiptNumber: '',
      description: `Copy of ${transaction.description}`
    }
    setEditingTransaction(duplicated)
    setShowForm(true)
  }

  const handleBulkDelete = async (transactionIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${transactionIds.length} transactions?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/accounting/transactions/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete',
          transactionIds
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete transactions')
      }

      await loadTransactions()
      onStatsChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transactions')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setDateRange({ start: '', end: '' })
    setSelectedProject('')
    setSelectedCategory('')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">⚠️</span>
            </div>
            <div>
              <h4 className="font-semibold text-red-800">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <TransactionForm
              type={type}
              transaction={editingTransaction}
              isOpen={showForm}
              onSave={handleTransactionSaved}
              onCancel={() => {
                setShowForm(false)
                setEditingTransaction(null)
              }}
            />

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className={`w-full flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed transition-all hover:scale-105 ${type === 'income'
                  ? 'border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50'
                  : 'border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50'
                  }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                  <span className="text-2xl">+</span>
                </div>
                <div>
                  <p className="font-semibold">Add New {type === 'income' ? 'Income' : 'Expense'}</p>
                  <p className="text-sm opacity-75">Click to start recording</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Transaction List */}
        <div className="lg:col-span-2">
          <TransactionList
            type={type}
            transactions={transactions}
            isLoading={isLoading}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onPageChange={setCurrentPage}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onDuplicate={handleDuplicateTransaction}
            onClearFilters={clearFilters}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onBulkDelete={handleBulkDelete}
          />
        </div>
      </div>
    </div>
  )
}