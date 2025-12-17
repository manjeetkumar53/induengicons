import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Transaction } from '@/lib/models'

export async function POST(request: NextRequest) {
    try {
        await dbConnect()

        const body = await request.json()
        const { action, transactionIds } = body

        if (!action || !transactionIds || !Array.isArray(transactionIds)) {
            return NextResponse.json(
                { success: false, error: 'Invalid request format' },
                { status: 400 }
            )
        }

        if (action === 'delete') {
            // Delete multiple transactions
            const result = await Transaction.deleteMany({
                _id: { $in: transactionIds }
            })

            return NextResponse.json({
                success: true,
                message: `Successfully deleted ${result.deletedCount} transactions`,
                deletedCount: result.deletedCount
            })
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Error performing bulk operation:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to perform bulk operation' },
            { status: 500 }
        )
    }
}
