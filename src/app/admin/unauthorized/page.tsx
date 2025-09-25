'use client'

import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Unauthorized() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don&apos;t have permission to access this resource.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Current Permissions</h3>
          {user && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Projects:</span>
                <span className={`font-medium capitalize ${
                  user.permissions.projects === 'admin' ? 'text-green-600' :
                  user.permissions.projects === 'write' ? 'text-blue-600' :
                  user.permissions.projects === 'read' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {user.permissions.projects}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transactions:</span>
                <span className={`font-medium capitalize ${
                  user.permissions.transactions === 'admin' ? 'text-green-600' :
                  user.permissions.transactions === 'write' ? 'text-blue-600' :
                  user.permissions.transactions === 'read' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {user.permissions.transactions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reports:</span>
                <span className={`font-medium capitalize ${
                  user.permissions.reports === 'admin' ? 'text-green-600' :
                  user.permissions.reports === 'write' ? 'text-blue-600' :
                  user.permissions.reports === 'read' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {user.permissions.reports}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Settings:</span>
                <span className={`font-medium capitalize ${
                  user.permissions.settings === 'admin' ? 'text-green-600' :
                  user.permissions.settings === 'write' ? 'text-blue-600' :
                  user.permissions.settings === 'read' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {user.permissions.settings}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Contact your administrator if you need additional permissions.
          </p>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}