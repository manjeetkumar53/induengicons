import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { TransactionCategory } from '@/lib/models'

// GET - Fetch all transaction categories
export async function GET() {
  try {
    await dbConnect()
    
    const categories = await TransactionCategory.find()
      .sort({ 'display.sortOrder': 1, name: 1 })
      .select('name description type accounting display isActive isSystemCategory level path')
      .lean()
    
    return NextResponse.json({
      success: true,
      categories
    })
  } catch (error) {
    console.error('Error fetching transaction categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction categories' },
      { status: 500 }
    )
  }
}

// POST - Create new transaction category
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { name, description, type, parentId, accounting, display } = body

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

    // Generate accounting code if not provided
    let accountingCode = accounting?.code
    if (!accountingCode) {
      const count = await TransactionCategory.countDocuments({ type })
      const prefix = type.toUpperCase().substring(0, 3)
      accountingCode = `${prefix}${String(count + 1).padStart(3, '0')}`
    }

    // Determine level and path
    let level = 0
    let path = type
    if (parentId) {
      const parent = await TransactionCategory.findById(parentId)
      if (parent) {
        level = parent.level + 1
        path = `${parent.path}/${name.toLowerCase().replace(/\s+/g, '-')}`
      }
    }

    const category = await TransactionCategory.create({
      name: name.trim(),
      description: description?.trim(),
      type,
      parentId: parentId || undefined,
      level,
      path,
      accounting: {
        code: accountingCode,
        taxCategory: accounting?.taxCategory || 'taxable',
        defaultTaxRate: accounting?.defaultTaxRate
      },
      display: {
        icon: display?.icon,
        color: display?.color,
        sortOrder: display?.sortOrder || 0
      },
      isActive: true,
      isSystemCategory: false
    })

    return NextResponse.json({
      success: true,
      category
    })
  } catch (error) {
    console.error('Error creating transaction category:', error)
    
    // Handle duplicate key errors
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'A category with this accounting code already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create transaction category' },
      { status: 500 }
    )
  }
}