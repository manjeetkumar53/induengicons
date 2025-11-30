'use client'

import React, { useState, useEffect } from 'react'
import { ReportHeader } from './shared/ReportHeader'
import { KPICard } from './shared/KPICard'
import { ReportTable } from './shared/ReportTable'
import { formatCurrency } from '@/lib/utils'
import type { ReportFilters, TransactionSummaryData } from '@/lib/reports/types'
import { format } from 'date-fns'

export function TransactionSummary() {
    const [filters, setFilters] = useState<ReportFilters>({
        startDate: new Date().toISOString(), // Today
        endDate: new Date().toISOString()
    })

    const [data, setData] = useState<TransactionSummaryData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/reports/transaction-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            })

            if (!response.ok) throw new Error('Failed to fetch summary')

            const result = await response.json()
            if (result.success) {
                setData(result.data)
            } else {
                setError(result.error || 'Failed to load summary')
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
                title="Transaction Summary"
                description="Real-time transaction overview"
                filters={filters}
                onFilterChange={setFilters}
                onRefresh={fetchData}
                loading={loading}
                showProjectFilter
            />

            {data && (
                <>
                    <div className="grid gap-4 md:grid-cols-4">
                        <KPICard
                            title="Total Transactions"
                            value={data.summary.totalTransactions}
                        />
                        <KPICard
                            title="Today's Count"
                            value={data.summary.todayCount}
                            subValue="Transactions today"
                        />
                        <KPICard
                            title="Pending"
                            value={data.summary.pendingCount}
                            valueClassName="text-orange-500"
                        />
                        <KPICard
                            title="Net Volume"
                            value={formatCurrency(data.summary.totalIncome - data.summary.totalExpense)}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <KPICard
                            title="Total Income"
                            value={formatCurrency(data.byType.income.amount)}
                            subValue={`${data.byType.income.count} transactions`}
                            valueClassName="text-green-600"
                        />
                        <KPICard
                            title="Total Expenses"
                            value={formatCurrency(data.byType.expense.amount)}
                            subValue={`${data.byType.expense.count} transactions`}
                            valueClassName="text-red-600"
                        />
                    </div>

                    <ReportTable
                        title="Recent Transactions"
                        data={data.recent}
                        columns={[
                            {
                                header: 'Date',
                                accessorKey: 'date',
                                cell: (item) => format(new Date(item.date), 'MMM dd, HH:mm')
                            },
                            { header: 'Description', accessorKey: 'description' },
                            {
                                header: 'Type',
                                accessorKey: 'type',
                                cell: (item) => (
                                    <span className={item.type === 'income' ? "text-green-600 capitalize" : "text-red-600 capitalize"}>
                                        {item.type}
                                    </span>
                                )
                            },
                            {
                                header: 'Amount',
                                accessorKey: 'amount',
                                align: 'right',
                                cell: (item) => (
                                    <span className={item.type === 'income' ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
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
