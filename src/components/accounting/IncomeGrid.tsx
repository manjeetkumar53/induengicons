'use client'

import { useState, useEffect } from 'react'
import DataGrid, { Column } from '../common/DataGrid'
import { Plus, FileText, Edit3 } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  description: string
  source: string
  date: string
  paymentMethod: string
  receiptNumber?: string
  project?: string
  category?: string
  createdAt: string
}

interface IncomeGridProps {
  onAddTransaction?: () => void
  onEditTransaction?: (transaction: Transaction) => void
  onViewReceipt?: (transaction: Transaction) => void
}

export default function IncomeGrid({ 
  onAddTransaction, 
  onEditTransaction,
  onViewReceipt 
}: IncomeGridProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    fetchTransactions()
    fetchProjects()
    fetchCategories()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/accounting/transactions?type=income')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/accounting/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/accounting/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  // Handle inline editing
  const handleEdit = async (row: Transaction, field: string, value: any) => {
    try {
      const response = await fetch(`/api/admin/accounting/transactions/${row.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...row,
          [field]: value
        })
      })

      if (!response.ok) throw new Error('Failed to update transaction')

      // Update local state
      setTransactions(prev => 
        prev.map(t => t.id === row.id ? { ...t, [field]: value } : t)
      )
    } catch (err) {
      throw new Error('Failed to save changes')
    }
  }

  // Handle delete
  const handleDelete = async (row: Transaction) => {
    if (!confirm('Are you sure you want to delete this income transaction?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/accounting/transactions/${row.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete transaction')

      // Update local state
      setTransactions(prev => prev.filter(t => t.id !== row.id))
    } catch (err) {
      throw new Error('Failed to delete transaction')
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async (rows: Transaction[]) => {
    if (!confirm(`Are you sure you want to delete ${rows.length} transactions?`)) {
      return
    }

    try {
      await Promise.all(
        rows.map(row => 
          fetch(`/api/admin/accounting/transactions/${row.id}`, {
            method: 'DELETE'
          })
        )
      )

      // Update local state
      const deletedIds = rows.map(r => r.id)
      setTransactions(prev => prev.filter(t => !deletedIds.includes(t.id)))
    } catch (err) {
      throw new Error('Failed to delete transactions')
    }
  }

  // Define columns
  const columns: Column[] = [
    {
      key: 'date',
      title: 'Date',
      type: 'date',
      width: '120px',
      editable: true,
      sortable: true
    },
    {
      key: 'description',
      title: 'Description',
      type: 'text',
      width: '250px',
      editable: true,
      sortable: true
    },
    {
      key: 'amount',
      title: 'Amount',
      type: 'currency',
      width: '120px',
      editable: true,
      sortable: true
    },
    {
      key: 'source',
      title: 'Source',
      type: 'text',
      width: '150px',
      editable: true,
      sortable: true
    },
    {
      key: 'paymentMethod',
      title: 'Payment Method',
      type: 'select',
      width: '140px',
      editable: true,
      sortable: true,
      options: [
        { value: 'Bank Transfer', label: 'Bank Transfer' },
        { value: 'Cash', label: 'Cash' },
        { value: 'Cheque', label: 'Cheque' },
        { value: 'UPI', label: 'UPI' },
        { value: 'Card', label: 'Card' },
        { value: 'Online', label: 'Online' }
      ]
    },
    {
      key: 'receiptNumber',
      title: 'Receipt #',
      type: 'text',
      width: '120px',
      editable: true,
      sortable: true
    },
    {
      key: 'project',
      title: 'Project',
      type: 'select',
      width: '150px',
      editable: true,
      sortable: true,
      options: projects.map(p => ({ value: p.name, label: p.name })),
      render: (value) => value || '-'
    },
    {
      key: 'category',
      title: 'Category',
      type: 'select',
      width: '150px',
      editable: true,
      sortable: true,
      options: categories.map(c => ({ value: c.name, label: c.name })),
      render: (value) => value || '-'
    },
    {
      key: 'createdAt',
      title: 'Created',
      type: 'date',
      width: '120px',
      editable: false,
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('en-IN') : '-'
    }
  ]

  // Custom actions
  const customActions = [
    {
      label: 'Edit Details',
      icon: <Edit3 className="h-4 w-4" />,
      action: (row: Transaction) => onEditTransaction?.(row),
      variant: 'primary' as const
    },
    {
      label: 'View Receipt',
      icon: <FileText className="h-4 w-4" />,
      action: (row: Transaction) => onViewReceipt?.(row),
      variant: 'secondary' as const
    }
  ]

  // Calculate totals
  const totalIncome = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  const thisMonthIncome = transactions
    .filter(t => {
      const transactionDate = new Date(t.date)
      const now = new Date()
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-green-100 text-sm">Total Income</p>
              <p className="text-2xl font-bold">
                ₹{totalIncome.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
              <Plus className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-blue-100 text-sm">This Month</p>
              <p className="text-2xl font-bold">
                ₹{thisMonthIncome.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-purple-100 text-sm">Transactions</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
              <Edit3 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-orange-100 text-sm">Avg. per Transaction</p>
              <p className="text-2xl font-bold">
                ₹{transactions.length > 0 ? Math.round(totalIncome / transactions.length).toLocaleString('en-IN') : '0'}
              </p>
            </div>
            <div className="p-3 bg-orange-400 bg-opacity-30 rounded-full">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <DataGrid
        title="Income Transactions"
        subtitle={`Manage all income transactions and receipts`}
        columns={columns}
        data={transactions}
        loading={loading}
        error={error || undefined}
        searchPlaceholder="Search income transactions..."
        pageSize={25}
        enableAdd={true}
        enableEdit={true}
        enableDelete={true}
        enableBulkActions={true}
        onAdd={onAddTransaction}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onRefresh={fetchTransactions}
        customActions={customActions}
      />
    </div>
  )
}