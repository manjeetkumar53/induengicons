'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, Shield, Mail, Phone, Building, Calendar, RefreshCw } from 'lucide-react'

interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  company: string
  projectType: string
  message: string
  timestamp: string
  status: string
}

interface AdminUser {
  userId: string
  username: string
  email: string
  role: string
}

export default function AdminContactPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const checkAuthAndFetchData = useCallback(async () => {
    try {
      // Check authentication
      const authResponse = await fetch('/api/admin/auth/session')
      if (!authResponse.ok) {
        router.push('/admin/login')
        return
      }

      const authData = await authResponse.json()
      setUser(authData.user)

      // Fetch submissions
      await fetchSubmissions()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkAuthAndFetchData()
  }, [checkAuthAndFetchData])

  const fetchSubmissions = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/admin/contact')
      const data = await response.json()
      
      if (data.success) {
        setSubmissions(data.submissions)
        setError('')
      } else {
        setError('Failed to fetch submissions')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setRefreshing(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Contact Submissions</h1>
                  <p className="text-sm text-gray-500">Manage customer inquiries</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {loggingOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Form Submissions</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Total submissions: <span className="font-semibold">{submissions.length}</span>
                </p>
              </div>
              <button
                onClick={fetchSubmissions}
                disabled={refreshing}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Mail className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-600">Contact form submissions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {submissions.map((submission) => (
                  <div key={submission.id} className="bg-gray-50 rounded-lg p-6 border hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{submission.name}</h3>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {submission.email}
                          </div>
                          {submission.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {submission.phone}
                            </div>
                          )}
                          {submission.company && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="h-4 w-4 mr-2" />
                              {submission.company}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
                          submission.projectType === 'software' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {submission.projectType}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(submission.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <div className="bg-white rounded-md p-3 border">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{submission.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <a
                        href={`mailto:${submission.email}?subject=Re: ${submission.projectType} Project Inquiry&body=Dear ${submission.name},%0D%0A%0D%0AThank you for your inquiry about ${submission.projectType} development services.%0D%0A%0D%0ABest regards,%0D%0AInduEngicons Team`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Reply via Email
                      </a>
                      {submission.phone && (
                        <a
                          href={`tel:${submission.phone}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}