import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { TransactionCategory } from '@/lib/models'

// GET - Fetch single transaction category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params

    const category = await TransactionCategory.findById(id)

    if (!category) {
      return NextResponse.json(
        { error: 'Transaction category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      category
    })
  } catch (error) {
    console.error('Error fetching transaction category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction category' },
      { status: 500 }
    )
  }
}

// PUT - Update transaction category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params

    const body = await request.json()
    const { name, description, type, accounting, display } = body

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // Validate type enum
    const validTypes = ['revenue', 'expense', 'transfer', 'adjustment']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if category exists
    const existingCategory = await TransactionCategory.findById(id)
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Transaction category not found' },
        { status: 404 }
      )
    }

    // Prevent editing system categories (certain core fields)
    if (existingCategory.isSystemCategory) {
      return NextResponse.json(
        { error: 'Cannot modify system categories' },
        { status: 403 }
      )
    }

    const updatedCategory = await TransactionCategory.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description?.trim(),
        type,
        accounting: {
          ...existingCategory.accounting,
          taxCategory: accounting?.taxCategory || existingCategory.accounting.taxCategory,
          defaultTaxRate: accounting?.defaultTaxRate !== undefined
            ? accounting.defaultTaxRate
            : existingCategory.accounting.defaultTaxRate
        },
        display: {
          ...existingCategory.display,
          icon: display?.icon || existingCategory.display.icon,
          color: display?.color || existingCategory.display.color,
          sortOrder: display?.sortOrder !== undefined
            ? display.sortOrder
            : existingCategory.display.sortOrder
        }
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      category: updatedCategory
    })
  } catch (error) {
    console.error('Error updating transaction category:', error)

    if (error instanceof Error && 'code' in error && (error as Error & { code: number }).code === 11000) {
      return NextResponse.json(
        { error: 'A category with this accounting code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update transaction category' },
      { status: 500 }
    )
  }
}

// DELETE - Delete transaction category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params

    const category = await TransactionCategory.findById(id)

    if (!category) {
      return NextResponse.json(
        { error: 'Transaction category not found' },
        { status: 404 }
      )
    }

    // Prevent deleting system categories
    if (category.isSystemCategory) {
      return NextResponse.json(
        { error: 'Cannot delete system categories' },
        { status: 403 }
      )
    }

    // Check if category is being used in transactions
    const { Transaction } = await import('@/lib/models')
    const transactionCount = await Transaction.countDocuments({
      $or: [
        { categoryId: id },
        { transactionCategoryId: id }
      ]
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It is being used by ${transactionCount} transaction(s).` },
        { status: 409 }
      )
    }

    await TransactionCategory.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Transaction category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting transaction category:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction category' },
      { status: 500 }
    )
  }
}