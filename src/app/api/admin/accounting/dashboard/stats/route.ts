import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Transaction, Allocation } from '@/lib/models'

export async function GET() {
  try {
    await dbConnect()

    // Aggregate statistics
    const [incomeStats, expenseStats, allocationStats, totalTransactions] = await Promise.all([
      // Total income
      Transaction.aggregate([
        { $match: { type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Total expenses  
      Transaction.aggregate([
        { $match: { type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Total allocations
      Allocation.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Total transaction count
      Transaction.countDocuments()
    ])

    const totalIncome = incomeStats[0]?.total || 0
    const totalExpenses = expenseStats[0]?.total || 0
    const totalAllocations = allocationStats[0]?.total || 0
    const netBalance = totalIncome - totalExpenses

    const stats = {
      totalIncome,
      totalExpenses,
      totalAllocations,
      netBalance,
      transactionCount: totalTransactions
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard statistics' },
      { status: 500 }
    )
  }
}