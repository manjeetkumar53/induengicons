import { NextRequest, NextResponse } from 'next/server'
import { cacheSet, CacheTTL } from '@/lib/cache/upstash'
import {
    generateProfitLossReport,
    generateCashFlowReport,
    generateTransactionSummary
} from '@/lib/reports/reportService'

/**
 * Cron job to pre-compute popular reports
 * Called every 5 minutes by Vercel Cron
 */
export async function GET(request: NextRequest) {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error('[Cron] Unauthorized request')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()
    const results: Array<{ report: string; status: 'success' | 'error'; message?: unknown }> = []

    try {
        // Get date ranges
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const thisMonthEnd = now

        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

        const thisYearStart = new Date(now.getFullYear(), 0, 1)

        // Pre-compute: Profit & Loss - This Month
        try {
            const profitLossThisMonth = await generateProfitLossReport({
                startDate: thisMonthStart.toISOString(),
                endDate: thisMonthEnd.toISOString(),
                groupBy: 'day'
            })
            await cacheSet('report:profit-loss:current-month', profitLossThisMonth, CacheTTL.MEDIUM)
            results.push({ report: 'profit-loss-current-month', status: 'success' })
        } catch (error) {
            results.push({ report: 'profit-loss-current-month', status: 'error', message: error })
        }

        // Pre-compute: Profit & Loss - Last Month
        try {
            const profitLossLastMonth = await generateProfitLossReport({
                startDate: lastMonthStart.toISOString(),
                endDate: lastMonthEnd.toISOString(),
                groupBy: 'day'
            })
            await cacheSet('report:profit-loss:last-month', profitLossLastMonth, CacheTTL.LONG)
            results.push({ report: 'profit-loss-last-month', status: 'success' })
        } catch (error) {
            results.push({ report: 'profit-loss-last-month', status: 'error', message: error })
        }

        // Pre-compute: Profit & Loss - Year to Date
        try {
            const profitLossYTD = await generateProfitLossReport({
                startDate: thisYearStart.toISOString(),
                endDate: thisMonthEnd.toISOString(),
                groupBy: 'month'
            })
            await cacheSet('report:profit-loss:ytd', profitLossYTD, CacheTTL.MEDIUM)
            results.push({ report: 'profit-loss-ytd', status: 'success' })
        } catch (error) {
            results.push({ report: 'profit-loss-ytd', status: 'error', message: error })
        }

        // Pre-compute: Cash Flow - This Month
        try {
            const cashFlowThisMonth = await generateCashFlowReport({
                startDate: thisMonthStart.toISOString(),
                endDate: thisMonthEnd.toISOString(),
                groupBy: 'day'
            })
            await cacheSet('report:cash-flow:current-month', cashFlowThisMonth, CacheTTL.MEDIUM)
            results.push({ report: 'cash-flow-current-month', status: 'success' })
        } catch (error) {
            results.push({ report: 'cash-flow-current-month', status: 'error', message: error })
        }

        // Pre-compute: Transaction Summary - Today
        try {
            const todayStart = new Date(now.setHours(0, 0, 0, 0))
            const todayEnd = new Date(now.setHours(23, 59, 59, 999))

            const summaryToday = await generateTransactionSummary({
                startDate: todayStart.toISOString(),
                endDate: todayEnd.toISOString()
            })
            await cacheSet('report:summary:today', summaryToday, CacheTTL.SHORT)
            results.push({ report: 'summary-today', status: 'success' })
        } catch (error) {
            results.push({ report: 'summary-today', status: 'error', message: error })
        }

        const duration = Date.now() - startTime

        console.log(`[Cron] Pre-computed ${results.length} reports in ${duration}ms`)

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`,
            results
        })

    } catch (error) {
        console.error('[Cron] Error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Pre-computation failed',
            timestamp: new Date().toISOString(),
            duration: `${Date.now() - startTime}ms`,
            results
        }, { status: 500 })
    }
}
