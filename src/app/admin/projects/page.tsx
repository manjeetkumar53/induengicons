'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  Search,
  Building2,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Filter
} from 'lucide-react'

interface Project {
  _id: string
  name: string
  code: string
  description: string
  type: 'construction' | 'design' | 'consulting' | 'renovation' | 'maintenance'
  client: {
    id: string
    name: string
    contactPerson: string
  }
  timeline: {
    startDate: string
    estimatedEndDate: string
    actualEndDate?: string
  }
  budget: {
    totalBudget: number
    allocatedBudget: number
    spentAmount: number
    remainingBudget: number
    currency: string
  }
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

interface ProjectFormData {
  name: string
  description: string
  type: 'construction' | 'design' | 'consulting' | 'renovation' | 'maintenance'
  clientName: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  startDate: string
  estimatedEndDate: string
  totalBudget: number
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
}

export default function ProjectsManagement() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    type: 'construction',
    clientName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    startDate: '',
    estimatedEndDate: '',
    totalBudget: 0,
    status: 'planning'
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/login')
      return
    }
    if (user) {
      loadProjects()
    }
  }, [user, isLoading, router])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/accounting/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateProjectCode = (name: string, type: string): string => {
    const typePrefix = {
      construction: 'CON',
      design: 'DES',
      consulting: 'CSL',
      renovation: 'REN',
      maintenance: 'MNT'
    }
    const prefix = typePrefix[type as keyof typeof typePrefix] || 'PRJ'
    const nameCode = name.substring(0, 3).toUpperCase()
    const timestamp = Date.now().toString().slice(-3)
    return `${prefix}${nameCode}${timestamp}`
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Project name is required'
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }
    
    if (!formData.clientName.trim()) {
      errors.clientName = 'Client name is required'
    }
    
    if (!formData.contactPerson.trim()) {
      errors.contactPerson = 'Contact person is required'
    }
    
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.contactEmail = 'Invalid email format'
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required'
    }
    
    if (!formData.estimatedEndDate) {
      errors.estimatedEndDate = 'Estimated end date is required'
    }
    
    if (formData.startDate && formData.estimatedEndDate && 
        new Date(formData.startDate) >= new Date(formData.estimatedEndDate)) {
      errors.estimatedEndDate = 'End date must be after start date'
    }
    
    if (formData.totalBudget <= 0) {
      errors.totalBudget = 'Budget must be greater than 0'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const url = editingProject 
        ? `/api/admin/accounting/projects/${editingProject._id}`
        : '/api/admin/accounting/projects'
      
      const method = editingProject ? 'PUT' : 'POST'
      
      const projectCode = editingProject?.code || generateProjectCode(formData.name, formData.type)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          code: projectCode,
          description: formData.description.trim(),
          type: formData.type,
          client: {
            name: formData.clientName.trim(),
            contactPerson: formData.contactPerson.trim(),
            email: formData.contactEmail.trim() || undefined,
            phone: formData.contactPhone.trim() || undefined
          },
          timeline: {
            startDate: formData.startDate,
            estimatedEndDate: formData.estimatedEndDate
          },
          budget: {
            totalBudget: formData.totalBudget,
            allocatedBudget: formData.totalBudget,
            spentAmount: editingProject?.budget.spentAmount || 0,
            remainingBudget: formData.totalBudget - (editingProject?.budget.spentAmount || 0),
            currency: 'INR'
          },
          status: formData.status
        })
      })
      
      if (response.ok) {
        await loadProjects()
        handleCancel()
      } else {
        const errorData = await response.json()
        setFormErrors({ general: errorData.error || 'Failed to save project' })
      }
    } catch (error) {
      setFormErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description,
      type: project.type,
      clientName: project.client.name,
      contactPerson: project.client.contactPerson,
      contactEmail: '',
      contactPhone: '',
      startDate: project.timeline.startDate.split('T')[0],
      estimatedEndDate: project.timeline.estimatedEndDate.split('T')[0],
      totalBudget: project.budget.totalBudget,
      status: project.status
    })
    setFormErrors({})
    setShowForm(true)
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/accounting/projects/${projectId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadProjects()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete project')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProject(null)
    setFormData({
      name: '',
      description: '',
      type: 'construction',
      clientName: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      startDate: '',
      estimatedEndDate: '',
      totalBudget: 0,
      status: 'planning'
    })
    setFormErrors({})
  }

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      construction: 'bg-orange-100 text-orange-800',
      design: 'bg-purple-100 text-purple-800',
      consulting: 'bg-blue-100 text-blue-800',
      renovation: 'bg-green-100 text-green-800',
      maintenance: 'bg-gray-100 text-gray-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
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
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Projects Management</h1>
                  <p className="text-sm text-gray-500">Manage projects and client information</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {project.code}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(project.type)}`}>
                        {project.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{project.client.name}</span>
                    <span className="text-gray-500">({project.client.contactPerson})</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(project.timeline.startDate).toLocaleDateString('en-IN')} - {new Date(project.timeline.estimatedEndDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{formatCurrency(project.budget.totalBudget)}</span>
                        <span className="text-xs text-gray-500">
                          {((project.budget.spentAmount / project.budget.totalBudget) * 100).toFixed(1)}% used
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${Math.min((project.budget.spentAmount / project.budget.totalBudget) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? 'No projects match your search criteria.' 
                : 'Get started by creating your first project.'
              }
            </p>
            {(!searchQuery && filterStatus === 'all') && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Project
              </button>
            )}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        formErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter project name"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="construction">Construction</option>
                      <option value="design">Design</option>
                      <option value="consulting">Consulting</option>
                      <option value="renovation">Renovation</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter project description"
                  />
                  {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        formErrors.clientName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter client name"
                    />
                    {formErrors.clientName && <p className="text-red-500 text-xs mt-1">{formErrors.clientName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        formErrors.contactPerson ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter contact person"
                    />
                    {formErrors.contactPerson && <p className="text-red-500 text-xs mt-1">{formErrors.contactPerson}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        formErrors.contactEmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {formErrors.contactEmail && <p className="text-red-500 text-xs mt-1">{formErrors.contactEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        formErrors.startDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.startDate && <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.estimatedEndDate}
                      onChange={(e) => setFormData({ ...formData, estimatedEndDate: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        formErrors.estimatedEndDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.estimatedEndDate && <p className="text-red-500 text-xs mt-1">{formErrors.estimatedEndDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Budget (INR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.totalBudget ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter total budget"
                  />
                  {formErrors.totalBudget && <p className="text-red-500 text-xs mt-1">{formErrors.totalBudget}</p>}
                </div>

                {formErrors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{formErrors.general}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{isSubmitting ? 'Saving...' : 'Save Project'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}