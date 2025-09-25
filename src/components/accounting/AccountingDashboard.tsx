'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight, 
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Settings,
  Menu,
  X
} from 'lucide-react'
import TransactionManager from './TransactionManager'

// Type definitions
interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  totalAllocations: number
  netBalance: number
  transactionCount: number
}

interface AccountingDashboardProps {
  userId: string
}

type ActiveModule = 'income' | 'expenses' | 'allocations' | 'reports'

const MODULES = [
  {
    id: 'income' as const,
    title: 'Income',
    subtitle: 'Revenue & Receipts',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-600',
    lightBg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    text: 'text-green-700'
  },
  {
    id: 'expenses' as const,
    title: 'Expenses', 
    subtitle: 'Costs & Payments',
    icon: TrendingDown,
    color: 'from-red-500 to-pink-600',
    lightBg: 'from-red-50 to-pink-50',
    border: 'border-red-200',
    text: 'text-red-700'
  },
  {
    id: 'allocations' as const,
    title: 'Allocations',
    subtitle: 'Fund Distribution', 
    icon: ArrowLeftRight,
    color: 'from-indigo-500 to-purple-600',
    lightBg: 'from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700'
  },
  {
    id: 'reports' as const,
    title: 'Reports',
    subtitle: 'Analytics & Insights',
    icon: BarChart3,
    color: 'from-orange-500 to-amber-600',
    lightBg: 'from-orange-50 to-amber-50',
    border: 'border-orange-200',
    text: 'text-orange-700'
  }
]

export default function AccountingDashboard({ userId }: AccountingDashboardProps) {
  const [activeModule, setActiveModule] = useState<ActiveModule>('income')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    totalAllocations: 0,
    netBalance: 0,
    transactionCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load dashboard statistics
  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/accounting/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const activeModuleData = MODULES.find(m => m.id === activeModule)!

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">Accounting Dashboard</h1>
                <p className="text-sm text-gray-600">InduEngicons Financial Management</p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Search className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>

              <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 bg-gradient-to-r ${activeModuleData.color}`}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New {activeModuleData.title}</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-green-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '---' : `₹${stats.totalIncome.toLocaleString('en-IN')}`}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '---' : `₹${stats.totalExpenses.toLocaleString('en-IN')}`}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Allocations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '---' : `₹${stats.totalAllocations.toLocaleString('en-IN')}`}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                <ArrowLeftRight className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Net Balance</p>
                <p className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {isLoading ? '---' : `₹${stats.netBalance.toLocaleString('en-IN')}`}
                </p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stats.netBalance >= 0 ? 'from-green-100 to-emerald-100' : 'from-red-100 to-pink-100'} rounded-xl flex items-center justify-center`}>
                <BarChart3 className={`h-6 w-6 ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block lg:w-80 space-y-4`}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Modules</h3>
              <nav className="space-y-2">
                {MODULES.map((module) => {
                  const Icon = module.icon
                  const isActive = activeModule === module.id
                  
                  return (
                    <button
                      key={module.id}
                      onClick={() => {
                        setActiveModule(module.id)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 ${
                        isActive 
                          ? `bg-gradient-to-r ${module.lightBg} ${module.border} border-2 ${module.text}` 
                          : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive 
                          ? `bg-gradient-to-r ${module.color} text-white` 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{module.title}</p>
                        <p className="text-sm opacity-75">{module.subtitle}</p>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Transactions</span>
                  <span className="font-semibold text-gray-900">
                    {isLoading ? '---' : stats.transactionCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-gray-900">---</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-semibold text-gray-900">---</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[600px]">
              {/* Module Header */}
              <div className={`p-6 border-b border-gray-200 bg-gradient-to-r ${activeModuleData.lightBg} rounded-t-2xl`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${activeModuleData.color} rounded-xl flex items-center justify-center`}>
                    <activeModuleData.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{activeModuleData.title} Management</h2>
                    <p className="text-sm text-gray-600">{activeModuleData.subtitle} • Manage your {activeModuleData.title.toLowerCase()}</p>
                  </div>
                </div>
              </div>

              {/* Module Content */}
              <div className="p-6">
                {activeModule === 'income' && (
                  <TransactionManager
                    type="income"
                    userId={userId}
                    onStatsChange={loadDashboardStats}
                  />
                )}
                
                {activeModule === 'expenses' && (
                  <TransactionManager
                    type="expense"
                    userId={userId}
                    onStatsChange={loadDashboardStats}
                  />
                )}
                
                {(activeModule === 'allocations' || activeModule === 'reports') && (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    <div className="text-center">
                      <activeModuleData.icon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">Loading {activeModuleData.title} Module...</p>
                      <p className="text-sm">This module will be available soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}