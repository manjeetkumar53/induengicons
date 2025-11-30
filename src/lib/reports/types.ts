/**
 * Report filter interface
 */
export interface ReportFilters {
    startDate: string
    endDate: string
    projectId?: string
    projectName?: string  // For natural language queries
    type?: 'income' | 'expense' | 'all'
    status?: string[]
    groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year'
    categoryId?: string
    paymentMethod?: string
}

/**
 * Standard API response wrapper
 */
export interface ReportResult<T> {
    success: boolean
    data: T
    metadata: {
        filters: ReportFilters
        generatedAt: string
        recordCount: number
        cached: boolean
        cacheAge?: number
        latency: number
    }
    error?: string
}

/**
 * Profit & Loss Report Data
 */
export interface ProfitLossData {
    summary: {
        totalIncome: number
        totalExpense: number
        netProfit: number
        profitMargin: number
    }
    breakdown: Array<{
        period: string
        income: number
        expense: number
        net: number
    }>
    incomeByCategory: Array<{
        category: string
        amount: number
        percentage: number
        count: number
    }>
    expenseByCategory: Array<{
        category: string
        amount: number
        percentage: number
        count: number
    }>
}

/**
 * Cash Flow Report Data
 */
export interface CashFlowData {
    summary: {
        totalInflow: number
        totalOutflow: number
        netFlow: number
        openingBalance: number
        closingBalance: number
    }
    byPaymentMethod: Array<{
        method: string
        inflow: number
        outflow: number
        net: number
        count: number
    }>
    byPeriod: Array<{
        period: string
        inflow: number
        outflow: number
        cumulative: number
    }>
}

/**
 * Income Source Report Data
 */
export interface IncomeSourceData {
    summary: {
        totalIncome: number
        sourceCount: number
        avgPerSource: number
    }
    bySources: Array<{
        source: string
        amount: number
        percentage: number
        count: number
        avgTransaction: number
    }>
    trend: Array<{
        period: string
        amount: number
    }>
}

/**
 * Expense Category Report Data
 */
export interface ExpenseCategoryData {
    summary: {
        totalExpense: number
        categoryCount: number
        avgPerCategory: number
    }
    byCategory: Array<{
        category: string
        amount: number
        percentage: number
        count: number
        avgTransaction: number
    }>
    trend: Array<{
        period: string
        amount: number
    }>
}

/**
 * Transaction Summary Data
 */
export interface TransactionSummaryData {
    summary: {
        totalTransactions: number
        totalIncome: number
        totalExpense: number
        pendingCount: number
        todayCount: number
    }
    byType: {
        income: { count: number; amount: number }
        expense: { count: number; amount: number }
    }
    byStatus: Array<{
        status: string
        count: number
    }>
    recent: Array<{
        id: string
        type: string
        amount: number
        description: string
        date: string
    }>
}
