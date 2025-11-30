import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
    title: string
    value: string | number
    subValue?: string
    trend?: number // Percentage change
    trendLabel?: string
    icon?: React.ReactNode
    className?: string
    valueClassName?: string
}

export function KPICard({
    title,
    value,
    subValue,
    trend,
    trendLabel,
    icon,
    className,
    valueClassName
}: KPICardProps) {
    const isPositive = trend && trend > 0
    const isNegative = trend && trend < 0

    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
                {(subValue || trend !== undefined) && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {trend !== undefined && (
                            <span
                                className={cn(
                                    "flex items-center mr-2 font-medium",
                                    isPositive && "text-green-600",
                                    isNegative && "text-red-600"
                                )}
                            >
                                {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> :
                                    isNegative ? <ArrowDown className="h-3 w-3 mr-1" /> :
                                        <Minus className="h-3 w-3 mr-1" />}
                                {Math.abs(trend).toFixed(1)}%
                            </span>
                        )}
                        {trendLabel && <span>{trendLabel}</span>}
                        {subValue && !trendLabel && <span>{subValue}</span>}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
