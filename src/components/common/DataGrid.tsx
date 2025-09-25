'use client'

import { useState, useEffect } from 'react'
import { 
  Edit2, 
  Save, 
  X, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  MoreHorizontal
} from 'lucide-react'

export interface Column {
  key: string
  title: string
  type: 'text' | 'number' | 'date' | 'select' | 'currency' | 'readonly'
  width?: string
  editable?: boolean
  sortable?: boolean
  options?: { value: string, label: string }[] // for select type
  render?: (value: any, row: any) => React.ReactNode
  validate?: (value: any) => string | null
}

export interface DataGridProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  error?: string
  title?: string
  subtitle?: string
  searchPlaceholder?: string
  pageSize?: number
  enableAdd?: boolean
  enableEdit?: boolean
  enableDelete?: boolean
  enableBulkActions?: boolean
  onAdd?: () => void
  onEdit?: (row: any, field: string, value: any) => Promise<void>
  onDelete?: (row: any) => Promise<void>
  onBulkDelete?: (rows: any[]) => Promise<void>
  onRefresh?: () => void
  customActions?: {
    label: string
    icon: React.ReactNode
    action: (row: any) => void
    variant?: 'primary' | 'secondary' | 'danger'
  }[]
}

export default function DataGrid({
  columns,
  data,
  loading = false,
  error,
  title,
  subtitle,
  searchPlaceholder = "Search...",
  pageSize = 20,
  enableAdd = true,
  enableEdit = true,
  enableDelete = true,
  enableBulkActions = false,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
  onRefresh,
  customActions = []
}: DataGridProps) {
  const [filteredData, setFilteredData] = useState(data)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingCell, setEditingCell] = useState<{ rowId: string, field: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Update filtered data when data changes
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  // Search and filter
  useEffect(() => {
    let filtered = data

    if (searchTerm) {
      filtered = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Sort
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [data, searchTerm, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key)
    if (!column?.sortable) return

    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const handleEdit = async (rowId: string, field: string, value: any) => {
    if (!onEdit) return

    setIsSaving(true)
    try {
      const row = data.find(r => r.id === rowId)
      if (row) {
        await onEdit(row, field, value)
      }
      setEditingCell(null)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (row: any) => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(row)
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedRows.size === 0) return

    setIsDeleting(true)
    try {
      const rowsToDelete = data.filter(row => selectedRows.has(row.id))
      await onBulkDelete(rowsToDelete)
      setSelectedRows(new Set())
    } catch (error) {
      console.error('Failed to bulk delete:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleRowSelection = (rowId: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId)
    } else {
      newSelected.add(rowId)
    }
    setSelectedRows(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map(row => row.id)))
    }
  }

  const renderCell = (row: any, column: Column) => {
    const value = row[column.key]
    const isEditing = editingCell?.rowId === row.id && editingCell?.field === column.key

    if (isEditing && column.editable) {
      return (
        <div className="flex items-center space-x-2">
          {column.type === 'select' ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-2 py-1 border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            >
              {column.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-2 py-1 border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
          )}
          <button
            onClick={() => handleEdit(row.id, column.key, editValue)}
            disabled={isSaving}
            className="p-1 text-green-600 hover:text-green-800"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={() => setEditingCell(null)}
            className="p-1 text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }

    if (column.render) {
      return column.render(value, row)
    }

    if (column.type === 'currency') {
      return (
        <span className="font-medium text-gray-900">
          ₹{Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      )
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString('en-IN')
    }

    return (
      <div
        className={column.editable ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded' : ''}
        onClick={() => {
          if (column.editable && enableEdit) {
            setEditingCell({ rowId: row.id, field: column.key })
            setEditValue(value || '')
          }
        }}
      >
        {value || '-'}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center space-x-3">
            {enableAdd && onAdd && (
              <button
                onClick={onAdd}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          {enableBulkActions && selectedRows.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {selectedRows.size} selected
              </span>
              {enableDelete && (
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {enableBulkActions && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <span className="text-gray-400">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(enableEdit || enableDelete || customActions.length > 0) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={row.id || index} className="hover:bg-gray-50">
                {enableBulkActions && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </td>
                )}
                {columns.map(column => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm">
                    {renderCell(row, column)}
                  </td>
                ))}
                {(enableEdit || enableDelete || customActions.length > 0) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      {customActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => action.action(row)}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            action.variant === 'danger' ? 'text-red-600 hover:text-red-800' :
                            action.variant === 'primary' ? 'text-indigo-600 hover:text-indigo-800' :
                            'text-gray-600 hover:text-gray-800'
                          }`}
                          title={action.label}
                        >
                          {action.icon}
                        </button>
                      ))}
                      {enableDelete && (
                        <button
                          onClick={() => handleDelete(row)}
                          disabled={isDeleting}
                          className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredData.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm ? 'No results found for your search.' : 'No data available.'}
          </div>
          {enableAdd && onAdd && !searchTerm && (
            <button
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Entry
            </button>
          )}
        </div>
      )}
    </div>
  )
}