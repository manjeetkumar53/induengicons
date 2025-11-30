'use client'

import { useState, useEffect } from 'react'
import { Plus, Save, X } from 'lucide-react'

interface Project {
  _id: string
  name: string
  code: string
  description: string
  type: 'construction' | 'design' | 'consulting' | 'renovation' | 'maintenance'
  client: {
    name: string
    contactPerson: string
  }
  budget: {
    totalBudget: number
    currency: string
  }
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
}

interface QuickProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: Project) => void
  initialName?: string
}

export default function QuickProjectModal({
  isOpen,
  onClose,
  onSave,
  initialName = ''
}: QuickProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'construction' as const,
    clientName: '',
    contactPerson: '',
    totalBudget: 100000,
    startDate: new Date().toISOString().split('T')[0],
    estimatedEndDate: '',
    status: 'planning' as const
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Update name when initialName changes or modal opens
  useEffect(() => {
    if (isOpen && initialName) {
      setFormData(prev => ({ ...prev, name: initialName }))
    }
  }, [isOpen, initialName])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    console.log('Submitting project form:', formData)

    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }

    if (!formData.description.trim()) {
      setError('Description is required')
      return
    }

    if (!formData.clientName.trim()) {
      setError('Client name is required')
      return
    }

    if (!formData.contactPerson.trim()) {
      setError('Contact person is required')
      return
    }

    if (!formData.estimatedEndDate) {
      setError('Estimated end date is required')
      return
    }

    if (formData.startDate && formData.estimatedEndDate &&
      new Date(formData.startDate) > new Date(formData.estimatedEndDate)) {
      setError('End date must be after start date')
      return
    }

    if (formData.totalBudget <= 0) {
      setError('Budget must be greater than 0')
      return
    }

    setIsSubmitting(true)

    try {
      const projectCode = generateProjectCode(formData.name, formData.type)

      const payload = {
        name: formData.name.trim(),
        code: projectCode,
        description: formData.description.trim(),
        type: formData.type,
        client: {
          name: formData.clientName.trim(),
          contactPerson: formData.contactPerson.trim()
        },
        timeline: {
          startDate: formData.startDate,
          estimatedEndDate: formData.estimatedEndDate
        },
        budget: {
          totalBudget: formData.totalBudget,
          allocatedBudget: formData.totalBudget,
          spentAmount: 0,
          remainingBudget: formData.totalBudget,
          currency: 'INR'
        },
        status: formData.status
      }

      console.log('Sending project payload:', payload)

      const response = await fetch('/api/admin/accounting/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      console.log('Project creation response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Project created successfully:', data)
        onSave(data.project)
        handleClose()
      } else {
        let errorMessage = 'Failed to create project'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error('Failed to parse error response:', e)
        }
        setError(errorMessage)
      }
    } catch (err) {
      console.error('Error creating project:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      type: 'construction',
      clientName: '',
      contactPerson: '',
      totalBudget: 100000,
      startDate: new Date().toISOString().split('T')[0],
      estimatedEndDate: '',
      status: 'planning'
    })
    setError('')
    onClose()
  }

  // Set default end date to 3 months from start date
  const handleStartDateChange = (startDate: string) => {
    setFormData({ ...formData, startDate })
    if (!formData.estimatedEndDate) {
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 3)
      setFormData(prev => ({ ...prev, startDate, estimatedEndDate: endDate.toISOString().split('T')[0] }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter project name"
                  autoFocus
                />
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter project description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter contact person"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated End Date *
                </label>
                <input
                  type="date"
                  value={formData.estimatedEndDate}
                  onChange={(e) => setFormData({ ...formData, estimatedEndDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Budget (INR) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
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
                <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}