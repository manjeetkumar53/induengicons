import { NextRequest, NextResponse } from 'next/server'
import { validateSession, AuthUser } from '@/lib/auth-mongo'

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser
}

/**
 * Authentication middleware that validates JWT tokens from cookies
 */
export async function authenticate(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return null
    }

    // Validate session and get user data
    const user = await validateSession(token)
    return user
    
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return null
  }
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>,
  requiredPermissions?: {
    resource: 'projects' | 'transactions' | 'reports' | 'settings'
    level: 'read' | 'write' | 'admin'
  }
) {
  return async (request: NextRequest) => {
    try {
      // Authenticate user
      const user = await authenticate(request)
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Check permissions if required
      if (requiredPermissions) {
        const userPermission = user.permissions[requiredPermissions.resource]
        
        // Permission hierarchy: admin > write > read > none
        const permissionLevel = {
          'none': 0,
          'read': 1,
          'write': 2,
          'admin': 3
        }
        
        const requiredLevel = permissionLevel[requiredPermissions.level]
        const userLevel = permissionLevel[userPermission as keyof typeof permissionLevel] || 0
        
        if (userLevel < requiredLevel) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
      }

      // Call the protected handler
      return await handler(request, user)
      
    } catch (error) {
      console.error('Auth wrapper error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware to check if user has admin role
 */
export function requireAdmin(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return withAuth(async (request: NextRequest, user: AuthUser) => {
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    return await handler(request, user)
  })
}

/**
 * Logout endpoint helper
 */
export async function logout(request: NextRequest): Promise<NextResponse> {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear the auth token cookie
    response.cookies.delete('auth-token')
    
    return response
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}

export default {
  authenticate,
  withAuth,
  requireAdmin,
  logout
}