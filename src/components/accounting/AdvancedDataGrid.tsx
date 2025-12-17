'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  Tag,
  User,
  FileText,
  Check,
  AlertCircle,
  Settings
} from 'lucide-react'
import CreatableCombobox from '../ui/CreatableCombobox'

export interface GridColumn {
  key: string
  title: string
  type: 'text' | 'number' | 'currency' | 'date' | 'select' | 'creatable-select' | 'readonly' | 'badge'
  width?: string
  minWidth?: string
  editable?: boolean
  sortable?: boolean
  filterable?: boolean
  required?: boolean
  options?: { value: string | number, label: string, color?: string }[]
  render?: (value: unknown, row: Record<string, unknown>, isEditing?: boolean) => React.ReactNode
  validate?: (value: unknown, row?: Record<string, unknown>) => string | null
  placeholder?: string
  onCreate?: (value: string) => void
}

export interface GridRow {
  id: string
  [key: string]: unknown
}

interface QuickAddRowProps {
  columns: GridColumn[]
  defaultValues?: Partial<GridRow>
  onSave: (data: Partial<GridRow>) => void
  onCancel: () => void
  isProcessing: boolean
}

interface EditModalProps {
  columns: GridColumn[]
  data: Partial<GridRow>
  onSave: (data: Partial<GridRow>) => void
  onCancel: () => void
  isProcessing: boolean
}

export interface AdvancedDataGridProps {
  title: string
  subtitle?: string
  columns: GridColumn[]
  data: GridRow[]
  loading?: boolean
  error?: string | null
  searchPlaceholder?: string
  pageSize?: number
  enableAdd?: boolean
  enableEdit?: boolean
  enableDelete?: boolean
  enableBulkActions?: boolean
  enableFullscreen?: boolean
  enableFilters?: boolean
  onAdd?: (newRow: Partial<GridRow>) => Promise<GridRow>
  onEdit?: (id: string, updatedRow: Partial<GridRow>) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onBulkDelete?: (ids: string[]) => Promise<void>
  onRefresh?: () => Promise<void>
  customActions?: {
    label: string
    icon: React.ComponentType<{ className?: string }>
    onClick: (row: GridRow) => void
    className?: string
  }[]
  defaultValues?: Partial<GridRow>
}

interface EditingState {
  mode: 'none' | 'row' | 'modal' | 'quickAdd'
  rowId?: string
  data?: Partial<GridRow>
}

export default function AdvancedDataGrid({
  title,
  subtitle,
  columns,
  data,
  loading = false,
  error = null,
  searchPlaceholder = "Search transactions...",
  pageSize = 25,
  enableAdd = true,
  enableEdit = true,
  enableDelete = true,
  enableBulkActions = false,
  enableFullscreen = false,
  enableFilters = false,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
  onRefresh,
  customActions = [],
  defaultValues = {}
}: AdvancedDataGridProps) {
  // State management
  const [filteredData, setFilteredData] = useState<GridRow[]>(data)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<EditingState>({ mode: 'none' })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(row =>
        Object.entries(row).some(([key, value]) => {
          if (key === 'id') return false
          return String(value || '').toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      if (filterValue) {
        result = result.filter(row =>
          String(row[key] || '').toLowerCase().includes(filterValue.toLowerCase())
        )
      }
    })

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        // Handle currency values
        if (typeof aVal === 'string' && aVal.includes('₹')) {
          aVal = parseFloat(aVal.replace(/[₹,]/g, ''))
          bVal = parseFloat(String(bVal).replace(/[₹,]/g, ''))
        }

        // Handle dates
        if (sortConfig.key.includes('date') || sortConfig.key.includes('Date')) {
          aVal = new Date(aVal).getTime()
          bVal = new Date(bVal).getTime()
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, searchTerm, columnFilters, sortConfig])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Update filtered data when data changes
  useEffect(() => {
    setFilteredData(processedData)
  }, [processedData])

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, columnFilters, data])

  // Row editing handlers
  const handleRowEdit = useCallback(async (rowData: Partial<GridRow>) => {
    if (!onEdit || !editing.rowId) return

    setIsProcessing(true)
    try {
      await onEdit(editing.rowId, rowData)
      setEditing({ mode: 'none' })
    } catch (error) {
      console.error('Failed to edit:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [onEdit, editing.rowId])

  const handleQuickAdd = useCallback(async (rowData: Partial<GridRow>) => {
    if (!onAdd) return

    setIsProcessing(true)
    try {
      await onAdd(rowData)
      setEditing({ mode: 'none' })
    } catch (error) {
      console.error('Failed to add:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [onAdd])

  // Render editable cell
  const renderEditableCell = useCallback((row: GridRow, column: GridColumn) => {
    // Get the current value from editing data if available, otherwise from row
    const currentValue = editing.mode === 'row' && editing.rowId === row.id && editing.data
      ? editing.data[column.key]
      : row[column.key]

    if (column.type === 'date') {
      const dateValue = currentValue ? new Date(currentValue).toISOString().split('T')[0] : ''
      return (
        <input
          type="date"
          value={dateValue}
          onChange={(e) => {
            const currentData = editing.data || row
            const updatedData = { ...currentData, [column.key]: e.target.value }
            setEditing({ mode: 'row', rowId: row.id, data: updatedData })
          }}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      )
    }

    if (column.type === 'currency') {
      return (
        <div className="relative">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">₹</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={Number(currentValue) || 0}
            onChange={(e) => {
              const currentData = editing.data || row
              const updatedData = { ...currentData, [column.key]: Number(e.target.value) }
              setEditing({ mode: 'row', rowId: row.id, data: updatedData })
            }}
            className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )
    }

    if (column.type === 'select' || column.type === 'badge') {
      return (
        <select
          value={currentValue || ''}
          onChange={(e) => {
            const currentData = editing.data || row
            const updatedData = { ...currentData, [column.key]: e.target.value }
            setEditing({ mode: 'row', rowId: row.id, data: updatedData })
          }}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select {column.title}...</option>
          {column.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    if (column.type === 'creatable-select') {
      return (
        <CreatableCombobox
          options={column.options || []}
          value={currentValue}
          onChange={(val) => {
            const currentData = editing.data || row
            const updatedData = { ...currentData, [column.key]: val }
            setEditing({ mode: 'row', rowId: row.id, data: updatedData })
          }}
          onCreate={(val) => {
            if (column.onCreate) {
              column.onCreate(val)
            }
            const currentData = editing.data || row
            const updatedData = { ...currentData, [column.key]: val }
            setEditing({ mode: 'row', rowId: row.id, data: updatedData })
          }}
          placeholder={`Select or create ${column.title.toLowerCase()}...`}
          className="text-sm"
        />
      )
    }

    // Default to text input
    return (
      <input
        type="text"
        value={currentValue || ''}
        onChange={(e) => {
          const currentData = editing.data || row
          const updatedData = { ...currentData, [column.key]: e.target.value }
          setEditing({ mode: 'row', rowId: row.id, data: updatedData })
        }}
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder={column.placeholder}
      />
    )
  }, [editing])

  // Render display cell
  const renderDisplayCell = useCallback((row: GridRow, column: GridColumn) => {
    const value = row[column.key]

    // Custom render function
    if (column.render) {
      return column.render(value, row, false)
    }

    // Default renderers based on type
    switch (column.type) {
      case 'currency':
        const numValue = Number(value) || 0
        const isNegative = numValue < 0
        return (
          <div className={`font-medium ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
            ₹{Math.abs(numValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        )

      case 'date':
        let displayValue = '-'
        if (value) {
          try {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
              displayValue = date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            }
          } catch (e) {
            displayValue = value
          }
        }
        return <div className="text-gray-900">{displayValue}</div>

      case 'badge':
        const option = column.options?.find((opt) => opt.value === value)
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${option?.color || 'bg-gray-100 text-gray-800'}`}
          >
            {option?.label || value || '-'}
          </span>
        )

      default:
        return <div className="text-gray-900">{value || '-'}</div>
    }
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-600 mr-3" />
          <span className="text-gray-600">Loading data...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center text-center">
          <div>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isFullscreen ? 'fixed inset-0 z-50 m-4' : ''}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Add Transaction Button */}
            {enableAdd && onAdd && (
              <button
                onClick={() => setEditing({ mode: 'quickAdd', data: { ...defaultValues } })}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </button>
            )}

            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  style={{ width: column.width, minWidth: column.minWidth }}
                  onClick={() => {
                    if (column.sortable) {
                      setSortConfig(current => {
                        if (current?.key === column.key) {
                          return current.direction === 'asc'
                            ? { key: column.key, direction: 'desc' }
                            : null
                        }
                        return { key: column.key, direction: 'asc' }
                      })
                    }
                  }}
                >
                  <div className="flex items-center">
                    {column.title}
                    {column.sortable && (
                      <div className="ml-1">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-gray-300" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {(enableEdit || enableDelete || customActions.length > 0) && (
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10 shadow-sm"
                  style={{ width: '120px', minWidth: '120px' }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => {
              // Use strict comparison and ensure both IDs are strings
              const rowId = String(row.id || `temp-${index}`)
              const editingRowId = String(editing.rowId || '')
              const isEditing = editing.mode === 'row' && editingRowId === rowId
              const editingData = isEditing ? { ...row, ...(editing.data || {}) } : row

              // Debug logging to see what's happening
              if (index === 0) {
                console.log('Debug editing state:', {
                  editingMode: editing.mode,
                  editingRowId: editingRowId,
                  currentRowId: rowId,
                  isEditing: isEditing,
                  allRowIds: paginatedData.map(r => String(r.id)).slice(0, 5)
                })
              }

              // Ensure unique key
              const uniqueKey = rowId

              return (
                <tr
                  key={uniqueKey}
                  className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
                >
                  {columns.map((column, colIndex) => (
                    <td key={`${uniqueKey}-${column.key}-${colIndex}`} className="px-6 py-4 whitespace-nowrap text-sm">
                      {isEditing && column.editable ?
                        renderEditableCell(editingData, column) :
                        renderDisplayCell(editingData, column)
                      }
                    </td>
                  ))}

                  {/* Actions Column */}
                  {(enableEdit || enableDelete || customActions.length > 0) && (
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 z-10 shadow-sm ${isEditing ? 'bg-blue-50' : 'bg-white'}`}>
                      <div className="flex items-center justify-end space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleRowEdit(editingData)}
                              disabled={isProcessing}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditing({ mode: 'none' })}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {enableEdit && onEdit && (
                              <button
                                onClick={() => {
                                  const targetRowId = String(row.id || `temp-${index}`)
                                  console.log('Starting edit for row:', targetRowId, 'current editing:', editing.rowId)
                                  setEditing({ mode: 'row', rowId: targetRowId, data: { ...row } })
                                }}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                            {customActions.map((action, actionIndex) => {
                              const IconComponent = action.icon
                              return (
                                <button
                                  key={`${uniqueKey}-action-${actionIndex}`}
                                  onClick={() => action.onClick(row)}
                                  className={action.className || "text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"}
                                  title={action.label}
                                >
                                  <IconComponent className="h-4 w-4" />
                                </button>
                              )
                            })}
                            {enableDelete && onDelete && (
                              <button
                                onClick={() => onDelete(row.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded ${page === currentPage
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Row Modal */}
      {editing.mode === 'quickAdd' && (
        <QuickAddRow
          columns={columns}
          defaultValues={defaultValues}
          onSave={handleQuickAdd}
          onCancel={() => setEditing({ mode: 'none' })}
          isProcessing={isProcessing}
        />
      )}
    </div>
  )
}

// Quick Add Row Component
const QuickAddRow = ({ columns, defaultValues, onSave, onCancel, isProcessing }: QuickAddRowProps) => {
  const [formData, setFormData] = useState<Partial<GridRow>>(defaultValues || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const newErrors: Record<string, string> = {}
    columns.forEach(column => {
      if (column.required && (!formData[column.key] || formData[column.key] === '')) {
        newErrors[column.key] = `${column.title} is required`
      }

      // Custom validation
      if (column.validate && formData[column.key] !== undefined) {
        const error = column.validate(formData[column.key], formData)
        if (error) {
          newErrors[column.key] = error
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add New Transaction</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columns.filter(col => col.editable).map((column, colIndex) => (
              <div key={`form-${column.key}-${colIndex}`}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {column.title}
                  {column.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {column.type === 'date' ? (
                  <input
                    type="date"
                    value={formData[column.key] || ''}
                    onChange={(e) => setFormData((prev: Partial<GridRow>) => ({ ...prev, [column.key]: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors[column.key] ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                ) : column.type === 'currency' ? (
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm text-gray-500">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData[column.key] || ''}
                      onChange={(e) => setFormData((prev: Partial<GridRow>) => ({ ...prev, [column.key]: Number(e.target.value) }))}
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors[column.key] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="0.00"
                    />
                  </div>
                ) : column.type === 'creatable-select' ? (
                  <CreatableCombobox
                    options={column.options || []}
                    value={formData[column.key]}
                    onChange={(val) => setFormData((prev: Partial<GridRow>) => ({ ...prev, [column.key]: val }))}
                    onCreate={(val) => {
                      if (column.onCreate) {
                        column.onCreate(val)
                      }
                      setFormData((prev: Partial<GridRow>) => ({ ...prev, [column.key]: val }))
                    }}
                    placeholder={column.placeholder || `Select or create ${column.title.toLowerCase()}...`}
                  />
                ) : column.type === 'select' || column.type === 'badge' ? (
                  <select
                    value={formData[column.key] || ''}
                    onChange={(e) => setFormData((prev: Partial<GridRow>) => ({ ...prev, [column.key]: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors[column.key] ? 'border-red-300' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select {column.title}...</option>
                    {column.options?.map((option: { value: string | number; label: string }, optIndex: number) => (
                      <option key={`${column.key}-option-${option.value}-${optIndex}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData[column.key] || ''}
                    onChange={(e) => setFormData((prev: Partial<GridRow>) => ({ ...prev, [column.key]: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors[column.key] ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder={column.placeholder || `Enter ${column.title.toLowerCase()}...`}
                  />
                )}

                {errors[column.key] && (
                  <p className="mt-1 text-sm text-red-600">{errors[column.key]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}