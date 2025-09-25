import { NextRequest, NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth-mongo'

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (token) {
      // Destroy session in Redis and JWT
      await destroySession(token)
    }

    // Create response and clear cookie
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