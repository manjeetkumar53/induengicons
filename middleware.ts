import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateSession } from '@/lib/auth-mongo'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the request is for an admin route (excluding login and setup)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/setup')) {
    try {
      // Get token from cookie
      const token = request.cookies.get('auth-token')?.value
      
      if (!token) {
        // Redirect to login if no token
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Verify the session
      const user = await validateSession(token)
      
      if (!user) {
        // Redirect to login if no valid session
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Add user info to headers for the route handlers
      const response = NextResponse.next()
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-username', user.username)
      return response

    } catch (error) {
      console.error('Middleware auth error:', error)
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Check if user is already logged in and trying to access login page
  if (pathname === '/admin/login') {
    try {
      const token = request.cookies.get('auth-token')?.value
      if (token) {
        const user = await validateSession(token)
        if (user) {
          // Redirect to dashboard if already logged in
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
      }
    } catch (error) {
      // Continue to login page if session verification fails
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all admin routes:
     * - /admin/dashboard
     * - /admin/contact
     * - /admin/login (for redirect handling)
     * - /admin/setup (for initial setup)
     */
    '/admin/:path*'
  ]
}