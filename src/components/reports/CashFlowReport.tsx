'use client'

import React, { useState, useEffect } from 'react'
import { ReportHeader } from './shared/ReportHeader'
import { KPICard } from './shared/KPICard'
import { ReportChart } from './shared/ReportChart'
import { ReportTable } from './shared/ReportTable'
import { formatCurrency } from '@/lib/utils'
import type { ReportFilters, CashFlowData } from '@/lib/reports/types'

export function CashFlowReport() {
    const [filters, setFilters] = useState<ReportFilters>({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
        endDate: new Date().toISOString(),
        groupBy: 'month'
    })

    const [data, setData] = useState<CashFlowData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/reports/cash-flow', {
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
                title="Cash Flow Report"
                description="Inflow and outflow analysis by payment method"
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
                            title="Total Inflow"
                            value={formatCurrency(data.summary.totalInflow)}
                            valueClassName="text-green-600"
                        />
                        <KPICard
                            title="Total Outflow"
                            value={formatCurrency(data.summary.totalOutflow)}
                            valueClassName="text-red-600"
                        />
                        <KPICard
                            title="Net Cash Flow"
                            value={formatCurrency(data.summary.netFlow)}
                            valueClassName={data.summary.netFlow >= 0 ? "text-green-600" : "text-red-600"}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <ReportChart
                            title="Cash Flow Trend"
                            type="bar"
                            data={data.byPeriod}
                            xAxisKey="period"
                            dataKeys={[
                                { key: 'inflow', color: '#10b981', name: 'Inflow' },
                                { key: 'outflow', color: '#ef4444', name: 'Outflow' }
                            ]}
                        />
                        <ReportChart
                            title="Cumulative Cash Flow"
                            type="line"
                            data={data.byPeriod}
                            xAxisKey="period"
                            dataKeys={[
                                { key: 'cumulative', color: '#3b82f6', name: 'Cumulative Balance' }
                            ]}
                        />
                    </div>

                    <ReportTable
                        title="Breakdown by Payment Method"
                        data={data.byPaymentMethod}
                        columns={[
                            { header: 'Payment Method', accessorKey: 'method' },
                            {
                                header: 'Inflow',
                                accessorKey: 'inflow',
                                align: 'right',
                                cell: (item) => <span className="text-green-600">{formatCurrency(item.inflow)}</span>
                            },
                            {
                                header: 'Outflow',
                                accessorKey: 'outflow',
                                align: 'right',
                                cell: (item) => <span className="text-red-600">{formatCurrency(item.outflow)}</span>
                            },
                            {
                                header: 'Net Flow',
                                accessorKey: 'net',
                                align: 'right',
                                cell: (item) => (
                                    <span className={item.net >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                        {formatCurrency(item.net)}
                                    </span>
                                )
                            },
                            { header: 'Transactions', accessorKey: 'count', align: 'center' }
                        ]}
                    />
                </>
            )}
        </div>
    )
}
