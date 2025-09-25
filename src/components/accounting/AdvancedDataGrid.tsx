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

export interface GridColumn {
  key: string
  title: string
  type: 'text' | 'number' | 'currency' | 'date' | 'select' | 'readonly' | 'badge'
  width?: string
  minWidth?: string
  editable?: boolean
  sortable?: boolean
  filterable?: boolean
  required?: boolean
  options?: { value: string | number, label: string, color?: string }[]
  render?: (value: any, row: any, isEditing?: boolean) => React.ReactNode
  validate?: (value: any, row?: any) => string | null
  placeholder?: string
}

export interface GridRow {
  id: string
  [key: string]: any
}

interface InlineCellEditorProps {
  column: GridColumn
  value: any
  row: GridRow
  onSave: (newValue: any) => void
  onCancel: () => void
  isProcessing: boolean
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
    icon: React.ReactNode
    action: (row: GridRow) => void
    variant?: 'primary' | 'secondary' | 'danger'
  }[]
  defaultValues?: Partial<GridRow>
}

interface EditingState {
  mode: 'none' | 'inline' | 'modal' | 'quickAdd'
  rowId?: string
  field?: string
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
  enableBulkActions = true,
  enableFullscreen = true,
  enableFilters = true,
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
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        // Handle different data types
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }
        
        const aStr = String(aValue || '')
        const bStr = String(bValue || '')
        
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, searchTerm, columnFilters, sortConfig])

  // Update filtered data
  useEffect(() => {
    setFilteredData(processedData)
    setCurrentPage(1)
  }, [processedData])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  // Event handlers
  const handleSort = useCallback((key: string) => {
    const column = columns.find(col => col.key === key)
    if (!column?.sortable) return

    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }, [columns])

  const handleQuickAdd = useCallback(async (newRowData: Partial<GridRow>) => {
    if (!onAdd) return

    setIsProcessing(true)
    try {
      await onAdd(newRowData)
      setEditing({ mode: 'none' })
      if (onRefresh) await onRefresh()
    } catch (error) {
      console.error('Failed to add row:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [onAdd, onRefresh])

  const handleInlineEdit = useCallback(async (rowId: string, field: string, value: any) => {
    if (!onEdit) return

    setIsProcessing(true)
    try {
      await onEdit(rowId, { [field]: value })
      setEditing({ mode: 'none' })
    } catch (error) {
      console.error('Failed to edit:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [onEdit])

  const handleModalEdit = useCallback(async (rowData: Partial<GridRow>) => {
    if (!onEdit || !editing.rowId) return

    setIsProcessing(true)
    try {
      await onEdit(editing.rowId, rowData)
      setEditing({ mode: 'none' })
      if (onRefresh) await onRefresh()
    } catch (error) {
      console.error('Failed to edit:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [onEdit, onRefresh, editing.rowId])

  const handleDelete = useCallback(async (rowId: string) => {
    if (!onDelete || !confirm('Are you sure you want to delete this transaction?')) return

    setIsProcessing(true)
    try {
      await onDelete(rowId)
      if (onRefresh) await onRefresh()
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [onDelete, onRefresh])

  const handleBulkDelete = useCallback(async () => {
    if (!onBulkDelete || selectedRows.size === 0 || 
        !confirm(`Delete ${selectedRows.size} selected transactions?`)) return

    setIsProcessing(true)
    try {
      await onBulkDelete(Array.from(selectedRows))
      setSelectedRows(new Set())
      if (onRefresh) await onRefresh()
    } catch (error) {
      console.error('Failed to bulk delete:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [onBulkDelete, selectedRows, onRefresh])

  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map(row => row.id)))
    }
  }, [selectedRows.size, paginatedData])

  // Render functions
  const renderCell = useCallback((row: GridRow, column: GridColumn) => {
    const value = row[column.key]
    const isCurrentlyEditing = editing.mode === 'inline' && 
                               editing.rowId === row.id && 
                               editing.field === column.key

    // Inline editing mode
    if (isCurrentlyEditing && column.editable) {
      return <InlineCellEditor 
        column={column}
        value={value}
        row={row}
        onSave={(newValue: any) => handleInlineEdit(row.id, column.key, newValue)}
        onCancel={() => setEditing({ mode: 'none' })}
        isProcessing={isProcessing}
      />
    }

    // Custom render function
    if (column.render) {
      return column.render(value, row, false)
    }

    // Default renderers based on type
    switch (column.type) {
      case 'currency':
        return (
          <CurrencyCell 
            value={value} 
            editable={column.editable && enableEdit}
            onClick={() => column.editable && setEditing({ 
              mode: 'inline', 
              rowId: row.id, 
              field: column.key 
            })}
          />
        )
      
      case 'date':
        return (
          <DateCell 
            value={value}
            editable={column.editable && enableEdit}
            onClick={() => column.editable && setEditing({ 
              mode: 'inline', 
              rowId: row.id, 
              field: column.key 
            })}
          />
        )
      
      case 'badge':
        return <BadgeCell value={value} options={column.options} />
      
      case 'select':
        return (
          <SelectCell 
            value={value}
            options={column.options || []}
            editable={column.editable && enableEdit}
            onClick={() => column.editable && setEditing({ 
              mode: 'inline', 
              rowId: row.id, 
              field: column.key 
            })}
          />
        )
      
      default:
        return (
          <TextCell 
            value={value}
            editable={column.editable && enableEdit}
            onClick={() => column.editable && setEditing({ 
              mode: 'inline', 
              rowId: row.id, 
              field: column.key 
            })}
          />
        )
    }
  }, [editing, enableEdit, isProcessing, handleInlineEdit])

  // Loading state
  if (loading) {
    return <LoadingState />
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={onRefresh} />
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-0 z-50 rounded-none shadow-2xl' 
        : 'relative'
    }`}>
      {/* Header */}
      <div className="flex flex-col space-y-4 p-6 border-b bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {enableFullscreen && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            )}
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isProcessing}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-1 items-center space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Filters Toggle */}
            {enableFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 border rounded-lg transition-colors ${
                  showFilters 
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {Object.values(columnFilters).some(v => v) && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                    {Object.values(columnFilters).filter(v => v).length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Bulk Actions */}
            {enableBulkActions && selectedRows.size > 0 && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                <span className="text-sm text-indigo-700">
                  {selectedRows.size} selected
                </span>
                {enableDelete && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={isProcessing}
                    className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Delete Selected"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Quick Add */}
            {enableAdd && editing.mode !== 'quickAdd' && (
              <button
                onClick={() => setEditing({ mode: 'quickAdd', data: { ...defaultValues } })}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </button>
            )}
          </div>
        </div>

        {/* Column Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t">
            {columns.filter(col => col.filterable).map(column => (
              <div key={column.key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {column.title}
                </label>
                <input
                  type="text"
                  placeholder={`Filter ${column.title.toLowerCase()}...`}
                  value={columnFilters[column.key] || ''}
                  onChange={(e) => setColumnFilters(prev => ({
                    ...prev,
                    [column.key]: e.target.value
                  }))}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ))}
            {Object.values(columnFilters).some(v => v) && (
              <div className="flex items-end">
                <button
                  onClick={() => setColumnFilters({})}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Row */}
      {editing.mode === 'quickAdd' && (
        <QuickAddRow 
          columns={columns}
          defaultValues={editing.data || {}}
          onSave={handleQuickAdd}
          onCancel={() => setEditing({ mode: 'none' })}
          isProcessing={isProcessing}
        />
      )}

      {/* Table */}
      <div className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-300px)]' : 'max-h-[70vh]'}`}>
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {/* Bulk Select */}
              {enableBulkActions && (
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </th>
              )}
              
              {/* Column Headers */}
              {columns.map(column => (
                <th
                  key={column.key}
                  style={{ 
                    width: column.width,
                    minWidth: column.minWidth || '120px'
                  }}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.required && <span className="text-red-500">*</span>}
                    {column.sortable && (
                      <span className="text-gray-400">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUp className="h-3 w-3" /> 
                            : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {/* Actions */}
              {(enableEdit || enableDelete || customActions.length > 0) && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => {
              // Debug: Log rows without proper IDs
              if (!row.id) {
                console.warn('Row without ID found:', row, 'at index:', index)
              }
              
              return (
                <tr 
                  key={row.id || `row-${index}`} 
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRows.has(row.id) ? 'bg-indigo-50' : ''
                  }`}
                >
                {/* Bulk Select */}
                {enableBulkActions && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </td>
                )}
                
                {/* Data Cells */}
                {columns.map(column => (
                  <td 
                    key={column.key} 
                    className="px-4 py-3 text-sm whitespace-nowrap"
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
                
                {/* Actions */}
                {(enableEdit || enableDelete || customActions.length > 0) && (
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      {customActions.map((action, i) => (
                        <button
                          key={`${row.id}-${action.label}-${i}`}
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
                      
                      {enableEdit && (
                        <button
                          onClick={() => setEditing({ 
                            mode: 'modal', 
                            rowId: row.id, 
                            data: { ...row } 
                          })}
                          className="p-1 text-indigo-600 hover:text-indigo-800 rounded hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      
                      {enableDelete && (
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={isProcessing}
                          className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-gray-100 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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

      {/* Empty State */}
      {filteredData.length === 0 && !loading && (
        <EmptyState 
          hasSearch={!!searchTerm || Object.values(columnFilters).some(v => v)}
          onAddFirst={enableAdd ? () => setEditing({ mode: 'quickAdd', data: { ...defaultValues } }) : undefined}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing.mode === 'modal' && (
        <EditModal
          columns={columns}
          data={editing.data || {}}
          onSave={handleModalEdit}
          onCancel={() => setEditing({ mode: 'none' })}
          isProcessing={isProcessing}
        />
      )}
    </div>
  )
}

// Cell Components
const CurrencyCell = ({ value, editable, onClick }: any) => (
  <div 
    className={`font-medium text-gray-900 ${editable ? 'cursor-pointer hover:bg-gray-100 px-2 py-1 rounded' : ''}`}
    onClick={onClick}
  >
    ₹{Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
  </div>
)

const DateCell = ({ value, editable, onClick }: any) => (
  <div 
    className={`text-gray-900 ${editable ? 'cursor-pointer hover:bg-gray-100 px-2 py-1 rounded' : ''}`}
    onClick={onClick}
  >
    {value ? new Date(value).toLocaleDateString('en-IN') : '-'}
  </div>
)

const BadgeCell = ({ value, options }: any) => {
  const option = options?.find((opt: any) => opt.value === value)
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      option?.color || 'bg-gray-100 text-gray-800'
    }`}>
      {option?.label || value || '-'}
    </span>
  )
}

const SelectCell = ({ value, options, editable, onClick }: any) => {
  const option = options.find((opt: any) => opt.value === value)
  return (
    <div 
      className={`text-gray-900 ${editable ? 'cursor-pointer hover:bg-gray-100 px-2 py-1 rounded' : ''}`}
      onClick={onClick}
    >
      {option?.label || value || '-'}
    </div>
  )
}

const TextCell = ({ value, editable, onClick }: any) => (
  <div 
    className={`text-gray-900 ${editable ? 'cursor-pointer hover:bg-gray-100 px-2 py-1 rounded' : ''}`}
    onClick={onClick}
  >
    {value || '-'}
  </div>
)

// Helper Components (continued in next part due to length...)
const InlineCellEditor = ({ column, value, row, onSave, onCancel, isProcessing }: InlineCellEditorProps) => {
  const [editValue, setEditValue] = useState(value || '')
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    // Validate
    if (column.validate) {
      const validationError = column.validate(editValue, row)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    onSave(editValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="flex items-center space-x-2 min-w-0">
      {column.type === 'select' ? (
        <select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] px-2 py-1 text-sm border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          autoFocus
        >
          <option value="">Select...</option>
          {column.options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={
            column.type === 'number' || column.type === 'currency' ? 'number' : 
            column.type === 'date' ? 'date' : 'text'
          }
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] px-2 py-1 text-sm border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={column.placeholder}
          autoFocus
        />
      )}
      
      <div className="flex items-center space-x-1">
        <button
          onClick={handleSave}
          disabled={isProcessing}
          className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
          title="Save"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onClick={onCancel}
          className="p-1 text-gray-600 hover:text-gray-800"
          title="Cancel"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      
      {error && (
        <div className="absolute z-10 mt-1 px-2 py-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded shadow-sm">
          {error}
        </div>
      )}
    </div>
  )
}

// Quick Add Row Component
const QuickAddRow = ({ columns, defaultValues, onSave, onCancel, isProcessing }: QuickAddRowProps) => {
  const [formData, setFormData] = useState<Partial<GridRow>>(defaultValues || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    
    // Validate required fields
    columns.forEach((column: GridColumn) => {
      if (column.required && !formData[column.key]) {
        newErrors[column.key] = `${column.title} is required`
      }
      
      // Custom validation
      if (column.validate && formData[column.key]) {
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
    <div className="border-b bg-green-50/50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add New Transaction</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.filter((col: GridColumn) => col.editable).map((column: GridColumn) => (
            <div key={column.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {column.title}
                {column.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {column.type === 'select' ? (
                <select
                  value={formData[column.key] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [column.key]: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors[column.key] ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select {column.title}...</option>
                  {column.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : column.type === 'date' ? (
                <input
                  type="date"
                  value={formData[column.key] || ''}
                  onChange={(e) => setFormData((prev: Partial<GridRow>) => ({ ...prev, [column.key]: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors[column.key] ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              ) : (
                <input
                  type={column.type === 'number' || column.type === 'currency' ? 'number' : 'text'}
                  value={formData[column.key] || ''}
                  onChange={(e) => setFormData((prev: Partial<GridRow>) => ({ ...prev, [column.key]: e.target.value }))}
                  placeholder={column.placeholder || `Enter ${column.title.toLowerCase()}...`}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors[column.key] ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              )}
              
              {errors[column.key] && (
                <p className="mt-1 text-sm text-red-600">{errors[column.key]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Edit Modal Component
const EditModal = ({ columns, data, onSave, onCancel, isProcessing }: EditModalProps) => {
  const [formData, setFormData] = useState<Partial<GridRow>>(data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    // Validate required fields
    columns.forEach((column: GridColumn) => {
      if (column.required && !formData[column.key]) {
        newErrors[column.key] = `${column.title} is required`
      }
      
      // Custom validation
      if (column.validate && formData[column.key]) {
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onCancel}
        ></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Edit Transaction</h3>
              <button
                type="button"
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {columns.filter((col: GridColumn) => col.editable).map((column: GridColumn) => (
                  <div key={column.key} className={column.key === 'description' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.title}
                      {column.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {column.type === 'select' ? (
                      <select
                        value={formData[column.key] || ''}
                        onChange={(e) => setFormData((prev: Partial<GridRow>) => ({ ...prev, [column.key]: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors[column.key] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select {column.title}...</option>
                        {column.options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : column.key === 'description' ? (
                      <textarea
                        value={formData[column.key] || ''}
                        onChange={(e) => setFormData((prev: Partial<GridRow>) => ({ ...prev, [column.key]: e.target.value }))}
                        placeholder={column.placeholder || `Enter ${column.title.toLowerCase()}...`}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors[column.key] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    ) : (
                      <input
                        type={
                          column.type === 'number' || column.type === 'currency' ? 'number' : 
                          column.type === 'date' ? 'date' : 'text'
                        }
                        value={formData[column.key] || ''}
                        onChange={(e) => setFormData((prev: Partial<GridRow>) => ({ ...prev, [column.key]: e.target.value }))}
                        placeholder={column.placeholder || `Enter ${column.title.toLowerCase()}...`}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors[column.key] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    )}
                    
                    {errors[column.key] && (
                      <p className="mt-1 text-sm text-red-600">{errors[column.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Loading State
const LoadingState = () => (
  <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading transactions...</p>
    </div>
  </div>
)

// Error State
const ErrorState = ({ error, onRetry }: { error: string, onRetry?: () => void }) => (
  <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
    <div className="text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
)

// Empty State
const EmptyState = ({ hasSearch, onAddFirst }: { hasSearch: boolean, onAddFirst?: () => void }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasSearch ? 'No results found' : 'No transactions yet'}
      </h3>
      <p className="text-gray-600 mb-4">
        {hasSearch 
          ? 'Try adjusting your search or filters'
          : 'Get started by adding your first transaction'
        }
      </p>
      {!hasSearch && onAddFirst && (
        <button
          onClick={onAddFirst}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Transaction
        </button>
      )}
    </div>
  </div>
)