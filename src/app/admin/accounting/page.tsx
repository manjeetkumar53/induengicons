'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  ArrowLeft,
  LogOut,
  Target,
  Calculator,
  FileText,
  Wallet,
  Building2,
  Activity
} from 'lucide-react'
import IncomeInput from '@/components/IncomeInput'
import ExpenseOutput from '@/components/ExpenseOutput'
import AllocationManager from '@/components/AllocationManager'
import ReportsManager from '@/components/ReportsManager'
import UnifiedAccountingDashboard from '@/components/accounting/AccountingDashboard'
import IncomeGrid from '@/components/accounting/IncomeGrid'
import ExpenseGrid from '@/components/accounting/ExpenseGrid'
import AllocationGrid from '@/components/accounting/AllocationGrid'
import ReportsGrid from '@/components/accounting/ReportsGrid'
import UnifiedTransactionGrid from '@/components/accounting/UnifiedTransactionGrid'



interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  netAmount: number
  activeProjects: number
}

type AccountingSection = 'overview' | 'unified' | 'transactions' | 'input' | 'input-grid' | 'output' | 'output-grid' | 'allocation' | 'allocation-grid' | 'reports' | 'reports-grid'

export default function AccountingDashboard() {
  const { user, isLoading, logout } = useAuth()
  const [activeSection, setActiveSection] = useState<AccountingSection>('transactions')
  const [loggingOut, setLoggingOut] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
    activeProjects: 0
  })
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
      const response = await fetch('/api/admin/accounting/reports')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.totals) {
          setDashboardStats({
            totalIncome: data.totals.income || 0,
            totalExpenses: data.totals.expenses || 0,
            netAmount: (data.totals.income || 0) - (data.totals.expenses || 0),
            activeProjects: data.totals.activeProjects || 0
          })
        } else {
          // Set default values if data structure is unexpected
          setDashboardStats({
            totalIncome: 0,
            totalExpenses: 0,
            netAmount: 0,
            activeProjects: 0
          })
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Set default values on error
      setDashboardStats({
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        activeProjects: 0
      })
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

  const sections = [
    {
      id: 'overview' as AccountingSection,
      title: 'Overview',
      icon: BarChart3,
      description: 'Financial summary and quick stats',
      color: 'bg-blue-500'
    },
    {
      id: 'transactions' as AccountingSection,
      title: 'Transactions',
      icon: Activity,
      description: 'Unified transaction management',
      color: 'bg-indigo-500'
    },
    {
      id: 'unified' as AccountingSection,
      title: 'Dashboard',
      icon: Building2,
      description: 'Modern dashboard view',
      color: 'bg-purple-500'
    },
    {
      id: 'input-grid' as AccountingSection,
      title: 'Income Grid',
      icon: TrendingUp,
      description: 'Tabular income management',
      color: 'bg-green-500'
    },
    {
      id: 'output-grid' as AccountingSection,
      title: 'Expense Grid',
      icon: TrendingDown,
      description: 'Tabular expense tracking',
      color: 'bg-red-500'
    },
    {
      id: 'allocation-grid' as AccountingSection,
      title: 'Allocation Grid',
      icon: Target,
      description: 'Fund allocation table',
      color: 'bg-purple-500'
    },
    {
      id: 'reports-grid' as AccountingSection,
      title: 'Reports Grid',
      icon: FileText,
      description: 'Analytics & reports table',
      color: 'bg-orange-500'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounting system...</p>
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
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Accounting System</h1>
                  <p className="text-sm text-gray-500">Financial management & reporting</p>
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

      {/* Navigation Tabs - Mobile Responsive */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-4 scrollbar-hide">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex flex-col items-center min-w-[100px] sm:min-w-[120px] px-3 py-3 rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg mb-2 ${isActive ? section.color : 'bg-gray-100'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <span className="text-sm font-medium">{section.title}</span>
                  <span className="text-xs text-gray-500 text-center mt-1 hidden sm:block">
                    {section.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Wallet className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-gray-900">₹{dashboardStats.totalIncome.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">₹{dashboardStats.totalExpenses.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeProjects}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Net Amount</p>
                    <p className={`text-2xl font-bold ${dashboardStats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{dashboardStats.netAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveSection('transactions')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">All Transactions</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('input-grid')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Income Grid</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('output-grid')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                >
                  <div className="text-center">
                    <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Expense Grid</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('allocation-grid')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <div className="text-center">
                    <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Allocation Grid</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium mb-2">Getting Started</h3>
              <p className="text-indigo-100 mb-4">
                Welcome to your accounting system! Start by adding your first income or expense transaction.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveSection('transactions')}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
                >
                  All Transactions
                </button>
                <button
                  onClick={() => setActiveSection('unified')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors border border-indigo-500"
                >
                  Dashboard View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Transaction Grid */}
        {activeSection === 'transactions' && (
          <UnifiedTransactionGrid userId={user?.id || ''} />
        )}

        {/* Unified Dashboard Section */}
        {activeSection === 'unified' && (
          <UnifiedAccountingDashboard userId={user?.id || ''} />
        )}

        {/* Grid Views - Full Width */}
        {activeSection === 'input-grid' && (
          <IncomeGrid 
            onAddTransaction={() => setActiveSection('input')}
            onEditTransaction={(transaction) => {
              console.log('Edit transaction:', transaction)
              // Could open a modal or navigate to edit form
            }}
            onViewReceipt={(transaction) => {
              console.log('View receipt:', transaction)
              // Could open receipt viewer
            }}
          />
        )}

        {activeSection === 'output-grid' && (
          <ExpenseGrid 
            onAddTransaction={() => setActiveSection('output')}
            onEditTransaction={(transaction) => {
              console.log('Edit transaction:', transaction)
              // Could open a modal or navigate to edit form
            }}
            onViewReceipt={(transaction) => {
              console.log('View receipt:', transaction)
              // Could open receipt viewer
            }}
          />
        )}

        {activeSection === 'allocation-grid' && (
          <AllocationGrid 
            onAddAllocation={() => setActiveSection('allocation')}
            onEditAllocation={(allocation) => {
              console.log('Edit allocation:', allocation)
              // Could open a modal or navigate to edit form
            }}
            onViewDetails={(allocation) => {
              console.log('View allocation details:', allocation)
              // Could open details modal
            }}
          />
        )}

        {activeSection === 'reports-grid' && (
          <ReportsGrid 
            onGenerateReport={() => setActiveSection('reports')}
            onViewReport={(report) => {
              console.log('View report:', report)
              // Could open report viewer
            }}
            onExportReport={(report, format) => {
              console.log('Export report:', report, format)
              // Could trigger export download
            }}
          />
        )}

        {/* Traditional Form Views */}
        {activeSection === 'input' && (
          <div className="bg-white rounded-lg shadow p-6">
            <IncomeInput 
              userId={user?.id || ''} 
              onSuccess={() => {
                loadDashboardData()
              }} 
            />
          </div>
        )}

        {activeSection === 'output' && (
          <div className="bg-white rounded-lg shadow p-6">
            <ExpenseOutput 
              userId={user?.id || ''} 
              onSuccess={() => {
                loadDashboardData()
              }} 
            />
          </div>
        )}

        {activeSection === 'allocation' && (
          <div className="bg-white rounded-lg shadow p-6">
            <AllocationManager 
              userId={user?.id || ''} 
              onSuccess={() => {
                loadDashboardData()
              }} 
            />
          </div>
        )}

        {activeSection === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <ReportsManager />
          </div>
        )}

        {activeSection !== 'overview' && 
         activeSection !== 'transactions' &&
         activeSection !== 'unified' && 
         activeSection !== 'input-grid' && 
         activeSection !== 'output-grid' && 
         activeSection !== 'allocation-grid' && 
         activeSection !== 'reports-grid' && 
         activeSection !== 'input' && 
         activeSection !== 'output' && 
         activeSection !== 'allocation' && 
         activeSection !== 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 capitalize">
                {activeSection} Section
              </h3>
              <p className="text-gray-600 mb-4">
                This section is under development. Coming soon!
              </p>
              <button
                onClick={() => setActiveSection('overview')}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                ← Back to Overview
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}