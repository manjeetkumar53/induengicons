import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Project } from '@/lib/models'

// GET - Fetch single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params

    const project = await Project.findById(id)
      .populate('client.id', 'name type contact')

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      project
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params

    const body = await request.json()
    const {
      name,
      description,
      type,
      client,
      timeline,
      budget,
      status
    } = body

    // Validate required fields
    if (!name || !description || !type) {
      return NextResponse.json(
        { error: 'Name, description, and type are required' },
        { status: 400 }
      )
    }

    // Validate type enum
    const validTypes = ['construction', 'design', 'consulting', 'renovation', 'maintenance']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate status enum
    const validStatuses = ['planning', 'active', 'on-hold', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if project exists
    const existingProject = await Project.findById(id)
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Validate timeline
    if (timeline?.startDate && timeline?.estimatedEndDate) {
      const startDate = new Date(timeline.startDate)
      const endDate = new Date(timeline.estimatedEndDate)

      if (startDate >= endDate) {
        return NextResponse.json(
          { error: 'Estimated end date must be after start date' },
          { status: 400 }
        )
      }
    }

    // Validate budget
    if (budget?.totalBudget && budget.totalBudget <= 0) {
      return NextResponse.json(
        { error: 'Total budget must be greater than 0' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      name: name.trim(),
      description: description.trim(),
      type,
      status: status || existingProject.status
    }

    // Handle client data
    if (client) {
      // For now, we'll create a simple client object
      // In a full system, you might want to reference a separate clients collection
      updateData.client = {
        name: client.name?.trim() || existingProject.client.name,
        contactPerson: client.contactPerson?.trim() || existingProject.client.contactPerson
      }
    }

    // Handle timeline
    if (timeline) {
      updateData.timeline = {
        startDate: timeline.startDate ? new Date(timeline.startDate) : existingProject.timeline.startDate,
        estimatedEndDate: timeline.estimatedEndDate ? new Date(timeline.estimatedEndDate) : existingProject.timeline.estimatedEndDate,
        actualEndDate: timeline.actualEndDate ? new Date(timeline.actualEndDate) : existingProject.timeline.actualEndDate
      }
    }

    // Handle budget
    if (budget) {
      updateData.budget = {
        totalBudget: budget.totalBudget || existingProject.budget.totalBudget,
        allocatedBudget: budget.totalBudget || existingProject.budget.allocatedBudget,
        spentAmount: existingProject.budget.spentAmount, // Keep existing spent amount
        remainingBudget: (budget.totalBudget || existingProject.budget.totalBudget) - existingProject.budget.spentAmount,
        currency: budget.currency || existingProject.budget.currency || 'INR'
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('client.id', 'name type contact')

    return NextResponse.json({
      success: true,
      project: updatedProject
    })
  } catch (error) {
    console.error('Error updating project:', error)

    if (error instanceof Error && 'code' in error && (error as Error & { code: number }).code === 11000) {
      return NextResponse.json(
        { error: 'A project with this code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params

    const project = await Project.findById(id)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if project has associated transactions
    const { Transaction } = await import('@/lib/models')
    const transactionCount = await Transaction.countDocuments({
      projectId: id
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete project. It has ${transactionCount} associated transaction(s). Please delete or reassign the transactions first.` },
        { status: 409 }
      )
    }

    // Check if project has allocations
    const { Allocation } = await import('@/lib/models')
    const allocationCount = await Allocation.countDocuments({
      projectId: id
    })

    if (allocationCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete project. It has ${allocationCount} associated allocation(s). Please delete the allocations first.` },
        { status: 409 }
      )
    }

    await Project.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}