import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Project, Company, User } from '@/lib/models'

// GET - Fetch all projects
export async function GET() {
  try {
    await dbConnect()
    
    const projects = await Project.find()
      .populate('client.id', 'name type contact')
      .populate('team.projectManager', 'firstName lastName email')
      .sort({ 'timeline.startDate': -1 })
      .select('name code description type client timeline budget team location status priority audit')
      .lean()
    
    return NextResponse.json({
      success: true,
      projects
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { 
      name, 
      description, 
      type, 
      clientId, 
      clientName, 
      contactPerson,
      startDate, 
      estimatedEndDate, 
      totalBudget,
      projectManagerId,
      location,
      status,
      priority
    } = body

    // Validate required fields
    if (!name || !clientId || !startDate || !totalBudget || !projectManagerId) {
      return NextResponse.json(
        { error: 'Name, client, start date, budget, and project manager are required' },
        { status: 400 }
      )
    }

    // Validate client exists
    const client = await Company.findById(clientId)
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Validate project manager exists
    const projectManager = await User.findById(projectManagerId)
    if (!projectManager) {
      return NextResponse.json(
        { error: 'Project manager not found' },
        { status: 404 }
      )
    }

    // Generate unique project code
    const count = await Project.countDocuments()
    const code = `PROJ${String(count + 1).padStart(3, '0')}`

    // Check if project with same name exists
    const existingProject = await Project.findOne({ name: name.trim() })
    if (existingProject) {
      return NextResponse.json(
        { error: 'Project with this name already exists' },
        { status: 409 }
      )
    }

    const project = await Project.create({
      name: name.trim(),
      code,
      description: description?.trim(),
      type: type || 'construction',
      client: {
        id: clientId,
        name: clientName || client.name,
        contactPerson: contactPerson || client.contact?.primaryContact?.name || 'N/A'
      },
      timeline: {
        startDate: new Date(startDate),
        estimatedEndDate: estimatedEndDate ? new Date(estimatedEndDate) : undefined
      },
      budget: {
        totalBudget: parseFloat(totalBudget),
        allocatedBudget: 0,
        spentAmount: 0,
        remainingBudget: parseFloat(totalBudget),
        currency: 'INR'
      },
      team: {
        projectManager: projectManagerId
      },
      location: {
        site: location?.site || 'TBD',
        address: {
          street: location?.address?.street || '',
          city: location?.address?.city || '',
          state: location?.address?.state || '',
          pincode: location?.address?.pincode || ''
        }
      },
      status: status || 'planning',
      priority: priority || 'medium',
      audit: {
        createdBy: projectManagerId, // Using project manager as creator for now
        createdAt: new Date(),
        version: 1
      }
    })

    // Populate the response
    const populatedProject = await Project.findById(project._id)
      .populate('client.id', 'name type')
      .populate('team.projectManager', 'firstName lastName email')

    return NextResponse.json({
      success: true,
      project: populatedProject
    })
  } catch (error) {
    console.error('Error creating project:', error)
    
    // Handle duplicate key errors
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'A project with this code already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}