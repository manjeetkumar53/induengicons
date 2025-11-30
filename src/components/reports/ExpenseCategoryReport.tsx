'use client'

import React, { useState, useEffect } from 'react'
import { ReportHeader } from './shared/ReportHeader'
import { KPICard } from './shared/KPICard'
import { ReportChart } from './shared/ReportChart'
import { ReportTable } from './shared/ReportTable'
import { formatCurrency } from '@/lib/utils'
import type { ReportFilters, ExpenseCategoryData } from '@/lib/reports/types'

export function ExpenseCategoryReport() {
    const [filters, setFilters] = useState<ReportFilters>({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
        endDate: new Date().toISOString(),
        groupBy: 'month'
    })

    const [data, setData] = useState<ExpenseCategoryData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/reports/expense-category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            })

            if (!response.ok) throw new Error('Failed to fetch report')

            const result = await response.json()
            if (result.success) {
                setData(result.data)
            } else {
                setError(result.error || 'Failed to load report')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [filters])

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>
    }

    return (
        <div className="space-y-6">
            <ReportHeader
                title="Expenses by Category"
                description="Spending analysis by expense categories"
                filters={filters}
                onFilterChange={setFilters}
                onRefresh={fetchData}
                loading={loading}
                showProjectFilter
                showCategoryFilter
            />

            {data && (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <KPICard
                            title="Total Expenses"
                            value={formatCurrency(data.summary.totalExpense)}
                            valueClassName="text-red-600"
                        />
                        <KPICard
                            title="Active Categories"
                            value={data.summary.categoryCount}
                        />
                        <KPICard
                            title="Avg per Category"
                            value={formatCurrency(data.summary.avgPerCategory)}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <ReportChart
                            title="Expense Distribution"
                            type="pie"
                            data={data.byCategory}
                            dataKeys={[
                                { key: 'amount', color: '#ef4444', name: 'Amount' }
                            ]}
                        />
                        <ReportChart
                            title="Expense Trend"
                            type="area"
                            data={data.trend}
                            xAxisKey="period"
                            dataKeys={[
                                { key: 'amount', color: '#ef4444', name: 'Expenses' }
                            ]}
                        />
                    </div>

                    <ReportTable
                        title="Category Breakdown"
                        data={data.byCategory}
                        columns={[
                            { header: 'Category', accessorKey: 'category' },
                            {
                                header: 'Amount',
                                accessorKey: 'amount',
                                align: 'right',
                                cell: (item) => <span className="font-medium text-red-600">{formatCurrency(item.amount)}</span>
                            },
                            {
                                header: 'Percentage',
                                accessorKey: 'percentage',
                                align: 'right',
                                cell: (item) => `${item.percentage.toFixed(1)}%`
                            },
                            { header: 'Transactions', accessorKey: 'count', align: 'center' },
                            {
                                header: 'Avg Transaction',
                                accessorKey: 'avgTransaction',
                                align: 'right',
                                cell: (item) => formatCurrency(item.avgTransaction)
                            }
                        ]}
                    />
                </>
            )}
        </div>
    )
}
