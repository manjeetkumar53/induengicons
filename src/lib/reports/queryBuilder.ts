import dbConnect from '@/lib/mongodb'
import { Transaction } from '@/lib/models'
import type { ReportFilters } from './types'

/**
 * Build MongoDB query from report filters
 */
export function buildTransactionQuery(filters: ReportFilters) {
    const query: any = {}

    // Date range filter (required)
    if (filters.startDate || filters.endDate) {
        query.date = {}
        if (filters.startDate) query.date.$gte = new Date(filters.startDate)
        if (filters.endDate) query.date.$lte = new Date(filters.endDate)
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
        query.type = filters.type
    }

    // Project filter
    if (filters.projectId) {
        query.projectId = filters.projectId
    }

    if (filters.projectName) {
        query.projectName = new RegExp(filters.projectName, 'i')
    }

    // Category filter
    if (filters.categoryId) {
        query.categoryId = filters.categoryId
    }

    // Payment method filter
    if (filters.paymentMethod) {
        query.paymentMethod = filters.paymentMethod
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
        query.status = { $in: filters.status }
    }

    return query
}

/**
 * Query transactions with filters
 */
export async function queryTransactions(filters: ReportFilters) {
    await dbConnect()

    const query = buildTransactionQuery(filters)

    const transactions = await Transaction.find(query)
        .populate('projectId', 'name')
        .populate('categoryId', 'name')
        .populate('expenseCategoryId', 'name')
        .sort({ date: -1 })
        .lean()

    // Normalize data
    // Normalize data
    return transactions.map((t: any) => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.date,
        projectId: t.projectId?._id?.toString(),
        projectName: t.projectId?.name || t.projectName,
        categoryId: t.categoryId?._id?.toString(),
        categoryName: t.categoryId?.name || t.categoryName,
        expenseCategoryId: t.expenseCategoryId?._id?.toString(),
        expenseCategoryName: t.expenseCategoryId?.name || t.expenseCategoryName,
        source: t.source,
        paymentMethod: t.paymentMethod,
        receiptNumber: t.receiptNumber,
        status: t.status,
        createdBy: t.createdBy,
        createdAt: t.createdAt
    }))
}

/**
 * Group transactions by period
 */
interface TransactionForGrouping {
    date: Date | string;
    [key: string]: unknown;
}

export function groupByPeriod(
    transactions: TransactionForGrouping[],
    groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'
) {
    const grouped = new Map<string, TransactionForGrouping[]>()

    transactions.forEach(t => {
        const date = new Date(t.date)
        let key: string

        switch (groupBy) {
            case 'day':
                key = date.toISOString().split('T')[0]
                break
            case 'week':
                const weekStart = new Date(date)
                weekStart.setDate(date.getDate() - date.getDay())
                key = weekStart.toISOString().split('T')[0]
                break
            case 'month':
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                break
            case 'quarter':
                const quarter = Math.floor(date.getMonth() / 3) + 1
                key = `${date.getFullYear()}-Q${quarter}`
                break
            case 'year':
                key = String(date.getFullYear())
                break
        }

        if (!grouped.has(key)) {
            grouped.set(key, [])
        }
        grouped.get(key)!.push(t)
    })

    return Array.from(grouped.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([period, transactions]) => ({ period, transactions }))
}

/**
 * Group transactions by field
 */
export function groupByField(
    transactions: Record<string, unknown>[],
    field: string
) {
    const grouped = new Map<string, Record<string, unknown>[]>()

    transactions.forEach(t => {
        const key = String(t[field] || 'Unknown')
        if (!grouped.has(key)) {
            grouped.set(key, [])
        }
        grouped.get(key)!.push(t)
    })

    return Array.from(grouped.entries()).map(([key, transactions]) => ({
        [field]: key,
        transactions,
        count: transactions.length,
        total: transactions.reduce((sum, t) => sum + (t.amount as number || 0), 0)
    }))
}

/**
 * Calculate percentage distribution
 */
export function calculatePercentages<T extends { amount: number }>(
    items: T[]
): (T & { percentage: number })[] {
    const grandTotal = items.reduce((sum, item) => sum + item.amount, 0)

    return items.map(item => ({
        ...item,
        percentage: grandTotal > 0 ? (item.amount / grandTotal) * 100 : 0
    }))
}
