'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: {
    resource: 'projects' | 'transactions' | 'reports' | 'settings'
    level: 'read' | 'write' | 'admin'
  }
  requiredRole?: 'admin' | 'manager' | 'accountant' | 'viewer'
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission,
  requiredRole 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login with current path as redirect target
      const currentPath = window.location.pathname
      router.push(`/admin/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    if (user) {
      // Check role requirement
      if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        router.push('/admin/unauthorized')
        return
      }

      // Check permission requirement
      if (requiredPermission) {
        const userPermission = user.permissions[requiredPermission.resource]
        
        // Permission hierarchy: admin > write > read > none
        const permissionLevel = {
          'none': 0,
          'read': 1,
          'write': 2,
          'admin': 3
        }
        
        const requiredLevel = permissionLevel[requiredPermission.level]
        const userLevel = permissionLevel[userPermission] || 0
        
        if (userLevel < requiredLevel) {
          router.push('/admin/unauthorized')
          return
        }
      }
    }
  }, [user, isLoading, router, requiredPermission, requiredRole])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading if user is not authenticated (redirect will happen)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Render protected content
  return <>{children}</>
}