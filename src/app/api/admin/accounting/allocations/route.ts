import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Transaction, Project } from '@/lib/models'
import mongoose from 'mongoose'

// Create a simple FundAllocation schema for transaction-to-project allocations
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

// Create model if it doesn't exist
const FundAllocation = mongoose.models.FundAllocation || 
  mongoose.model('FundAllocation', FundAllocationSchema)

// GET - Fetch all allocations
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    // Build query
    const query: Record<string, unknown> = {}
    if (projectId) query.targetProjectId = projectId
    
    const allocations = await FundAllocation.find(query)
      .populate('sourceTransactionId', 'description amount type')
      .populate('targetProjectId', 'name')
      .sort({ date: -1, createdAt: -1 })
      .lean()
    
    // Format allocations for frontend
    const formattedAllocations = allocations.map((allocation: any) => ({
      id: allocation._id.toString(),
      sourceTransactionId: allocation.sourceTransactionId._id.toString(),
      targetProjectId: allocation.targetProjectId._id.toString(),
      amount: allocation.amount,
      percentage: allocation.percentage,
      description: allocation.description,
      date: allocation.date,
      sourceDescription: allocation.sourceTransactionId.description,
      targetProjectName: allocation.targetProjectId.name,
      createdBy: allocation.createdBy,
      createdAt: allocation.createdAt
    }))
    
    return NextResponse.json({
      success: true,
      allocations: formattedAllocations
    })
  } catch (error) {
    console.error('Error fetching allocations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch allocations' },
      { status: 500 }
    )
  }
}

// POST - Create new allocation
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { 
      sourceTransactionId,
      targetProjectId,
      amount, 
      percentage,
      description, 
      date, 
      createdBy 
    } = body

    // Validate required fields
    if (!sourceTransactionId || !targetProjectId || !amount || !description || !date || !createdBy) {
      return NextResponse.json(
        { error: 'Source transaction, target project, amount, description, date, and created by are required' },
        { status: 400 }
      )
    }

    // Validate amount
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Validate source transaction exists and is income
    const sourceTransaction = await Transaction.findById(sourceTransactionId)
    if (!sourceTransaction) {
      return NextResponse.json(
        { error: 'Source transaction not found' },
        { status: 404 }
      )
    }

    if (sourceTransaction.type !== 'income') {
      return NextResponse.json(
        { error: 'Source transaction must be income' },
        { status: 400 }
      )
    }

    // Validate target project exists
    const targetProject = await Project.findById(targetProjectId)
    if (!targetProject) {
      return NextResponse.json(
        { error: 'Target project not found' },
        { status: 404 }
      )
    }

    // Check if allocation amount doesn't exceed available amount
    const existingAllocations = await FundAllocation.find({ sourceTransactionId })
    const totalAllocated = existingAllocations.reduce((sum, allocation) => sum + allocation.amount, 0)
    
    if (totalAllocated + numericAmount > sourceTransaction.amount) {
      return NextResponse.json(
        { error: `Cannot allocate ₹${numericAmount.toLocaleString()}. Only ₹${(sourceTransaction.amount - totalAllocated).toLocaleString()} available from this transaction.` },
        { status: 400 }
      )
    }

    const allocation = await FundAllocation.create({
      sourceTransactionId,
      targetProjectId,
      amount: numericAmount,
      percentage: percentage ? parseFloat(percentage) : undefined,
      description: description.trim(),
      date: new Date(date),
      createdBy
    })

    // Populate the response
    const populatedAllocation = await FundAllocation.findById(allocation._id)
      .populate('sourceTransactionId', 'description amount type')
      .populate('targetProjectId', 'name')

    if (!populatedAllocation) {
      return NextResponse.json(
        { error: 'Failed to create allocation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      allocation: {
        id: populatedAllocation._id.toString(),
        sourceTransactionId: populatedAllocation.sourceTransactionId._id.toString(),
        targetProjectId: populatedAllocation.targetProjectId._id.toString(),
        amount: populatedAllocation.amount,
        percentage: populatedAllocation.percentage,
        description: populatedAllocation.description,
        date: populatedAllocation.date,
        sourceDescription: populatedAllocation.sourceTransactionId.description,
        targetProjectName: populatedAllocation.targetProjectId.name,
        createdBy: populatedAllocation.createdBy,
        createdAt: populatedAllocation.createdAt
      }
    })
  } catch (error) {
    console.error('Error creating allocation:', error)
    return NextResponse.json(
      { error: 'Failed to create allocation' },
      { status: 500 }
    )
  }
}

// DELETE - Delete allocation
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Allocation ID is required' },
        { status: 400 }
      )
    }

    const allocation = await FundAllocation.findByIdAndDelete(id)
    
    if (!allocation) {
      return NextResponse.json(
        { error: 'Allocation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Allocation deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting allocation:', error)
    return NextResponse.json(
      { error: 'Failed to delete allocation' },
      { status: 500 }
    )
  }
}