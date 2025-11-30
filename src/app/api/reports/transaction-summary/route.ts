import { NextRequest, NextResponse } from 'next/server'
import { generateTransactionSummary } from '@/lib/reports/reportService'
import { cacheGet, cacheSet, CacheTTL } from '@/lib/cache/upstash'
import type { ReportFilters, ReportResult, TransactionSummaryData } from '@/lib/reports/types'

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

        // Summary uses shorter cache (1 minute) as it's more real-time
        const cacheKey = `report:summary:${body.startDate}:${body.endDate}`

        const cached = await cacheGet<TransactionSummaryData>(cacheKey)
        if (cached) {
            return NextResponse.json({
                success: true,
                data: cached,
                metadata: {
                    filters: body,
                    generatedAt: new Date().toISOString(),
                    recordCount: cached.summary.totalTransactions,
                    cached: true,
                    latency: Date.now() - startTime
                }
            })
        }

        const data = await generateTransactionSummary(body)
        await cacheSet(cacheKey, data, CacheTTL.SHORT) // 1 minute cache

        const response: ReportResult<TransactionSummaryData> = {
            success: true,
            data,
            metadata: {
                filters: body,
                generatedAt: new Date().toISOString(),
                recordCount: data.summary.totalTransactions,
                cached: false,
                latency: Date.now() - startTime
            }
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('[Transaction Summary] Error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate summary',
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

    // Default to today for summary
    const today = new Date().toISOString().split('T')[0]
    const body: ReportFilters = {
        startDate: searchParams.get('startDate') || `${today}T00:00:00Z`,
        endDate: searchParams.get('endDate') || `${today}T23:59:59Z`,
        projectId: searchParams.get('projectId') || undefined
    }

    return POST(new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    }))
}
