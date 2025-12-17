'use client'

import React from 'react'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ChartDataPoint } from '@/types/components'

interface ReportChartProps {
    title?: string
    data: ChartDataPoint[]
    type: 'area' | 'bar' | 'line' | 'pie'
    dataKeys: { key: string; color: string; name?: string; stackId?: string }[]
    xAxisKey?: string
    height?: number
    className?: string
    currency?: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function ReportChart({
    title,
    data,
    type,
    dataKeys,
    xAxisKey = 'name',
    height = 300,
    className,
    currency = true
}: ReportChartProps) {

    const formatValue = (value: number) => {
        if (currency) {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumSignificantDigits: 3
            }).format(value)
        }
        return value.toString()
    }

    const renderChart = () => {
        switch (type) {
            case 'area':
                return (
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            {dataKeys.map((k, i) => (
                                <linearGradient key={k.key} id={`color${k.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={k.color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={k.color} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <XAxis dataKey={xAxisKey} />
                        <YAxis tickFormatter={formatValue} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip formatter={(value: number) => formatValue(value)} />
                        <Legend />
                        {dataKeys.map((k) => (
                            <Area
                                key={k.key}
                                type="monotone"
                                dataKey={k.key}
                                name={k.name || k.key}
                                stroke={k.color}
                                fillOpacity={1}
                                fill={`url(#color${k.key})`}
                                stackId={k.stackId}
                            />
                        ))}
                    </AreaChart>
                )

            case 'bar':
                return (
                    <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey={xAxisKey} />
                        <YAxis tickFormatter={formatValue} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip formatter={(value: number) => formatValue(value)} />
                        <Legend />
                        {dataKeys.map((k) => (
                            <Bar
                                key={k.key}
                                dataKey={k.key}
                                name={k.name || k.key}
                                fill={k.color}
                                stackId={k.stackId}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                )

            case 'line':
                return (
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey={xAxisKey} />
                        <YAxis tickFormatter={formatValue} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip formatter={(value: number) => formatValue(value)} />
                        <Legend />
                        {dataKeys.map((k) => (
                            <Line
                                key={k.key}
                                type="monotone"
                                dataKey={k.key}
                                name={k.name || k.key}
                                stroke={k.color}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 8 }}
                            />
                        ))}
                    </LineChart>
                )

            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={height / 2 - 40}
                            fill="#8884d8"
                            dataKey={dataKeys[0].key}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatValue(value)} />
                        <Legend />
                    </PieChart>
                )
        }
    }

    return (
        <Card className={cn("w-full", className)}>
            {title && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent>
                <div style={{ width: '100%', height }}>
                    <ResponsiveContainer>
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
