'use client'

import { useState, useEffect } from 'react'
import DataGrid, { Column } from '../common/DataGrid'
import { BarChart3, TrendingUp, Download, Eye, Calendar } from 'lucide-react'

interface ReportData {
  id: string
  period: string
  totalIncome: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  transactionCount: number
  averageTransactionSize: number
  topIncomeSource?: string
  topExpenseCategory?: string
  createdAt: string
}

interface ReportsGridProps {
  onGenerateReport?: () => void
  onViewReport?: (report: ReportData) => void
  onExportReport?: (report: ReportData, format: 'pdf' | 'excel') => void
}

export default function ReportsGrid({
  onGenerateReport,
  onViewReport,
  onExportReport
}: ReportsGridProps) {
  const [reports, setReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly')

  // Fetch data
  useEffect(() => {
    fetchReports()
  }, [selectedPeriod])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/accounting/reports?period=${selectedPeriod}`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      setReports(data.reports || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (row: any) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/accounting/reports/${row.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete report')

      // Update local state
      setReports(prev => prev.filter(r => r.id !== row.id))
    } catch (err) {
      throw new Error('Failed to delete report')
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async (rows: any[]) => {
    if (!confirm(`Are you sure you want to delete ${rows.length} reports?`)) {
      return
    }

    try {
      await Promise.all(
        rows.map(row =>
          fetch(`/api/admin/accounting/reports/${row.id}`, {
            method: 'DELETE'
          })
        )
      )

      // Update local state
      const deletedIds = rows.map(r => r.id)
      setReports(prev => prev.filter(r => !deletedIds.includes(r.id)))
    } catch (err) {
      throw new Error('Failed to delete reports')
    }
  }

  // Define columns
  const columns: Column[] = [
    {
      key: 'period',
      title: 'Period',
      type: 'text',
      width: '150px',
      editable: false,
      sortable: true,
      render: (value) => (
        <div className="font-medium text-gray-900">
          {value as React.ReactNode}
        </div>
      )
    },
    {
      key: 'totalIncome',
      title: 'Total Income',
      type: 'currency',
      width: '130px',
      editable: false,
      sortable: true,
      render: (value) => (
        <span className="font-medium text-green-600">
          ₹{Number(value || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'totalExpenses',
      title: 'Total Expenses',
      type: 'currency',
      width: '130px',
      editable: false,
      sortable: true,
      render: (value) => (
        <span className="font-medium text-red-600">
          ₹{Number(value || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'netProfit',
      title: 'Net Profit',
      type: 'currency',
      width: '130px',
      editable: false,
      sortable: true,
      render: (value) => (
        <span className={`font-bold ${Number(value || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
          ₹{Number(value || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'profitMargin',
      title: 'Profit Margin',
      type: 'readonly',
      width: '120px',
      editable: false,
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${Number(value || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
            {(Number(value || 0)).toFixed(1)}%
          </span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-16">
            <div
              className={`h-2 rounded-full ${Number(value || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
              style={{
                width: `${Math.min(Math.abs(Number(value || 0)), 100)}%`
              }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'transactionCount',
      title: 'Transactions',
      type: 'number',
      width: '110px',
      editable: false,
      sortable: true,
      render: (value) => (
        <span className="text-gray-900 font-medium">
          {Number(value || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'averageTransactionSize',
      title: 'Avg. Transaction',
      type: 'currency',
      width: '140px',
      editable: false,
      sortable: true,
      render: (value) => (
        <span className="text-gray-700">
          ₹{Number(value || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'topIncomeSource',
      title: 'Top Income Source',
      type: 'text',
      width: '150px',
      editable: false,
      sortable: false,
      render: (value) => (
        <div className="truncate text-green-700" title={value as string}>
          {(value as React.ReactNode) || '-'}
        </div>
      )
    },
    {
      key: 'topExpenseCategory',
      title: 'Top Expense Category',
      type: 'text',
      width: '150px',
      editable: false,
      sortable: false,
      render: (value) => (
        <div className="truncate text-red-700" title={value as string}>
          {(value as React.ReactNode) || '-'}
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Generated',
      type: 'date',
      width: '120px',
      editable: false,
      sortable: true,
      render: (value) => value ? new Date(value as any).toLocaleDateString('en-IN') : '-'
    }
  ]

  // Custom actions
  const customActions = [
    {
      label: 'View Report',
      icon: <Eye className="h-4 w-4" />,
      action: (row: any) => onViewReport?.(row as ReportData),
      variant: 'primary' as const
    },
    {
      label: 'Export PDF',
      icon: <Download className="h-4 w-4" />,
      action: (row: any) => onExportReport?.(row as ReportData, 'pdf'),
      variant: 'secondary' as const
    },
    {
      label: 'Export Excel',
      icon: <Download className="h-4 w-4" />,
      action: (row: any) => onExportReport?.(row as ReportData, 'excel'),
      variant: 'secondary' as const
    }
  ]

  // Calculate summary stats
  const totalReports = reports.length
  const latestReport = reports.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0]

  const avgProfit = reports.length > 0
    ? reports.reduce((sum, r) => sum + (r.netProfit || 0), 0) / reports.length
    : 0

  const avgMargin = reports.length > 0
    ? reports.reduce((sum, r) => sum + (r.profitMargin || 0), 0) / reports.length
    : 0

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Report Period</h3>
            <p className="text-sm text-gray-600">Select the reporting period for analysis</p>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-indigo-100 text-sm">Total Reports</p>
              <p className="text-2xl font-bold">{totalReports}</p>
            </div>
            <div className="p-3 bg-indigo-400 bg-opacity-30 rounded-full">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-green-100 text-sm">Latest Profit</p>
              <p className="text-2xl font-bold">
                {latestReport ? `₹${latestReport.netProfit.toLocaleString('en-IN')}` : '₹0'}
              </p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-blue-100 text-sm">Avg. Profit</p>
              <p className="text-2xl font-bold">
                ₹{avgProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-purple-100 text-sm">Avg. Margin</p>
              <p className="text-2xl font-bold">
                {avgMargin.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <DataGrid
        title="Financial Reports"
        subtitle={`Analytics and insights for ${selectedPeriod} reporting periods`}
        columns={columns}
        data={reports}
        loading={loading}
        error={error || undefined}
        searchPlaceholder="Search reports..."
        pageSize={15}
        enableAdd={true}
        enableEdit={false}
        enableDelete={true}
        enableBulkActions={true}
        onAdd={onGenerateReport}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onRefresh={fetchReports}
        customActions={customActions}
      />
    </div>
  )
}