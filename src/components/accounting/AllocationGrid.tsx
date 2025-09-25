'use client'

import { useState, useEffect } from 'react'
import DataGrid, { Column } from '../common/DataGrid'
import { PieChart, TrendingUp, Edit3, Eye } from 'lucide-react'

interface Allocation {
  id: string
  projectName: string
  allocatedAmount: number
  usedAmount: number
  remainingAmount: number
  percentage: number
  status: 'Active' | 'Completed' | 'On Hold' | 'Overbudget'
  startDate: string
  endDate?: string
  description?: string
  createdAt: string
}

interface AllocationGridProps {
  onAddAllocation?: () => void
  onEditAllocation?: (allocation: Allocation) => void
  onViewDetails?: (allocation: Allocation) => void
}

export default function AllocationGrid({ 
  onAddAllocation, 
  onEditAllocation,
  onViewDetails 
}: AllocationGridProps) {
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    fetchAllocations()
  }, [])

  const fetchAllocations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/accounting/allocations')
      if (!response.ok) throw new Error('Failed to fetch allocations')
      const data = await response.json()
      setAllocations(data.allocations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load allocations')
    } finally {
      setLoading(false)
    }
  }

  // Handle inline editing
  const handleEdit = async (row: Allocation, field: string, value: any) => {
    try {
      const response = await fetch(`/api/admin/accounting/allocations/${row.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...row,
          [field]: value
        })
      })

      if (!response.ok) throw new Error('Failed to update allocation')

      // Update local state
      setAllocations(prev => 
        prev.map(a => a.id === row.id ? { ...a, [field]: value } : a)
      )
    } catch (err) {
      throw new Error('Failed to save changes')
    }
  }

  // Handle delete
  const handleDelete = async (row: Allocation) => {
    if (!confirm('Are you sure you want to delete this allocation?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/accounting/allocations/${row.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete allocation')

      // Update local state
      setAllocations(prev => prev.filter(a => a.id !== row.id))
    } catch (err) {
      throw new Error('Failed to delete allocation')
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async (rows: Allocation[]) => {
    if (!confirm(`Are you sure you want to delete ${rows.length} allocations?`)) {
      return
    }

    try {
      await Promise.all(
        rows.map(row => 
          fetch(`/api/admin/accounting/allocations/${row.id}`, {
            method: 'DELETE'
          })
        )
      )

      // Update local state
      const deletedIds = rows.map(r => r.id)
      setAllocations(prev => prev.filter(a => !deletedIds.includes(a.id)))
    } catch (err) {
      throw new Error('Failed to delete allocations')
    }
  }

  // Define columns
  const columns: Column[] = [
    {
      key: 'projectName',
      title: 'Project Name',
      type: 'text',
      width: '200px',
      editable: true,
      sortable: true
    },
    {
      key: 'allocatedAmount',
      title: 'Allocated',
      type: 'currency',
      width: '130px',
      editable: true,
      sortable: true
    },
    {
      key: 'usedAmount',
      title: 'Used',
      type: 'currency',
      width: '130px',
      editable: false,
      sortable: true
    },
    {
      key: 'remainingAmount',
      title: 'Remaining',
      type: 'currency',
      width: '130px',
      editable: false,
      sortable: true,
      render: (value, row) => (
        <span className={`font-medium ${
          row.remainingAmount < 0 ? 'text-red-600' : 
          row.remainingAmount < row.allocatedAmount * 0.1 ? 'text-orange-600' : 
          'text-green-600'
        }`}>
          ₹{Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'percentage',
      title: 'Usage %',
      type: 'readonly',
      width: '100px',
      editable: false,
      sortable: true,
      render: (value, row) => {
        const percentage = row.allocatedAmount > 0 ? (row.usedAmount / row.allocatedAmount) * 100 : 0
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  percentage > 100 ? 'bg-red-500' :
                  percentage > 80 ? 'bg-orange-500' :
                  percentage > 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium w-12">
              {percentage.toFixed(0)}%
            </span>
          </div>
        )
      }
    },
    {
      key: 'status',
      title: 'Status',
      type: 'select',
      width: '120px',
      editable: true,
      sortable: true,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Completed', label: 'Completed' },
        { value: 'On Hold', label: 'On Hold' },
        { value: 'Overbudget', label: 'Overbudget' }
      ],
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'Active' ? 'bg-green-100 text-green-800' :
          value === 'Completed' ? 'bg-blue-100 text-blue-800' :
          value === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
          value === 'Overbudget' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'startDate',
      title: 'Start Date',
      type: 'date',
      width: '120px',
      editable: true,
      sortable: true
    },
    {
      key: 'endDate',
      title: 'End Date',
      type: 'date',
      width: '120px',
      editable: true,
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('en-IN') : '-'
    },
    {
      key: 'description',
      title: 'Description',
      type: 'text',
      width: '200px',
      editable: true,
      sortable: false,
      render: (value) => (
        <div className="truncate" title={value}>
          {value || '-'}
        </div>
      )
    }
  ]

  // Custom actions
  const customActions = [
    {
      label: 'Edit Details',
      icon: <Edit3 className="h-4 w-4" />,
      action: (row: Allocation) => onEditAllocation?.(row),
      variant: 'primary' as const
    },
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      action: (row: Allocation) => onViewDetails?.(row),
      variant: 'secondary' as const
    }
  ]

  // Calculate totals and stats
  const totalAllocated = allocations.reduce((sum, a) => sum + (Number(a.allocatedAmount) || 0), 0)
  const totalUsed = allocations.reduce((sum, a) => sum + (Number(a.usedAmount) || 0), 0)
  const totalRemaining = totalAllocated - totalUsed
  const activeAllocations = allocations.filter(a => a.status === 'Active').length
  const overbudgetAllocations = allocations.filter(a => a.status === 'Overbudget' || a.remainingAmount < 0).length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-blue-100 text-sm">Total Allocated</p>
              <p className="text-2xl font-bold">
                ₹{totalAllocated.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <PieChart className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-green-100 text-sm">Total Used</p>
              <p className="text-2xl font-bold">
                ₹{totalUsed.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-purple-100 text-sm">Remaining</p>
              <p className="text-2xl font-bold">
                ₹{totalRemaining.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
              <Edit3 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-orange-100 text-sm">Active Projects</p>
              <p className="text-2xl font-bold">{activeAllocations}</p>
              {overbudgetAllocations > 0 && (
                <p className="text-orange-200 text-xs mt-1">
                  {overbudgetAllocations} overbudget
                </p>
              )}
            </div>
            <div className="p-3 bg-orange-400 bg-opacity-30 rounded-full">
              <Eye className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <DataGrid
        title="Fund Allocations"
        subtitle={`Manage project fund allocations and budgets`}
        columns={columns}
        data={allocations}
        loading={loading}
        error={error || undefined}
        searchPlaceholder="Search allocations..."
        pageSize={20}
        enableAdd={true}
        enableEdit={true}
        enableDelete={true}
        enableBulkActions={true}
        onAdd={onAddAllocation}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onRefresh={fetchAllocations}
        customActions={customActions}
      />
    </div>
  )
}