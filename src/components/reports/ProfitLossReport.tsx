'use client'

import React, { useState, useEffect } from 'react'
import { ReportHeader } from './shared/ReportHeader'
import { KPICard } from './shared/KPICard'
import { ReportChart } from './shared/ReportChart'
import { ReportTable } from './shared/ReportTable'
import { formatCurrency } from '@/lib/utils'
import type { ReportFilters, ProfitLossData } from '@/lib/reports/types'

export function ProfitLossReport() {
    const [filters, setFilters] = useState<ReportFilters>({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(), // Start of year
        endDate: new Date().toISOString(),
        groupBy: 'month'
    })

    const [data, setData] = useState<ProfitLossData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/reports/profit-loss', {
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
                title="Profit & Loss Statement"
                description="Income, expenses, and net profit over time"
                filters={filters}
                onFilterChange={setFilters}
                onRefresh={fetchData}
                loading={loading}
                showProjectFilter
            />

            {data && (
                <>
                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <KPICard
                            title="Total Income"
                            value={formatCurrency(data.summary.totalIncome)}
                            trend={12.5} // TODO: Calculate actual trend
                            trendLabel="vs last period"
                        />
                        <KPICard
                            title="Total Expenses"
                            value={formatCurrency(data.summary.totalExpense)}
                            trend={-2.4}
                            trendLabel="vs last period"
                        />
                        <KPICard
                            title="Net Profit"
                            value={formatCurrency(data.summary.netProfit)}
                            trend={8.2}
                            trendLabel="vs last period"
                            valueClassName={data.summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}
                        />
                        <KPICard
                            title="Profit Margin"
                            value={`${data.summary.profitMargin.toFixed(1)}%`}
                            subValue="Target: 20%"
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <ReportChart
                            title="Income vs Expenses"
                            type="area"
                            data={data.breakdown}
                            xAxisKey="period"
                            dataKeys={[
                                { key: 'income', color: '#10b981', name: 'Income' },
                                { key: 'expense', color: '#ef4444', name: 'Expenses' }
                            ]}
                        />
                        <ReportChart
                            title="Net Profit Trend"
                            type="bar"
                            data={data.breakdown}
                            xAxisKey="period"
                            dataKeys={[
                                { key: 'net', color: '#3b82f6', name: 'Net Profit' }
                            ]}
                        />
                    </div>

                    {/* Detailed Table */}
                    <ReportTable
                        title="Detailed Breakdown"
                        data={data.breakdown}
                        columns={[
                            { header: 'Period', accessorKey: 'period' },
                            {
                                header: 'Income',
                                accessorKey: 'income',
                                align: 'right',
                                cell: (item) => <span className="text-green-600">{formatCurrency(item.income)}</span>
                            },
                            {
                                header: 'Expenses',
                                accessorKey: 'expense',
                                align: 'right',
                                cell: (item) => <span className="text-red-600">{formatCurrency(item.expense)}</span>
                            },
                            {
                                header: 'Net Profit',
                                accessorKey: 'net',
                                align: 'right',
                                cell: (item) => (
                                    <span className={item.net >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                        {formatCurrency(item.net)}
                                    </span>
                                )
                            }
                        ]}
                    />
                </>
            )}
        </div>
    )
}
