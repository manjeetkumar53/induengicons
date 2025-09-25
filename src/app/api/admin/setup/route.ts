import { NextRequest, NextResponse } from 'next/server'
import { isSetupRequired, createUser } from '@/lib/auth-mongo'

// GET endpoint to check if setup is needed
export async function GET() {
  try {
    const needsSetup = await isSetupRequired()

    return NextResponse.json({
      success: true,
      needsSetup,
      message: needsSetup ? 'Admin setup required' : 'Admin already configured'
    })

  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if admin users already exist
    const needsSetup = await isSetupRequired()
    if (!needsSetup) {
      return NextResponse.json(
        { error: 'Admin users already exist' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { username, email, password, firstName, lastName, setupKey } = body

    // Simple setup protection (in production, use environment variable)
    if (setupKey !== 'induengicons-admin-setup-2025') {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 401 }
      )
    }

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Create admin user
    const adminUser = await createUser({
      username,
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
      permissions: {
        projects: 'admin',
        transactions: 'admin',
        reports: 'admin',
        settings: 'admin'
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
          permissions: adminUser.permissions
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}