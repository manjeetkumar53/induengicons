import { NextRequest, NextResponse } from 'next/server'
import { generateExpenseCategoryReport } from '@/lib/reports/reportService'
import { cacheGet, cacheSet, generateCacheKey, CacheTTL } from '@/lib/cache/upstash'
import type { ReportFilters, ReportResult, ExpenseCategoryData } from '@/lib/reports/types'

export async function POST(request: NextRequest) {
    const startTime = Date.now()

    try {
        const body: ReportFilters = await request.json()

        if (!body.startDate || !body.endDate) {
            return NextResponse.json({
                success: false,
                error: 'startDate and endDate are required'
            }, { status: 400 })
        }

        const cacheKey = generateCacheKey('report:expense-category', {
            startDate: body.startDate,
            endDate: body.endDate,
            projectId: body.projectId || 'all',
            categoryId: body.categoryId || 'all',
            groupBy: body.groupBy || 'month'
        })

        const cached = await cacheGet<ExpenseCategoryData>(cacheKey)
        if (cached) {
            return NextResponse.json({
                success: true,
                data: cached,
                metadata: {
                    filters: body,
                    generatedAt: new Date().toISOString(),
                    recordCount: cached.byCategory.length,
                    cached: true,
                    latency: Date.now() - startTime
                }
            })
        }

        const data = await generateExpenseCategoryReport(body)
        await cacheSet(cacheKey, data, CacheTTL.MEDIUM)

        const response: ReportResult<ExpenseCategoryData> = {
            success: true,
            data,
            metadata: {
                filters: body,
                generatedAt: new Date().toISOString(),
                recordCount: data.byCategory.length,
                cached: false,
                latency: Date.now() - startTime
            }
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('[Expense Category Report] Error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate report',
            metadata: {
                filters: {},
                generatedAt: new Date().toISOString(),
                recordCount: 0,
                cached: false,
                latency: Date.now() - startTime
            }
        }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)

    const body: ReportFilters = {
        startDate: searchParams.get('startDate') || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        endDate: searchParams.get('endDate') || new Date().toISOString(),
        projectId: searchParams.get('projectId') || undefined,
        categoryId: searchParams.get('categoryId') || undefined,
        groupBy: (searchParams.get('groupBy') as 'day' | 'week' | 'month' | 'quarter' | 'year') || 'month'
    }

    return POST(new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    }))
}
