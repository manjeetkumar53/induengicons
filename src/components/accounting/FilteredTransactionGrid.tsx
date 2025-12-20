'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import AdvancedDataGrid, { GridColumn, GridRow } from './AdvancedDataGrid'
import QuickCategoryModal from '../modals/QuickCategoryModal'
import QuickProjectModal from '../modals/QuickProjectModal'
import { ProjectRow, CategoryRow, TransactionRow } from '@/types/components'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
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

interface FilteredTransactionGridProps {
    filterType: 'income' | 'expense'
    userId?: string
}

export default function FilteredTransactionGrid({ filterType, userId }: FilteredTransactionGridProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [projects, setProjects] = useState<ProjectRow[]>([])
    const [categories, setCategories] = useState<CategoryRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Quick creation modals
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [showProjectModal, setShowProjectModal] = useState(false)
    const [pendingTransactionData, setPendingTransactionData] = useState<Record<string, unknown> | null>(null)
    const [pendingCategoryName, setPendingCategoryName] = useState('')
    const [pendingProjectName, setPendingProjectName] = useState('')

    // Filter transactions by type
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => t.type === filterType)
    }, [transactions, filterType])

    // Stats for filtered data only
    const stats = useMemo(() => ({
        total: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
        count: filteredTransactions.length,
        thisMonth: filteredTransactions
            .filter(t => {
                const transactionDate = new Date(t.date)
                const now = new Date()
                return transactionDate.getMonth() === now.getMonth() &&
                    transactionDate.getFullYear() === now.getFullYear()
            })
            .reduce((sum, t) => sum + t.amount, 0)
    }), [filteredTransactions])

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
            const response = await fetch(`/api/admin/accounting/transactions?type=${filterType}`)
            if (!response.ok) throw new Error('Failed to load transactions')
            const data = await response.json()

            // Normalize data
            const normalizedTransactions = (data.transactions || []).map((t: Record<string, unknown> & { _id?: string; id?: string }, index: number) => ({
                ...t,
                id: String(t._id || t.id || `transaction-${index}`),
                source: String(t.source || (t as Record<string, unknown>).vendor || ''),
                category: String((t as any).categoryId?.name || (t as any).categoryName || ''),
                project: String((t as any).projectId?.name || (t as any).projectName || '')
            }))

            setTransactions(normalizedTransactions)
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
            const response = await fetch('/api/admin/accounting/transaction-categories')
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
            // Ensure we have a category
            let categoryId = null
            if (newTransaction.category) {
                const foundCategory = categories.find(c => c.name === newTransaction.category)
                if (foundCategory) {
                    categoryId = foundCategory._id
                }
            }

            if (!categoryId && categories.length > 0) {
                categoryId = categories[0]._id
            }

            if (!categoryId) {
                throw new Error('No transaction category available.')
            }

            // Map project name to projectId
            let projectId = null
            if (newTransaction.project) {
                const foundProject = projects.find(p => p.name === newTransaction.project)
                if (foundProject) {
                    projectId = foundProject._id
                }
            }

            // Prepare API data
            const apiData = {
                type: filterType, // Force the type based on filter
                amount: Number(newTransaction.amount),
                description: newTransaction.description?.trim() || '',
                date: newTransaction.date,
                transactionCategoryId: categoryId,
                paymentMethod: newTransaction.paymentMethod || 'cash',
                ...(projectId && { projectId }),
                ...(newTransaction.source && { source: newTransaction.source.trim() }),
                ...(newTransaction.receiptNumber && { receiptNumber: newTransaction.receiptNumber.trim() }),
                ...(newTransaction.notes && { notes: newTransaction.notes.trim() }),
                ...(newTransaction.tags ? { tags: newTransaction.tags } : {}),
                ...(userId && { userId })
            }

            const response = await fetch('/api/admin/accounting/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`
                throw new Error(`Failed to create transaction: ${errorMessage}`)
            }

            const result = await response.json()
            await loadTransactions()
            return result.transaction
        } catch (err) {
            console.error('Failed to add transaction:', err)
            throw err
        }
    }, [userId, projects, categories, filterType])

    const handleCategoryCreated = useCallback((newCategory: CategoryRow) => {
        setCategories(prev => [...prev, newCategory])
        setShowCategoryModal(false)
        setPendingCategoryName('')

        if (pendingTransactionData) {
            const updatedData = { ...pendingTransactionData, category: newCategory.name }
            handleAdd(updatedData)
            setPendingTransactionData(null)
        }
    }, [pendingTransactionData, handleAdd])

    const handleProjectCreated = useCallback((newProject: ProjectRow) => {
        setProjects(prev => [...prev, newProject])
        setShowProjectModal(false)
        setPendingProjectName('')

        if (pendingTransactionData) {
            const updatedData = { ...pendingTransactionData, project: newProject.name }
            handleAdd(updatedData)
            setPendingTransactionData(null)
        }
    }, [pendingTransactionData, handleAdd])

    const handleAddWithQuickCreate = useCallback(async (newTransaction: Partial<Transaction>) => {
        const categoryExists = categories.find(c => c.name.toLowerCase() === newTransaction.category?.toLowerCase())
        const projectExists = newTransaction.project ? projects.find(p => p.name.toLowerCase() === newTransaction.project?.toLowerCase()) : true

        if (newTransaction.category && !categoryExists) {
            if (confirm(`Category "${newTransaction.category}" doesn't exist. Would you like to create it?`)) {
                setPendingTransactionData(newTransaction)
                setPendingCategoryName(newTransaction.category)
                setShowCategoryModal(true)
                return
            } else {
                newTransaction = { ...newTransaction, category: categories.length > 0 ? categories[0].name : '' }
            }
        }

        if (newTransaction.project && !projectExists) {
            if (confirm(`Project "${newTransaction.project}" doesn't exist. Would you like to create it?`)) {
                setPendingTransactionData(newTransaction)
                setPendingProjectName(newTransaction.project)
                setShowProjectModal(true)
                return
            } else {
                newTransaction = { ...newTransaction, project: '' }
            }
        }

        return handleAdd(newTransaction)
    }, [categories, projects, handleAdd])

    const handleEdit = useCallback(async (id: string, updatedData: Partial<Transaction>) => {
        try {
            const apiData: Record<string, unknown> = { ...updatedData }

            if ('source' in updatedData) {
                apiData.source = updatedData.source
            }

            if (updatedData.category) {
                const foundCategory = categories.find(c => c.name === updatedData.category)
                if (foundCategory) {
                    apiData.categoryId = foundCategory._id
                    delete apiData.category
                }
            }

            if (updatedData.project) {
                const foundProject = projects.find(p => p.name === updatedData.project)
                if (foundProject) {
                    apiData.projectId = foundProject._id
                    delete apiData.project
                } else if (updatedData.project === '') {
                    apiData.projectId = null
                    delete apiData.project
                }
            }

            const response = await fetch(`/api/admin/accounting/transactions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData)
            })

            if (!response.ok) throw new Error('Failed to update transaction')

            await loadTransactions()
        } catch (err) {
            console.error('Failed to edit transaction:', err)
            throw new Error('Failed to update transaction')
        }
    }, [categories, projects])

    const handleDelete = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/admin/accounting/transactions/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete transaction')

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

            await loadTransactions()
        } catch (err) {
            console.error('Failed to bulk delete:', err)
            throw new Error('Failed to delete transactions')
        }
    }, [])

    // Column definitions - HIDE the Type column since it's filtered
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
            type: 'creatable-select',
            width: '150px',
            editable: true,
            sortable: true,
            filterable: true,
            required: true,
            options: categories.map(c => ({ value: c.name, label: c.name })),
            onCreate: (value) => {
                setPendingCategoryName(value)
                setShowCategoryModal(true)
            }
        },
        {
            key: 'project',
            title: 'Project',
            type: 'creatable-select',
            width: '150px',
            editable: true,
            sortable: true,
            filterable: true,
            options: projects.map(p => ({ value: p.name, label: p.name })),
            onCreate: (value) => {
                setPendingProjectName(value)
                setShowProjectModal(true)
            }
        },
        {
            key: 'source',
            title: filterType === 'income' ? 'Source' : 'Vendor',
            type: 'text',
            width: '150px',
            editable: true,
            sortable: true,
            filterable: true,
            placeholder: `Enter ${filterType === 'income' ? 'source' : 'vendor'}...`
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
                { value: 'card', label: 'Debit/Credit Card' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'neft', label: 'NEFT' },
                { value: 'rtgs', label: 'RTGS' },
                { value: 'other', label: 'Other' }
            ]
        },
        {
            key: 'receiptNumber',
            title: 'Receipt #',
            type: 'text',
            width: '120px',
            editable: true,
            sortable: true,
            filterable: true,
            placeholder: 'Receipt number...'
        },
        {
            key: 'notes',
            title: 'Notes',
            type: 'text',
            width: '200px',
            editable: true,
            sortable: false,
            filterable: true,
            placeholder: 'Additional notes...'
        },
        {
            key: 'createdAt',
            title: 'Created',
            type: 'readonly',
            width: '120px',
            editable: false,
            sortable: true,
            render: (value) => value && typeof value === 'string' ? new Date(value).toLocaleDateString('en-IN') : '-'
        }
    ], [categories, projects, filterType])

    // Custom actions
    const customActions = [
        {
            label: 'View Receipt',
            icon: Receipt,
            onClick: (row: GridRow) => {
                console.log('View receipt for:', row)
            },
            className: 'text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors'
        }
    ]

    // Default values - with type pre-set
    const defaultValues = useMemo(() => ({
        type: filterType,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        amount: '',
        description: '',
        category: ''
    }), [categories, filterType])

    const typeLabel = filterType === 'income' ? 'Income' : 'Expense'
    const color = filterType === 'income' ? 'green' : 'red'

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-lg p-6 text-white`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-${color}-100 text-sm`}>Total {typeLabel}</p>
                            <p className="text-2xl font-bold">₹{stats.total.toLocaleString('en-IN')}</p>
                        </div>
                        {filterType === 'income' ? (
                            <TrendingUp className="h-8 w-8 text-green-200" />
                        ) : (
                            <TrendingDown className="h-8 w-8 text-red-200" />
                        )}
                    </div>
                </div>

                <div className={`bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">This Month</p>
                            <p className="text-2xl font-bold">₹{stats.thisMonth.toLocaleString('en-IN')}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Total Transactions</p>
                            <p className="text-2xl font-bold">{stats.count}</p>
                        </div>
                        <Receipt className="h-8 w-8 text-purple-200" />
                    </div>
                </div>
            </div>

            {/* Advanced Data Grid */}
            <AdvancedDataGrid
                title={`${typeLabel} Transactions`}
                subtitle={`Manage all your ${typeLabel.toLowerCase()} transactions in one place`}
                columns={columns}
                data={filteredTransactions}
                loading={loading}
                error={error}
                searchPlaceholder={`Search ${typeLabel.toLowerCase()} transactions...`}
                pageSize={25}
                enableAdd={true}
                enableEdit={true}
                enableDelete={true}
                enableBulkActions={true}
                enableFullscreen={true}
                enableFilters={true}
                onAdd={handleAddWithQuickCreate}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBulkDelete={handleBulkDelete}
                onRefresh={loadAllData}
                customActions={customActions}
                defaultValues={defaultValues}
            />

            {/* Quick Creation Modals */}
            <QuickCategoryModal
                isOpen={showCategoryModal}
                onClose={() => {
                    setShowCategoryModal(false)
                    setPendingTransactionData(null)
                    setPendingCategoryName('')
                }}
                onSave={(n: any) => handleCategoryCreated(n)}
                defaultType={filterType === 'income' ? 'revenue' : 'expense'}
                initialName={pendingCategoryName}
            />

            <QuickProjectModal
                isOpen={showProjectModal}
                onClose={() => {
                    setShowProjectModal(false)
                    setPendingTransactionData(null)
                    setPendingProjectName('')
                }}
                onSave={(n: any) => handleProjectCreated(n)}
                initialName={pendingProjectName}
            />
        </div>
    )
}
