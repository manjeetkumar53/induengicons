import type {
    ReportFilters,
    ProfitLossData,
    CashFlowData,
    IncomeSourceData,
    ExpenseCategoryData,
    TransactionSummaryData
} from './types'
import {
    queryTransactions,
    groupByPeriod,
    groupByField,
    calculatePercentages
} from './queryBuilder'

/**
 * Generate Profit & Loss Report
 */
export async function generateProfitLossReport(
    filters: ReportFilters
): Promise<ProfitLossData> {
    const transactions = await queryTransactions(filters)

    // Separate income and expenses
    const incomeTransactions = transactions.filter((t: any) => t.type === 'income')
    const expenseTransactions = transactions.filter((t: any) => t.type === 'expense')

    // Calculate summary
    const totalIncome = incomeTransactions.reduce((sum, t: any) => sum + t.amount, 0)
    const totalExpense = expenseTransactions.reduce((sum, t: any) => sum + t.amount, 0)
    const netProfit = totalIncome - totalExpense
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

    // Breakdown by period
    const groupBy = filters.groupBy || 'month'
    const periodGroups = groupByPeriod(transactions, groupBy)
    const breakdown = periodGroups.map(({ period, transactions: periodTrans }) => {
        const income = periodTrans
            .filter((t: any) => t.type === 'income')
            .reduce((sum, t: any) => sum + t.amount, 0)
        const expense = periodTrans
            .filter((t: any) => t.type === 'expense')
            .reduce((sum, t: any) => sum + t.amount, 0)

        return {
            period,
            income,
            expense,
            net: income - expense
        }
    })

    // Income by category
    const incomeByCategory = calculatePercentages(
        groupByField(incomeTransactions, 'categoryName')
            .map(group => ({
                category: String(group.categoryName),
                amount: group.total,
                count: group.count
            }))
    )

    // Expenses by category
    const expenseByCategory = calculatePercentages(
        groupByField(expenseTransactions, 'expenseCategoryName')
            .map(group => ({
                category: String(group.expenseCategoryName),
                amount: group.total,
                count: group.count
            }))
    )

    return {
        summary: {
            totalIncome,
            totalExpense,
            netProfit,
            profitMargin
        },
        breakdown,
        incomeByCategory,
        expenseByCategory
    }
}

/**
 * Generate Cash Flow Report
 */
export async function generateCashFlowReport(
    filters: ReportFilters
): Promise<CashFlowData> {
    const transactions = await queryTransactions(filters)

    const totalInflow = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum, t: any) => sum + t.amount, 0)

    const totalOutflow = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum, t: any) => sum + t.amount, 0)

    // Group by payment method
    const byPaymentMethod = groupByField(transactions, 'paymentMethod').map(group => {
        const inflow = group.transactions
            .filter((t: any) => t.type === 'income')
            .reduce((sum, t: any) => sum + t.amount, 0)
        const outflow = group.transactions
            .filter((t: any) => t.type === 'expense')
            .reduce((sum, t: any) => sum + t.amount, 0)

        return {
            method: String(group.paymentMethod),
            inflow,
            outflow,
            net: inflow - outflow,
            count: group.count
        }
    })

    // Group by period
    const groupBy = filters.groupBy || 'month'
    const periodGroups = groupByPeriod(transactions, groupBy)
    let cumulative = 0

    const byPeriod = periodGroups.map(({ period, transactions: periodTrans }) => {
        const inflow = periodTrans
            .filter((t: any) => t.type === 'income')
            .reduce((sum, t: any) => sum + t.amount, 0)
        const outflow = periodTrans
            .filter((t: any) => t.type === 'expense')
            .reduce((sum, t: any) => sum + t.amount, 0)

        cumulative += (inflow - outflow)

        return {
            period,
            inflow,
            outflow,
            cumulative
        }
    })

    return {
        summary: {
            totalInflow,
            totalOutflow,
            netFlow: totalInflow - totalOutflow,
            openingBalance: 0, // TODO: Get from previous period
            closingBalance: totalInflow - totalOutflow
        },
        byPaymentMethod,
        byPeriod
    }
}

/**
 * Generate Income Source Report
 */
export async function generateIncomeSourceReport(
    filters: ReportFilters
): Promise<IncomeSourceData> {
    const incomeFilters = { ...filters, type: 'income' as const }
    const transactions = await queryTransactions(incomeFilters)

    const totalIncome = transactions.reduce((sum, t: any) => sum + t.amount, 0)

    // Group by source
    const bySources = calculatePercentages(
        groupByField(transactions, 'source')
            .map(group => ({
                source: String(group.source),
                amount: group.total,
                count: group.count,
                avgTransaction: group.total / group.count
            }))
            .sort((a, b) => b.amount - a.amount)
    )

    // Trend by period
    const groupBy = filters.groupBy || 'month'
    const trend = groupByPeriod(transactions, groupBy).map(({ period, transactions: periodTrans }) => ({
        period,
        amount: periodTrans.reduce((sum, t: any) => sum + t.amount, 0)
    }))

    return {
        summary: {
            totalIncome,
            sourceCount: new Set(transactions.map((t: any) => t.source)).size,
            avgPerSource: bySources.length > 0
                ? totalIncome / bySources.length
                : 0
        },
        bySources,
        trend
    }
}

/**
 * Generate Expense Category Report
 */
export async function generateExpenseCategoryReport(
    filters: ReportFilters
): Promise<ExpenseCategoryData> {
    const expenseFilters = { ...filters, type: 'expense' as const }
    const transactions = await queryTransactions(expenseFilters)

    const totalExpense = transactions.reduce((sum, t: any) => sum + t.amount, 0)

    // Group by category
    const byCategory = calculatePercentages(
        groupByField(transactions, 'expenseCategoryName')
            .map(group => ({
                category: String(group.expenseCategoryName),
                amount: group.total,
                count: group.count,
                avgTransaction: group.total / group.count
            }))
            .sort((a, b) => b.amount - a.amount)
    )

    // Trend by period
    const groupBy = filters.groupBy || 'month'
    const trend = groupByPeriod(transactions, groupBy).map(({ period, transactions: periodTrans }) => ({
        period,
        amount: periodTrans.reduce((sum, t: any) => sum + t.amount, 0)
    }))

    return {
        summary: {
            totalExpense,
            categoryCount: new Set(transactions.map((t: any) => t.expenseCategoryName)).size,
            avgPerCategory: byCategory.length > 0
                ? totalExpense / byCategory.length
                : 0
        },
        byCategory,
        trend
    }
}

/**
 * Generate Transaction Summary
 */
export async function generateTransactionSummary(
    filters: ReportFilters
): Promise<TransactionSummaryData> {
    const transactions = await queryTransactions(filters)

    const totalIncome = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum, t: any) => sum + t.amount, 0)

    const totalExpense = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum, t: any) => sum + t.amount, 0)

    const pendingCount = transactions.filter((t: any) => t.status === 'pending').length

    const today = new Date().toISOString().split('T')[0]
    const todayCount = transactions.filter((t: any) =>
        t.date && t.date.toString().startsWith(today)
    ).length

    // Group by status
    const byStatus = groupByField(transactions, 'status')
        .map(group => ({
            status: String(group.status),
            count: group.count
        }))

    // Recent transactions
    const recent = transactions
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
        .map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            date: t.date
        }))

    return {
        summary: {
            totalTransactions: transactions.length,
            totalIncome,
            totalExpense,
            pendingCount,
            todayCount
        },
        byType: {
            income: {
                count: transactions.filter((t: any) => t.type === 'income').length,
                amount: totalIncome
            },
            expense: {
                count: transactions.filter((t: any) => t.type === 'expense').length,
                amount: totalExpense
            }
        },
        byStatus,
        recent
    }
}
