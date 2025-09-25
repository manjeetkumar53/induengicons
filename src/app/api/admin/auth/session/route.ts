import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json(
        { error: 'No valid session' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          userId: session.userId,
          username: session.username,
          email: session.email,
          role: session.role
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}