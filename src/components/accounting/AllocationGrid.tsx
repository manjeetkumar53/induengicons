'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import AdvancedDataGrid, { GridColumn, GridRow } from './AdvancedDataGrid'
import {
  PieChart,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react'

interface Allocation extends GridRow {
  id: string
  sourceTransactionId: string
  targetProjectId: string
  sourceDescription: string
  targetProjectName: string
  amount: number
  percentage?: number
  description: string
  date: string
  createdBy: string
  createdAt: string
}

interface AllocationGridProps {
  userId?: string
}

export default function AllocationGrid({ userId }: AllocationGridProps) {
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [incomeTransactions, setIncomeTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Stats
  const stats = useMemo(() => ({
    totalAllocated: allocations.reduce((sum, a) => sum + a.amount, 0),
    count: allocations.length,
    uniqueProjects: new Set(allocations.map(a => a.targetProjectId)).size,
    uniqueSources: new Set(allocations.map(a => a.sourceTransactionId)).size
  }), [allocations])

  // Fetch data
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadAllocations(),
        loadProjects(),
        loadIncomeTransactions()
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAllocations = async () => {
    try {
      const response = await fetch('/api/admin/accounting/allocations')
      if (!response.ok) throw new Error('Failed to load allocations')
      const data = await response.json()

      // Normalize data
      const normalizedAlloc = (data.allocations || []).map((a: any, index: number) => ({
        ...a,
        id: a.id || a._id || `allocation-${index}`
      }))

      setAllocations(normalizedAlloc)
    } catch (err) {
      console.error('Failed to load allocations:', err)
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

  const loadIncomeTransactions = async () => {
    try {
      const response = await fetch('/api/admin/accounting/transactions?type=income')
      if (response.ok) {
        const data = await response.json()
        setIncomeTransactions(data.transactions || [])
      }
    } catch (err) {
      console.error('Failed to load income transactions:', err)
    }
  }

  // CRUD Operations
  const handleAdd = useCallback(async (newAllocation: Partial<Allocation>) => {
    try {
      // Map project name to projectId
      let targetProjectId = newAllocation.targetProjectId
      if (!targetProjectId && newAllocation.targetProjectName) {
        const project = projects.find(p => p.name === newAllocation.targetProjectName)
        if (project) {
          targetProjectId = project._id
        }
      }

      // Map source description to transaction ID
      let sourceTransactionId = newAllocation.sourceTransactionId
      if (!sourceTransactionId && newAllocation.sourceDescription) {
        const transaction = incomeTransactions.find(t =>
          t.description === newAllocation.sourceDescription
        )
        if (transaction) {
          sourceTransactionId = transaction._id || transaction.id
        }
      }

      if (!sourceTransactionId) {
        throw new Error('Source transaction is required')
      }

      if (!targetProjectId) {
        throw new Error('Target project is required')
      }

      const apiData = {
        sourceTransactionId,
        targetProjectId,
        amount: Number(newAllocation.amount),
        percentage: newAllocation.percentage ? Number(newAllocation.percentage) : undefined,
        description: newAllocation.description?.trim() || 'Fund allocation',
        date: newAllocation.date,
        createdBy: userId || 'system'
      }

      const response = await fetch('/api/admin/accounting/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      await loadAllocations()
      return result.allocation
    } catch (err) {
      console.error('Failed to add allocation:', err)
      throw err
    }
  }, [userId, projects, incomeTransactions])

  const handleEdit = useCallback(async (id: string, updatedData: Partial<Allocation>) => {
    try {
      // Map names to IDs if needed
      const apiData: any = { ...updatedData }

      if (updatedData.targetProjectName) {
        const project = projects.find(p => p.name === updatedData.targetProjectName)
        if (project) {
          apiData.targetProjectId = project._id
        }
      }

      if (updatedData.sourceDescription) {
        const transaction = incomeTransactions.find(t =>
          t.description === updatedData.sourceDescription
        )
        if (transaction) {
          apiData.sourceTransactionId = transaction._id || transaction.id
        }
      }

      const response = await fetch(`/api/admin/accounting/allocations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) throw new Error('Failed to update allocation')

      await loadAllocations()
    } catch (err) {
      console.error('Failed to edit allocation:', err)
      throw new Error('Failed to update allocation')
    }
  }, [projects, incomeTransactions])

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/accounting/allocations?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete allocation')

      await loadAllocations()
    } catch (err) {
      console.error('Failed to delete allocation:', err)
      throw new Error('Failed to delete allocation')
    }
  }, [])

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/accounting/allocations?id=${id}`, {
            method: 'DELETE'
          })
        )
      )

      await loadAllocations()
    } catch (err) {
      console.error('Failed to bulk delete:', err)
      throw new Error('Failed to delete allocations')
    }
  }, [])

  // Column definitions
  const columns: GridColumn[] = useMemo(() => [
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
      key: 'sourceDescription',
      title: 'Source Transaction',
      type: 'select',
      width: '200px',
      editable: true,
      sortable: true,
      filterable: true,
      required: true,
      options: incomeTransactions.map(t => ({
        value: t.description,
        label: `${t.description} (₹${Number(t.amount).toLocaleString('en-IN')})`
      }))
    },
    {
      key: 'targetProjectName',
      title: 'Target Project',
      type: 'select',
      width: '180px',
      editable: true,
      sortable: true,
      filterable: true,
      required: true,
      options: projects.map(p => ({ value: p.name, label: p.name }))
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
      key: 'percentage',
      title: 'Percentage',
      type: 'number',
      width: '100px',
      editable: true,
      sortable: true,
      render: (value) => value ? `${value}%` : '-'
    },
    {
      key: 'description',
      title: 'Description',
      type: 'text',
      width: '200px',
      editable: true,
      sortable: false,
      filterable: true,
      required: true,
      placeholder: 'Enter description...'
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
  ], [projects, incomeTransactions])

  // Default values
  const defaultValues = useMemo(() => ({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    createdBy: userId || 'system'
  }), [userId])

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Allocated</p>
              <p className="text-2xl font-bold">₹{stats.totalAllocated.toLocaleString('en-IN')}</p>
            </div>
            <PieChart className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Allocations</p>
              <p className="text-2xl font-bold">{stats.count}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Funded Projects</p>
              <p className="text-2xl font-bold">{stats.uniqueProjects}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Income Sources</p>
              <p className="text-2xl font-bold">{stats.uniqueSources}</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Advanced Data Grid */}
      <AdvancedDataGrid
        title="Fund Allocations"
        subtitle="Allocate income transactions to specific projects"
        columns={columns}
        data={allocations}
        loading={loading}
        error={error}
        searchPlaceholder="Search allocations..."
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
        defaultValues={defaultValues}
      />
    </div>
  )
}