'use client'

import { useState, useEffect, useCallback } from 'react'
import AdvancedDataGrid, { GridColumn, GridRow } from './AdvancedDataGrid'
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
  const [projects, setProjects] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setTransactions(data.transactions || [])
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
      const response = await fetch('/api/admin/accounting/categories')
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
      // Map form fields to API expected fields
      const apiData = {
        type: newTransaction.type,
        amount: newTransaction.amount,
        description: newTransaction.description,
        date: newTransaction.date,
        source: newTransaction.source,
        paymentMethod: newTransaction.paymentMethod || 'other',
        notes: newTransaction.notes,
        tags: newTransaction.tags,
        userId,
        // Map project name to projectId
        ...(newTransaction.project && { 
          projectId: projects.find(p => p.name === newTransaction.project)?._id 
        }),
        // Map category based on transaction type
        ...(newTransaction.category && newTransaction.type === 'income' && { 
          transactionCategoryId: categories.find(c => c.name === newTransaction.category)?._id 
        }),
        ...(newTransaction.category && newTransaction.type === 'expense' && { 
          expenseCategoryId: categories.find(c => c.name === newTransaction.category)?._id 
        })
      }

      console.log('Sending transaction data:', apiData)

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

  const handleEdit = useCallback(async (id: string, updatedData: Partial<Transaction>) => {
    try {
      const response = await fetch(`/api/admin/accounting/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      })

      if (!response.ok) throw new Error('Failed to update transaction')
      
      // Refresh data
      await loadTransactions()
    } catch (err) {
      console.error('Failed to edit transaction:', err)
      throw new Error('Failed to update transaction')
    }
  }, [])

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
  const columns: GridColumn[] = [
    {
      key: 'type',
      title: 'Type',
      type: 'select',
      width: '120px',
      editable: true,
      sortable: true,
      filterable: true,
      required: true,
      options: [
        { value: 'income', label: 'Income', color: 'bg-green-100 text-green-800' },
        { value: 'expense', label: 'Expense', color: 'bg-red-100 text-red-800' }
      ],
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'income' 
            ? 'bg-green-100 text-green-800' 
            : value === 'expense' 
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'income' ? (
            <TrendingUp className="w-3 h-3 mr-1" />
          ) : value === 'expense' ? (
            <TrendingDown className="w-3 h-3 mr-1" />
          ) : null}
          {value === 'income' ? 'Income' : value === 'expense' ? 'Expense' : value || 'Unknown'}
        </span>
      )
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
      type: 'select',
      width: '150px',
      editable: true,
      sortable: true,
      filterable: true,
      options: categories.map(c => ({ value: c.name, label: c.name })),
      render: (value) => (
        <span className="inline-flex items-center">
          <Tag className="w-3 h-3 mr-1 text-gray-400" />
          {value || '-'}
        </span>
      )
    },
    {
      key: 'project',
      title: 'Project',
      type: 'select',
      width: '150px',
      editable: true,
      sortable: true,
      filterable: true,
      options: projects.map(p => ({ value: p.name, label: p.name })),
      render: (value) => (
        <span className="inline-flex items-center">
          <Building className="w-3 h-3 mr-1 text-gray-400" />
          {value || '-'}
        </span>
      )
    },
    {
      key: 'source',
      title: 'Source/Vendor',
      type: 'text',
      width: '150px',
      editable: true,
      sortable: true,
      filterable: true,
      placeholder: 'Enter source or vendor...',
      render: (value, row) => (
        <span className="inline-flex items-center">
          <User className="w-3 h-3 mr-1 text-gray-400" />
          {value || row.vendor || '-'}
        </span>
      )
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
        { value: 'card', label: 'Card' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'other', label: 'Other' }
      ],
      render: (value) => (
        <span className="inline-flex items-center">
          <CreditCard className="w-3 h-3 mr-1 text-gray-400" />
          {value || '-'}
        </span>
      )
    },
    {
      key: 'receiptNumber',
      title: 'Receipt #',
      type: 'text',
      width: '120px',
      editable: true,
      sortable: true,
      filterable: true,
      placeholder: 'Receipt number...',
      render: (value) => (
        <span className="inline-flex items-center">
          <Receipt className="w-3 h-3 mr-1 text-gray-400" />
          {value || '-'}
        </span>
      )
    },
    {
      key: 'notes',
      title: 'Notes',
      type: 'text',
      width: '200px',
      editable: true,
      sortable: false,
      filterable: true,
      placeholder: 'Additional notes...',
      render: (value) => (
        <div className="truncate max-w-[180px]" title={value}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Created',
      type: 'readonly',
      width: '120px',
      editable: false,
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('en-IN') : '-'
    }
  ]

  // Custom actions
  const customActions = [
    {
      label: 'View Receipt',
      icon: <Receipt className="h-4 w-4" />,
      action: (row: GridRow) => {
        console.log('View receipt for:', row)
        // Could open receipt viewer
      },
      variant: 'secondary' as const
    }
  ]

  // Default values for new transactions
  const defaultValues = {
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    amount: '',
    description: ''
  }

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

        <div className={`bg-gradient-to-r rounded-lg p-6 text-white ${
          stats.netAmount >= 0 
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
            <DollarSign className={`h-8 w-8 ${
              stats.netAmount >= 0 ? 'text-blue-200' : 'text-orange-200'
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
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onRefresh={loadAllData}
        customActions={customActions}
        defaultValues={defaultValues}
      />
    </div>
  )
}