import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User, Company, Project, TransactionCategory, ExpenseCategory } from '@/lib/models'

export async function GET() {
  try {
    console.log('🔗 Testing MongoDB connection...')
    
    // Connect to database
    await dbConnect()
    console.log('✅ Connected to MongoDB')

    // Test basic queries
    const stats = {
      users: await User.countDocuments(),
      companies: await Company.countDocuments(),
      projects: await Project.countDocuments(),
      transactionCategories: await TransactionCategory.countDocuments(),
      expenseCategories: await ExpenseCategory.countDocuments()
    }

    // Test sample data retrieval
    const sampleUser = await User.findOne().select('username email role')
    const sampleProject = await Project.findOne().populate('client.id', 'name').select('name code status budget')
    const sampleCategories = await TransactionCategory.find().limit(3).select('name type accounting.code')

    console.log('📊 Database stats:', stats)
    console.log('👤 Sample user:', sampleUser?.toObject())
    console.log('🏗️ Sample project:', sampleProject?.toObject())

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection test successful',
      timestamp: new Date().toISOString(),
      stats,
      samples: {
        user: sampleUser,
        project: sampleProject,
        categories: sampleCategories
      }
    })

  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { operation } = await request.json()
    
    await dbConnect()

    if (operation === 'create_test_transaction') {
      // Test creating a transaction category
      const testCategory = await TransactionCategory.create({
        name: 'Test API Category',
        description: 'Created via API test',
        type: 'expense',
        path: 'test',
        level: 0,
        accounting: {
          code: 'TEST001',
          taxCategory: 'taxable'
        },
        display: {
          icon: '🧪',
          color: '#FF6B6B',
          sortOrder: 999
        },
        isActive: true,
        isSystemCategory: false
      })

      return NextResponse.json({
        success: true,
        message: 'Test transaction category created',
        data: testCategory
      })
    }

    if (operation === 'cleanup_test_data') {
      // Clean up test data
      const result = await TransactionCategory.deleteMany({ 
        name: { $regex: /^Test/ } 
      })

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${result.deletedCount} test records`
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown operation'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ MongoDB operation failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}