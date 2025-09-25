import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { ExpenseCategory } from '@/lib/models'

// GET - Fetch all expense categories
export async function GET() {
  try {
    await dbConnect()
    
    const categories = await ExpenseCategory.find()
      .sort({ 'display.sortOrder': 1, name: 1 })
      .select('name description type costCenter approval tax display isActive level path stats')
      .lean()
    
    return NextResponse.json({
      success: true,
      categories
    })
  } catch (error) {
    console.error('Error fetching expense categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expense categories' },
      { status: 500 }
    )
  }
}

// POST - Create new expense category
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { name, description, type, parentId, costCenter, display } = body

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // Validate type enum
    const validTypes = ['material', 'labor', 'equipment', 'transport', 'utilities', 'professional', 'administrative', 'other']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate cost center code if not provided
    let costCenterCode = costCenter?.code
    if (!costCenterCode) {
      const count = await ExpenseCategory.countDocuments({ type })
      const prefix = type.toUpperCase().substring(0, 3)
      costCenterCode = `${prefix}${String(count + 1).padStart(3, '0')}`
    }

    // Determine level and path
    let level = 0
    let path = type
    if (parentId) {
      const parent = await ExpenseCategory.findById(parentId)
      if (parent) {
        level = parent.level + 1
        path = `${parent.path}/${name.toLowerCase().replace(/\s+/g, '-')}`
      }
    }

    const category = await ExpenseCategory.create({
      name: name.trim(),
      description: description?.trim(),
      type,
      parentId: parentId || undefined,
      level,
      path,
      costCenter: {
        code: costCenterCode,
        department: costCenter?.department || 'Operations',
        location: costCenter?.location
      },
      approval: {
        requiresApproval: false,
        autoApprovalLimit: 0
      },
      tax: {
        deductible: true,
        gstApplicable: true,
        defaultGstRate: 18
      },
      display: {
        icon: display?.icon,
        color: display?.color,
        sortOrder: display?.sortOrder || 0
      },
      isActive: true
    })

    return NextResponse.json({
      success: true,
      category
    })
  } catch (error) {
    console.error('Error creating expense category:', error)
    
    // Handle duplicate key errors
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'A category with this cost center code already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create expense category' },
      { status: 500 }
    )
  }
}