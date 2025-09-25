import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Transaction, Project, TransactionCategory, ExpenseCategory } from '@/lib/models'
import mongoose from 'mongoose'

// Create FundAllocation model reference (same as in allocations route)
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

// GET - Generate comprehensive reports
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const projectId = searchParams.get('projectId')
    const transactionType = searchParams.get('transactionType')
    const expenseCategoryId = searchParams.get('expenseCategoryId')
    const transactionCategoryId = searchParams.get('transactionCategoryId')
    const paymentMethod = searchParams.get('paymentMethod')
    
    // Build query for transactions
    const query: any = {}
    
    // Date filter
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }
    
    // Transaction type filter
    if (transactionType && transactionType !== 'all') {
      query.type = transactionType
    }
    
    // Project filter
    if (projectId) {
      query.projectId = projectId
    }
    
    // Category filters
    if (expenseCategoryId) {
      query.expenseCategoryId = expenseCategoryId
    }
    
    if (transactionCategoryId) {
      query.categoryId = transactionCategoryId
    }
    
    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod
    }
    
    // Fetch data
    const [transactions, projects, transactionCategories, expenseCategories, allocations] = await Promise.all([
      Transaction.find(query)
        .populate('projectId', 'name')
        .populate('categoryId', 'name type')
        .populate('expenseCategoryId', 'name type')
        .sort({ date: -1 })
        .lean(),
      Project.find({ status: { $ne: 'deleted' } }).lean(),
      TransactionCategory.find().lean(),
      ExpenseCategory.find().lean(),
      FundAllocation.find({
        date: query.date || { $gte: new Date('1900-01-01'), $lte: new Date('2100-12-31') },
        ...(projectId ? { targetProjectId: projectId } : {})
      }).lean()
    ])
    
    // Format transactions for frontend
    const formattedTransactions = transactions.map((transaction: any) => ({
      id: transaction._id.toString(),
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      projectId: transaction.projectId?._id.toString(),
      projectName: transaction.projectId?.name,
      expenseCategoryId: transaction.expenseCategoryId?._id.toString(),
      expenseCategoryName: transaction.expenseCategoryId?.name,
      transactionCategoryId: transaction.categoryId?._id.toString(),
      transactionCategoryName: transaction.categoryId?.name,
      source: transaction.source,
      paymentMethod: transaction.paymentMethod,
      receiptNumber: transaction.receiptNumber,
      createdBy: transaction.createdBy
    }))
    
    // Calculate stats
    const totalIncome = formattedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = formattedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalAllocations = allocations
      .reduce((sum: number, a: any) => sum + a.amount, 0)
    
    const activeProjects = projects.filter((p: any) => p.status === 'active').length
    
    const stats = {
      totalIncome,
      totalExpense: totalExpenses,
      netAmount: totalIncome - totalExpenses,
      transactionCount: formattedTransactions.length,
      projectCount: activeProjects,
      allocatedAmount: totalAllocations
    }
    
    // For dashboard summary, just return totals
    const summary = {
      income: totalIncome,
      expenses: totalExpenses,
      net: totalIncome - totalExpenses,
      activeProjects,
      totalTransactions: formattedTransactions.length,
      totalAllocations,
      generatedAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      report: summary,
      stats,
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        activeProjects
      },
      transactions: formattedTransactions,
      type: 'summary'
    })
    
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}