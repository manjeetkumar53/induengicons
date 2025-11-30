'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  BarChart3, 
  Mail, 
  TrendingUp, 
  LogOut,
  MessageSquare,
  Building2,
  Code,
  Shield,
  ChevronRight,
  Activity,
  Calculator,
  Tag,
  FolderPlus
} from 'lucide-react'

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

interface DashboardStats {
  totalSubmissions: number
  todaySubmissions: number
  softwareProjects: number
  civilProjects: number
  recentSubmissions: ContactSubmission[]
}



export default function AdminDashboard() {
  const { user, isLoading, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    todaySubmissions: 0,
    softwareProjects: 0,
    civilProjects: 0,
    recentSubmissions: []
  })
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/login')
      return
    }

    if (user) {
      loadDashboardData()
    }
  }, [user, isLoading, router])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/contact')
      const data = await response.json()

      if (data.success) {
        const submissions = data.submissions
        const today = new Date().toDateString()
        
        const todaySubmissions = submissions.filter((sub: ContactSubmission) => 
          new Date(sub.timestamp).toDateString() === today
        ).length

        const softwareProjects = submissions.filter((sub: ContactSubmission) => 
          sub.projectType === 'software'
        ).length

        const civilProjects = submissions.filter((sub: ContactSubmission) => 
          sub.projectType === 'civil'
        ).length

        setStats({
          totalSubmissions: submissions.length,
          todaySubmissions,
          softwareProjects,
          civilProjects,
          recentSubmissions: submissions.slice(0, 5)
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoggingOut(false)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">InduEngicons Admin</h1>
                  <p className="text-sm text-gray-500">Management Dashboard</p>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today&apos;s Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todaySubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Software Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.softwareProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Civil Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.civilProjects}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Submissions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Submissions</h3>
                  <button
                    onClick={() => router.push('/admin/contact')}
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center"
                  >
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {stats.recentSubmissions.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions yet</p>
                  </div>
                ) : (
                  stats.recentSubmissions.map((submission) => (
                    <div key={submission.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{submission.name}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              submission.projectType === 'software' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {submission.projectType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{submission.email}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {submission.message.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-500">{formatDate(submission.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/admin/accounting')}
                  className="w-full flex items-center justify-between p-3 text-left bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 rounded-lg transition-colors border border-green-200"
                >
                  <div className="flex items-center">
                    <Calculator className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Accounting System</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                  onClick={() => router.push('/admin/categories')}
                  className="w-full flex items-center justify-between p-3 text-left bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-colors border border-purple-200"
                >
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Manage Categories</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                  onClick={() => router.push('/admin/projects')}
                  className="w-full flex items-center justify-between p-3 text-left bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-colors border border-blue-200"
                >
                  <div className="flex items-center">
                    <FolderPlus className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Manage Projects</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                  onClick={() => router.push('/admin/contact')}
                  className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">View All Contacts</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                  onClick={() => window.open('https://induengicons.vercel.app', '_blank')}
                  className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Visit Website</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                  onClick={() => loadDashboardData()}
                  className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Refresh Data</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Website</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}