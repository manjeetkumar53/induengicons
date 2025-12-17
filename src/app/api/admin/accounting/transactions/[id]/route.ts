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

    // Handle field mapping and object extraction
    if (body.transactionCategoryId) {
      body.categoryId = body.transactionCategoryId
    }

    // If frontend sends populated objects instead of IDs, extract the ID
    if (body.categoryId && typeof body.categoryId === 'object' && body.categoryId._id) {
      body.categoryId = body.categoryId._id
    }

    if (body.projectId && typeof body.projectId === 'object' && body.projectId._id) {
      body.projectId = body.projectId._id
    }

    if (body.expenseCategoryId && typeof body.expenseCategoryId === 'object' && body.expenseCategoryId._id) {
      body.expenseCategoryId = body.expenseCategoryId._id
    }

    // Lookup IDs from names if IDs are missing but names are provided
    if (!body.projectId && body.project) {
      const projectDoc = await Project.findOne({ name: body.project })
      if (projectDoc) {
        body.projectId = projectDoc._id
      }
    }

    if (!body.categoryId && body.category) {
      const categoryDoc = await TransactionCategory.findOne({ name: body.category })
      if (categoryDoc) {
        body.categoryId = categoryDoc._id
      }
    }

    // For expense categories, we might need to look up by name too if that's what's passed
    // The frontend currently maps 'category' to 'transactionCategoryId' (which becomes categoryId)
    // But for expenses, it might be intended for expenseCategoryId?
    // The current frontend logic sends 'transactionCategoryId' for both income and expense (as mapped from 'category')
    // And the backend logic I added:
    // categoryId: type === 'income' ? (categoryId || null) : null,
    // expenseCategoryId: type === 'expense' ? (expenseCategoryId || null) : null,
    // Wait, if I send 'categoryId' for an expense, the backend logic I wrote previously:
    // categoryId: categoryId || null
    // expenseCategoryId: expenseCategoryId || null
    // It doesn't automatically move categoryId to expenseCategoryId.

    // Let's fix the logic to handle the single 'category' dropdown on frontend feeding into the correct backend field.
    // If type is expense, and we have a categoryId (from the dropdown), we should probably set expenseCategoryId if it's an expense category.
    // However, the frontend sends 'transactionCategoryId'.

    // Let's check the category type.
    if (body.categoryId) {
      const cat = await TransactionCategory.findById(body.categoryId);
      if (cat) {
        // It is a TransactionCategory.
        // If type is expense, we still store it in categoryId?
        // The schema has both categoryId (TransactionCategory) and expenseCategoryId (ExpenseCategory).
        // If the user selects a TransactionCategory of type 'expense', it goes to categoryId.
        // If the user selects an ExpenseCategory, it goes to expenseCategoryId.
        // The frontend loads 'transaction-categories'. So they are TransactionCategory objects.
        // So they should go to categoryId.
      }
    }

    // Check if transaction exists first
    const existingTransaction = await Transaction.findById(id)
    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Merge existing data with updates
    const type = body.type || existingTransaction.type
    const amount = body.amount !== undefined ? body.amount : existingTransaction.amount
    const description = body.description || existingTransaction.description
    const date = body.date || existingTransaction.date
    const projectId = body.projectId !== undefined ? body.projectId : existingTransaction.projectId
    const categoryId = body.categoryId !== undefined ? body.categoryId : existingTransaction.categoryId
    const expenseCategoryId = body.expenseCategoryId !== undefined ? body.expenseCategoryId : existingTransaction.expenseCategoryId
    const source = body.source !== undefined ? body.source : existingTransaction.source
    const paymentMethod = body.paymentMethod || existingTransaction.paymentMethod
    const receiptNumber = body.receiptNumber !== undefined ? body.receiptNumber : existingTransaction.receiptNumber
    const notes = body.notes !== undefined ? body.notes : existingTransaction.notes
    const tags = body.tags !== undefined ? body.tags : existingTransaction.tags

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

    // Variables to store fetched documents for name updates
    let newProjectName = undefined
    let newCategoryName = undefined
    let newExpenseCategoryName = undefined

    // Validate project if provided and changed
    if (projectId && projectId !== existingTransaction.projectId?.toString()) {
      const projectDoc = await Project.findById(projectId)
      if (!projectDoc) {
        return NextResponse.json(
          { success: false, error: 'Invalid project ID' },
          { status: 400 }
        )
      }
      newProjectName = projectDoc.name
    } else if (projectId === null) {
      newProjectName = null
    }

    // Validate category if provided and changed
    if (categoryId && categoryId !== existingTransaction.categoryId?.toString()) {
      const categoryDoc = await TransactionCategory.findById(categoryId)
      if (!categoryDoc) {
        return NextResponse.json(
          { success: false, error: 'Invalid transaction category ID' },
          { status: 400 }
        )
      }
      newCategoryName = categoryDoc.name
    } else if (categoryId === null) {
      newCategoryName = null
    }

    if (expenseCategoryId && expenseCategoryId !== existingTransaction.expenseCategoryId?.toString()) {
      const expenseCategoryDoc = await ExpenseCategory.findById(expenseCategoryId)
      if (!expenseCategoryDoc) {
        return NextResponse.json(
          { success: false, error: 'Invalid expense category ID' },
          { status: 400 }
        )
      }
      newExpenseCategoryName = expenseCategoryDoc.name
    } else if (expenseCategoryId === null) {
      newExpenseCategoryName = null
    }

    // Prepare update object
    const updateData: Record<string, unknown> = {
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      date: new Date(date),
      projectId: projectId || null,
      categoryId: categoryId || null,
      expenseCategoryId: expenseCategoryId || null,
      source: source?.trim() || null,
      paymentMethod,
      receiptNumber: receiptNumber?.trim() || null,
      notes: notes?.trim() || null,
      tags: tags || [],
      updatedAt: new Date()
    }

    // Update denormalized names if they changed
    if (newProjectName !== undefined) updateData.projectName = newProjectName
    if (newCategoryName !== undefined) updateData.categoryName = newCategoryName
    if (newExpenseCategoryName !== undefined) updateData.expenseCategoryName = newExpenseCategoryName

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('projectId', 'name code description')
      .populate('categoryId', 'name type description')
      .populate('expenseCategoryId', 'name type description')

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    })

  } catch (error: unknown) {
    console.error('Error updating transaction:', error)

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
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