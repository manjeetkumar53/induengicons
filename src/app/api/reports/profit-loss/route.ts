import { NextRequest, NextResponse } from 'next/server'
import { generateProfitLossReport } from '@/lib/reports/reportService'
import { cacheGet, cacheSet, generateCacheKey, CacheTTL } from '@/lib/cache/upstash'
import type { ReportFilters, ReportResult, ProfitLossData } from '@/lib/reports/types'

export async function POST(request: NextRequest) {
    const startTime = Date.now()

    try {
        const body: ReportFilters = await request.json()

        // Validate required fields
        if (!body.startDate || !body.endDate) {
            return NextResponse.json({
                success: false,
                error: 'startDate and endDate are required'
            }, { status: 400 })
        }

        // Generate cache key
        const cacheKey = generateCacheKey('report:profit-loss', {
            startDate: body.startDate,
            endDate: body.endDate,
            projectId: body.projectId || 'all',
            groupBy: body.groupBy || 'month'
        })

        // Check cache
        const cached = await cacheGet<ProfitLossData>(cacheKey)
        if (cached) {
            const response: ReportResult<ProfitLossData> = {
                success: true,
                data: cached,
                metadata: {
                    filters: body,
                    generatedAt: new Date().toISOString(),
                    recordCount: 0, // Not tracked in cache
                    cached: true,
                    latency: Date.now() - startTime
                }
            }
            return NextResponse.json(response)
        }

        // Generate report
        const data = await generateProfitLossReport(body)

        // Cache for 5 minutes
        await cacheSet(cacheKey, data, CacheTTL.MEDIUM)

        const response: ReportResult<ProfitLossData> = {
            success: true,
            data,
            metadata: {
                filters: body,
                generatedAt: new Date().toISOString(),
                recordCount: data.breakdown.length,
                cached: false,
                latency: Date.now() - startTime
            }
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('[Profit-Loss Report] Error:', error)

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

// GET endpoint for quick queries
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)

    const filters: ReportFilters = {
        startDate: searchParams.get('startDate') || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        endDate: searchParams.get('endDate') || new Date().toISOString(),
        projectId: searchParams.get('projectId') || undefined,
        groupBy: (searchParams.get('groupBy') as any) || 'month'
    }

    // Reuse POST logic
    return POST(request)
}
