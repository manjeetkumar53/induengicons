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
  Activity,
  Sparkles
} from 'lucide-react'
import IncomeInput from '@/components/IncomeInput'
import ExpenseOutput from '@/components/ExpenseOutput'
import AllocationManager from '@/components/AllocationManager'
import ReportsManager from '@/components/ReportsManager'
import IncomeGrid from '@/components/accounting/IncomeGrid'
import ExpenseGrid from '@/components/accounting/ExpenseGrid'
import AllocationGrid from '@/components/accounting/AllocationGrid'
import ReportsDashboard from '@/components/accounting/ReportsDashboard'
import UnifiedTransactionGrid from '@/components/accounting/UnifiedTransactionGrid'
import { AIChatInterface } from '@/components/ai/AIChatInterface'



interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  netAmount: number
  activeProjects: number
}

type AccountingSection = 'transactions' | 'input-grid' | 'output-grid' | 'allocation-grid' | 'reports-grid' | 'ai-assistant' | 'input' | 'output' | 'allocation' | 'reports'

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
      id: 'transactions' as AccountingSection,
      title: 'Transactions',
      icon: Activity,
      description: 'All transactions',
      color: 'bg-indigo-500'
    },
    {
      id: 'input-grid' as AccountingSection,
      title: 'Income',
      icon: TrendingUp,
      description: 'Income management',
      color: 'bg-green-500'
    },
    {
      id: 'output-grid' as AccountingSection,
      title: 'Expenses',
      icon: TrendingDown,
      description: 'Expense tracking',
      color: 'bg-red-500'
    },
    {
      id: 'allocation-grid' as AccountingSection,
      title: 'Allocations',
      icon: Target,
      description: 'Fund allocation',
      color: 'bg-purple-500'
    },
    {
      id: 'reports-grid' as AccountingSection,
      title: 'Reports',
      icon: FileText,
      description: 'Analytics & reports',
      color: 'bg-orange-500'
    },
    {
      id: 'ai-assistant' as AccountingSection,
      title: 'AI Assistant',
      icon: Sparkles,
      description: 'Ask questions about your finances',
      color: 'bg-blue-500'
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
                  className={`flex flex-col items-center min-w-[100px] sm:min-w-[120px] px-3 py-3 rounded-lg transition-all whitespace-nowrap ${isActive
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
      <main className={(activeSection === 'transactions' || activeSection === 'input-grid' || activeSection === 'output-grid' || activeSection === 'allocation-grid' || activeSection === 'reports-grid' || activeSection === 'ai-assistant') ? 'h-[calc(100vh-9rem)] px-4 sm:px-6 lg:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}>
        {/* Main Transaction Grid */}
        {activeSection === 'transactions' && (
          <div className="h-full">
            <UnifiedTransactionGrid />
          </div>
        )}

        {/* Grid Views - Full Width */}
        {activeSection === 'input-grid' && (
          <div className="h-full">
            <IncomeGrid
              onAddTransaction={() => setActiveSection('input')}
              onEditTransaction={(transaction) => {
                // Inline editing is handled by the grid component
              }}
              onViewReceipt={(transaction) => {
                // Receipt viewer can be implemented here
              }}
            />
          </div>
        )}

        {activeSection === 'output-grid' && (
          <div className="h-full">
            <ExpenseGrid
              onAddTransaction={() => setActiveSection('output')}
              onEditTransaction={(transaction) => {
                // Inline editing is handled by the grid component
              }}
              onViewReceipt={(transaction) => {
                // Receipt viewer can be implemented here
              }}
            />
          </div>
        )}

        {activeSection === 'allocation-grid' && (
          <div className="h-full">
            <AllocationGrid />
          </div>
        )}

        {activeSection === 'reports-grid' && (
          <div className="h-full">
            <ReportsDashboard />
          </div>
        )}

        {activeSection === 'ai-assistant' && (
          <div className="h-full flex items-center justify-center p-6">
            <AIChatInterface />
          </div>
        )}
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

        {activeSection !== 'transactions' &&
          activeSection !== 'input-grid' &&
          activeSection !== 'output-grid' &&
          activeSection !== 'allocation-grid' &&
          activeSection !== 'reports-grid' &&
          activeSection !== 'input' &&
          activeSection !== 'output' &&
          activeSection !== 'allocation' &&
          activeSection !== 'reports' &&
          activeSection !== 'ai-assistant' && (
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
                  onClick={() => setActiveSection('transactions')}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  ← Back to Transactions
                </button>
              </div>
            </div>
          )}
      </main>
    </div>
  )
}