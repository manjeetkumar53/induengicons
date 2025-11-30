import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Column<T> {
    header: string
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
    align?: 'left' | 'center' | 'right'
}

interface ReportTableProps<T> {
    title?: string
    data: T[]
    columns: Column<T>[]
    className?: string
    loading?: boolean
}

export function ReportTable<T>({
    title,
    data,
    columns,
    className,
    loading
}: ReportTableProps<T>) {
    return (
        <Card className={cn("w-full", className)}>
            {title && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col, i) => (
                                    <TableHead
                                        key={i}
                                        className={cn(
                                            col.align === 'right' && "text-right",
                                            col.align === 'center' && "text-center",
                                            col.className
                                        )}
                                    >
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item, i) => (
                                    <TableRow key={i}>
                                        {columns.map((col, j) => (
                                            <TableCell
                                                key={j}
                                                className={cn(
                                                    col.align === 'right' && "text-right",
                                                    col.align === 'center' && "text-center",
                                                    col.className
                                                )}
                                            >
                                                {col.cell
                                                    ? col.cell(item)
                                                    : col.accessorKey
                                                        ? String(item[col.accessorKey])
                                                        : null}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
