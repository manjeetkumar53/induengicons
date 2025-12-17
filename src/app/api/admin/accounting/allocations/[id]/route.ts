import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'

// Fund Allocation Schema (same as in route.ts)
const FundAllocationSchema = new mongoose.Schema({
    sourceTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    targetProjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    percentage: {
        type: Number,
        min: 0,
        max: 100
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    }
}, { timestamps: true })

const FundAllocation = mongoose.models.FundAllocation ||
    mongoose.model('FundAllocation', FundAllocationSchema)

// GET - Fetch single allocation
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()

        const { id } = await params
        const allocation = await FundAllocation.findById(id)
            .populate('sourceTransactionId', 'description amount type')
            .populate('targetProjectId', 'name')
            .lean()

        if (!allocation) {
            return NextResponse.json(
                { success: false, error: 'Allocation not found' },
                { status: 404 }
            )
        }

        // Cast to Record type to handle populated fields safely
        const alloc = allocation as Record<string, unknown>
        const sourceTransaction = alloc.sourceTransactionId as Record<string, unknown>
        const targetProject = alloc.targetProjectId as Record<string, unknown>

        return NextResponse.json({
            success: true,
            allocation: {
                id: (alloc._id as { toString(): string }).toString(),
                sourceTransactionId: (sourceTransaction._id as { toString(): string }).toString(),
                targetProjectId: (targetProject._id as { toString(): string }).toString(),
                amount: alloc.amount as number,
                percentage: alloc.percentage as number,
                description: alloc.description as string,
                date: alloc.date as Date,
                sourceDescription: sourceTransaction.description as string,
                targetProjectName: targetProject.name as string,
                createdBy: alloc.createdBy as string,
                createdAt: alloc.createdAt as Date
            }
        })
    } catch (error) {
        console.error('Error fetching allocation:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch allocation' },
            { status: 500 }
        )
    }
}

// PUT - Update allocation
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()

        const { id } = await params
        const body = await request.json()

        // Check if allocation exists
        const existingAllocation = await FundAllocation.findById(id)
        if (!existingAllocation) {
            return NextResponse.json(
                { success: false, error: 'Allocation not found' },
                { status: 404 }
            )
        }

        // Update fields
        const updateData: Record<string, unknown> = {}
        if (body.amount !== undefined) updateData.amount = parseFloat(body.amount)
        if (body.percentage !== undefined) updateData.percentage = parseFloat(body.percentage)
        if (body.description !== undefined) updateData.description = body.description.trim()
        if (body.date !== undefined) updateData.date = new Date(body.date)
        if (body.targetProjectId !== undefined) updateData.targetProjectId = body.targetProjectId
        if (body.sourceTransactionId !== undefined) updateData.sourceTransactionId = body.sourceTransactionId

        const updatedAllocation = await FundAllocation.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('sourceTransactionId', 'description amount type')
            .populate('targetProjectId', 'name')

        // Cast to Record type to handle populated fields safely
        const alloc = updatedAllocation as Record<string, unknown>
        const sourceTransaction = alloc.sourceTransactionId as Record<string, unknown>
        const targetProject = alloc.targetProjectId as Record<string, unknown>

        return NextResponse.json({
            success: true,
            message: 'Allocation updated successfully',
            allocation: {
                id: (alloc._id as { toString(): string }).toString(),
                sourceTransactionId: (sourceTransaction._id as { toString(): string }).toString(),
                targetProjectId: (targetProject._id as { toString(): string }).toString(),
                amount: alloc.amount as number,
                percentage: alloc.percentage as number,
                description: alloc.description as string,
                date: alloc.date as Date,
                sourceDescription: sourceTransaction.description as string,
                targetProjectName: targetProject.name as string,
                createdBy: alloc.createdBy as string,
                createdAt: alloc.createdAt as Date
            }
        })
    } catch (error: unknown) {
        console.error('Error updating allocation:', error)

        if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
            return NextResponse.json(
                { success: false, error: 'Invalid allocation data' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to update allocation' },
            { status: 500 }
        )
    }
}

// DELETE - Delete allocation
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()

        const { id } = await params
        const allocation = await FundAllocation.findById(id)

        if (!allocation) {
            return NextResponse.json(
                { success: false, error: 'Allocation not found' },
                { status: 404 }
            )
        }

        await FundAllocation.findByIdAndDelete(id)

        return NextResponse.json({
            success: true,
            message: 'Allocation deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting allocation:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete allocation' },
            { status: 500 }
        )
    }
}
