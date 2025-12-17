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
    
    // Handle both nested structure (from full form) and flat structure (from quick creation)
    const name = body.name
    const description = body.description  
    const type = body.type
    
    // Extract client info - could be nested or flat
    const clientId = body.clientId || body.client?.id
    const clientName = body.clientName || body.client?.name
    const contactPerson = body.contactPerson || body.client?.contactPerson
    const contactEmail = body.contactEmail || body.client?.email
    const contactPhone = body.contactPhone || body.client?.phone
    
    // Extract timeline info - could be nested or flat
    const startDate = body.startDate || body.timeline?.startDate
    const estimatedEndDate = body.estimatedEndDate || body.timeline?.estimatedEndDate
    
    // Extract budget info - could be nested or flat
    const totalBudget = body.totalBudget || body.budget?.totalBudget
    
    // Extract other fields
    const projectManagerId = body.projectManagerId || body.team?.projectManager
    const location = body.location || body.location?.site
    const status = body.status
    const priority = body.priority

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    // For simplified project creation (when client info is provided as strings)
    if (clientName && !clientId) {
      try {
        // First, try to find existing client by name
        let client = await Company.findOne({ name: clientName.trim(), type: 'client' })
        
        // If client doesn't exist, create a new one
        if (!client) {
          client = await Company.create({
            name: clientName.trim(),
            type: 'client',
            contact: {
              primaryContact: {
                name: contactPerson?.trim() || clientName.trim(),
                designation: 'Contact Person',
                email: 'contact@company.com', // Default email - should be updated later
                phone: '9999999999' // Default phone - should be updated later
              }
            },
            registration: {
              registeredAddress: {
                street: 'TBD',
                city: location || 'Mumbai',
                state: 'Maharashtra', 
                pincode: '400001',
                country: 'India'
              }
            },
            status: 'active'
          })
        }

        // Generate unique project code if not provided
        const count = await Project.countDocuments()
        const defaultCode = `PROJ${String(count + 1).padStart(3, '0')}`
        const projectCode = body.code || defaultCode

        // Find any admin user to use as default project manager
        const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne()
        
        if (!adminUser) {
          return NextResponse.json(
            { error: 'No user found to assign as project manager' },
            { status: 400 }
          )
        }

        const project = await Project.create({
          name: name.trim(),
          code: projectCode,
          description: description?.trim(),
          type: type || 'construction',
          client: {
            id: client._id,
            name: client.name,
            contactPerson: contactPerson?.trim() || client.contact?.primaryContact?.name || 'N/A'
          },
          timeline: {
            startDate: startDate ? new Date(startDate) : new Date(),
            estimatedEndDate: estimatedEndDate ? new Date(estimatedEndDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
          },
          budget: {
            totalBudget: totalBudget || 0,
            allocatedBudget: totalBudget || 0,
            spentAmount: 0,
            remainingBudget: totalBudget || 0,
            currency: 'INR'
          },
          team: {
            projectManager: adminUser._id
          },
          location: {
            site: location || 'TBD',
            address: {
              street: 'TBD',
              city: location || 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001'
            }
          },
          status: status || 'planning',
          priority: priority || 'medium',
          audit: {
            createdBy: adminUser._id
          }
        })

        return NextResponse.json({
          success: true,
          project
        })
      } catch (err) {
        console.error('Error creating simplified project:', err)
        return NextResponse.json(
          { error: 'Failed to create project: ' + (err instanceof Error ? err.message : 'Unknown error') },
          { status: 500 }
        )
      }
    }

    // For complex project creation (traditional form with all fields)
    // If we don't have clientName for simplified creation, we need full client data
    if (!clientName) {
      if (!clientId || !startDate || !totalBudget) {
        return NextResponse.json(
          { error: 'Name, client ID, start date, and budget are required for detailed project creation' },
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

      // For complex creation, we need a project manager
      const projectManager = projectManagerId ? await User.findById(projectManagerId) : await User.findOne({ role: 'admin' })
      if (!projectManager) {
        return NextResponse.json(
          { error: 'Project manager not found' },
          { status: 404 }
        )
      }

      // Create project with existing client
      const project = await Project.create({
        name: name.trim(),
        code: body.code || `PROJ${String(await Project.countDocuments() + 1).padStart(3, '0')}`,
        description: description?.trim(),
        type: type || 'construction',
        client: {
          id: client._id,
          name: client.name,
          contactPerson: contactPerson?.trim() || client.contact?.primaryContact?.name || 'N/A'
        },
        timeline: {
          startDate: new Date(startDate),
          estimatedEndDate: estimatedEndDate ? new Date(estimatedEndDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        budget: {
          totalBudget: totalBudget,
          allocatedBudget: totalBudget,
          spentAmount: 0,
          remainingBudget: totalBudget,
          currency: 'INR'
        },
        team: {
          projectManager: projectManager._id
        },
        location: {
          site: location || 'TBD',
          address: {
            street: 'TBD',
            city: location || 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          }
        },
        status: status || 'planning',
        priority: priority || 'medium',
        audit: {
          createdBy: projectManager._id
        }
      })

      return NextResponse.json({
        success: true,
        project
      })
    }

    // If we reach here, something went wrong
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error creating project:', error)
    
    // Handle duplicate key errors
    if (error instanceof Error && 'code' in error && (error as Error & { code: number }).code === 11000) {
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