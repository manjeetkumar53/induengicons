'use client'

import React, { useState, useEffect } from 'react'
import { ReportHeader } from './shared/ReportHeader'
import { KPICard } from './shared/KPICard'
import { ReportChart } from './shared/ReportChart'
import { ReportTable } from './shared/ReportTable'
import { formatCurrency } from '@/lib/utils'
import type { ReportFilters, IncomeSourceData } from '@/lib/reports/types'

export function IncomeSourceReport() {
    const [filters, setFilters] = useState<ReportFilters>({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
        endDate: new Date().toISOString(),
        groupBy: 'month'
    })

    const [data, setData] = useState<IncomeSourceData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/reports/income-source', {
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
                title="Income by Source"
                description="Analysis of revenue sources and trends"
                filters={filters}
                onFilterChange={setFilters}
                onRefresh={fetchData}
                loading={loading}
                showProjectFilter
            />

            {data && (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <KPICard
                            title="Total Income"
                            value={formatCurrency(data.summary.totalIncome)}
                            valueClassName="text-green-600"
                        />
                        <KPICard
                            title="Active Sources"
                            value={data.summary.sourceCount}
                        />
                        <KPICard
                            title="Avg per Source"
                            value={formatCurrency(data.summary.avgPerSource)}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <ReportChart
                            title="Income Distribution"
                            type="pie"
                            data={data.bySources}
                            dataKeys={[
                                { key: 'amount', color: '#8884d8', name: 'Amount' }
                            ]}
                        />
                        <ReportChart
                            title="Income Trend"
                            type="area"
                            data={data.trend}
                            xAxisKey="period"
                            dataKeys={[
                                { key: 'amount', color: '#10b981', name: 'Income' }
                            ]}
                        />
                    </div>

                    <ReportTable
                        title="Source Breakdown"
                        data={data.bySources}
                        columns={[
                            { header: 'Source', accessorKey: 'source' },
                            {
                                header: 'Amount',
                                accessorKey: 'amount',
                                align: 'right',
                                cell: (item) => <span className="font-medium">{formatCurrency(item.amount)}</span>
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
