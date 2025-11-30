import React from 'react'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { ReportFilters } from '@/lib/reports/types'

interface ReportHeaderProps {
    title: string
    description?: string
    filters: ReportFilters
    onFilterChange: (filters: ReportFilters) => void
    onRefresh?: () => void
    onExport?: () => void
    loading?: boolean
    showProjectFilter?: boolean
    showCategoryFilter?: boolean
    projects?: { id: string; name: string }[]
    categories?: { id: string; name: string }[]
}

export function ReportHeader({
    title,
    description,
    filters,
    onFilterChange,
    onRefresh,
    onExport,
    loading,
    showProjectFilter,
    showCategoryFilter,
    projects = [],
    categories = []
}: ReportHeaderProps) {
    return (
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 pb-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
                {/* Date Range Picker - Native Inputs */}
                <div className="flex items-center space-x-2">
                    <input
                        type="date"
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={filters.startDate ? filters.startDate.split('T')[0] : ''}
                        onChange={(e) => onFilterChange({ ...filters, startDate: new Date(e.target.value).toISOString() })}
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                        type="date"
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={filters.endDate ? filters.endDate.split('T')[0] : ''}
                        onChange={(e) => onFilterChange({ ...filters, endDate: new Date(e.target.value).toISOString() })}
                    />
                </div>

                {/* Group By Filter */}
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={filters.groupBy || 'month'}
                    onChange={(e) => onFilterChange({ ...filters, groupBy: e.target.value as any })}
                >
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                    <option value="quarter">Quarterly</option>
                    <option value="year">Yearly</option>
                </select>

                {/* Project Filter */}
                {showProjectFilter && (
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={filters.projectId || 'all'}
                        onChange={(e) => onFilterChange({ ...filters, projectId: e.target.value === 'all' ? undefined : e.target.value })}
                    >
                        <option value="all">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-1">
                    {onRefresh && (
                        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </Button>
                    )}
                    {onExport && (
                        <Button variant="ghost" size="icon" onClick={onExport} disabled={loading}>
                            <Download className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
