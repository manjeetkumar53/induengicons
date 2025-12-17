import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Transaction, Project, TransactionCategory, ExpenseCategory } from '@/lib/models'

// GET - Fetch all transactions with advanced filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'income' | 'expense' | null
    const projectId = searchParams.get('projectId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = {}
    if (type) query.type = type
    if (projectId) query.projectId = projectId
    if (categoryId) {
      if (type === 'income') {
        query.categoryId = categoryId
      } else if (type === 'expense') {
        query.expenseCategoryId = categoryId
      }
    }

    // Text search
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } }
      ]
    }

    // Date range filter
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.$gte = new Date(startDate)
      if (endDate) dateFilter.$lte = new Date(endDate + 'T23:59:59.999Z')
      query.date = dateFilter
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('projectId', 'name code description')
        .populate('categoryId', 'name type description')
        .populate('expenseCategoryId', 'name type description')
        .sort({ date: -1, createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      Transaction.countDocuments(query)
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        limit,
        hasMore: page < totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST - Create new transaction
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const {
      type,
      amount,
      description,
      date,
      projectId,
      expenseCategoryId,
      transactionCategoryId,
      source,
      paymentMethod,
      paymentReference,
      invoiceNumber,
      receiptNumber,
      notes,
      tags
    } = body

    // Validate required fields
    if (!type || !amount || !description || !date || !transactionCategoryId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Type, amount, description, date, transaction category, and payment method are required' },
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

    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either income or expense' },
        { status: 400 }
      )
    }

    // Validate payment method
    const validPaymentMethods = ['cash', 'bank', 'card', 'cheque', 'upi', 'neft', 'rtgs', 'other']
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: `Payment method must be one of: ${validPaymentMethods.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate transaction category exists
    const transactionCategory = await TransactionCategory.findById(transactionCategoryId)
    if (!transactionCategory) {
      return NextResponse.json(
        { error: 'Transaction category not found' },
        { status: 404 }
      )
    }

    // Validate project if provided
    let project = null
    let projectName = null
    if (projectId) {
      project = await Project.findById(projectId)
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      projectName = project.name
    }

    // Validate expense category if provided
    let expenseCategory = null
    let expenseCategoryName = null
    if (expenseCategoryId) {
      expenseCategory = await ExpenseCategory.findById(expenseCategoryId)
      if (!expenseCategory) {
        return NextResponse.json(
          { error: 'Expense category not found' },
          { status: 404 }
        )
      }
      expenseCategoryName = expenseCategory.name
    }

    console.log('Creating transaction with data:', {
      type,
      amount: numericAmount,
      description: description.trim(),
      date: new Date(date),
      projectId: projectId || undefined,
      projectName,
      categoryId: transactionCategoryId,
      categoryName: transactionCategory.name,
      expenseCategoryId: expenseCategoryId || undefined,
      expenseCategoryName,
      paymentMethod,
      paymentReference: paymentReference?.trim(),
      source: source?.trim(),
      invoiceNumber: invoiceNumber?.trim(),
      receiptNumber: receiptNumber?.trim(),
      status: 'approved',
      createdBy: 'system',
      notes: notes?.trim(),
      tags: tags || []
    })

    // Generate transaction number based on last existing one to avoid duplicates
    const year = new Date().getFullYear()
    const lastTransaction = await Transaction.findOne({
      transactionNumber: { $regex: `^TXN${year}` }
    }).sort({ transactionNumber: -1 })

    let nextSequence = 1
    if (lastTransaction && lastTransaction.transactionNumber) {
      const lastSequenceStr = lastTransaction.transactionNumber.replace(`TXN${year}`, '')
      const lastSequence = parseInt(lastSequenceStr, 10)
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1
      }
    }

    const transactionNumber = `TXN${year}${String(nextSequence).padStart(6, '0')}`

    const transaction = await Transaction.create({
      transactionNumber,
      type,
      amount: numericAmount,
      description: description.trim(),
      date: new Date(date),
      projectId: projectId || undefined,
      projectName,
      categoryId: transactionCategoryId,
      categoryName: transactionCategory.name,
      expenseCategoryId: expenseCategoryId || undefined,
      expenseCategoryName,
      paymentMethod,
      paymentReference: paymentReference?.trim(),
      source: source?.trim(),
      invoiceNumber: invoiceNumber?.trim(),
      receiptNumber: receiptNumber?.trim(),
      status: 'approved', // Auto-approve for now
      createdBy: 'system', // Will be updated when auth is implemented
      notes: notes?.trim(),
      tags: tags || []
    })

    // Update project budget if it's an expense
    if (type === 'expense' && project) {
      await Project.findByIdAndUpdate(projectId, {
        $inc: {
          'budget.spentAmount': numericAmount,
          'budget.remainingBudget': -numericAmount
        }
      })
    }

    // Populate the response
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('projectId', 'name code')
      .populate('categoryId', 'name type')
      .populate('expenseCategoryId', 'name type')

    return NextResponse.json({
      success: true,
      transaction: populatedTransaction
    })
  } catch (error: unknown) {
    console.error('Error creating transaction:', error)

    // More specific error messages
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Duplicate transaction number. Please try again.' },
        { status: 400 }
      )
    }

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError' && 'errors' in error) {
      const validationErrors = Object.values(error.errors as Record<string, { message: string }>).map((err) => err.message).join(', ')
      return NextResponse.json(
        { error: `Validation failed: ${validationErrors}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create transaction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}