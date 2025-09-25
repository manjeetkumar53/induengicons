import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Transaction, Project, TransactionCategory, ExpenseCategory } from '@/lib/models'

// GET - Fetch single transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    
    const { id } = await params
    const transaction = await Transaction.findById(id)
      .populate('projectId', 'name code description')
      .populate('categoryId', 'name type description')
      .populate('expenseCategoryId', 'name type description')
      .lean()

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      transaction
    })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

// PUT - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    
    const { id } = await params
    const body = await request.json()
    const { 
      type,
      amount, 
      description, 
      date, 
      projectId, 
      categoryId,
      expenseCategoryId,
      source, 
      paymentMethod, 
      receiptNumber 
    } = body

    // Validation
    if (!amount || !description || !date) {
      return NextResponse.json(
        { success: false, error: 'Amount, description, and date are required' },
        { status: 400 }
      )
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction type' },
        { status: 400 }
      )
    }

    // Check if transaction exists
    const existingTransaction = await Transaction.findById(id)
    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Validate project if provided
    if (projectId) {
      const projectExists = await Project.findById(projectId)
      if (!projectExists) {
        return NextResponse.json(
          { success: false, error: 'Invalid project ID' },
          { status: 400 }
        )
      }
    }

    // Validate category if provided
    if (type === 'income' && categoryId) {
      const categoryExists = await TransactionCategory.findById(categoryId)
      if (!categoryExists) {
        return NextResponse.json(
          { success: false, error: 'Invalid transaction category ID' },
          { status: 400 }
        )
      }
    }

    if (type === 'expense' && expenseCategoryId) {
      const expenseCategoryExists = await ExpenseCategory.findById(expenseCategoryId)
      if (!expenseCategoryExists) {
        return NextResponse.json(
          { success: false, error: 'Invalid expense category ID' },
          { status: 400 }
        )
      }
    }

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        type,
        amount: parseFloat(amount),
        description: description.trim(),
        date: new Date(date),
        projectId: projectId || null,
        categoryId: type === 'income' ? (categoryId || null) : null,
        expenseCategoryId: type === 'expense' ? (expenseCategoryId || null) : null,
        source: source?.trim() || null,
        paymentMethod,
        receiptNumber: receiptNumber?.trim() || null,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('projectId', 'name code description')
     .populate('categoryId', 'name type description')
     .populate('expenseCategoryId', 'name type description')

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    })

  } catch (error: any) {
    console.error('Error updating transaction:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

// DELETE - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()

    const { id } = await params
    // Check if transaction exists
    const transaction = await Transaction.findById(id)
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // TODO: Check if transaction is referenced by any allocations
    // This would prevent deletion of transactions that are allocated to projects

    // Delete the transaction
    await Transaction.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}