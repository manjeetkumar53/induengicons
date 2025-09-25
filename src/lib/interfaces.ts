import { Document, Types } from 'mongoose'

// ==================== USER INTERFACES ====================

export interface IUser extends Document {
  _id: Types.ObjectId
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'accountant' | 'viewer'
  permissions: {
    projects: 'none' | 'read' | 'write' | 'admin'
    transactions: 'none' | 'read' | 'write' | 'admin'
    reports: 'none' | 'read' | 'write' | 'admin'
    settings: 'none' | 'read' | 'write' | 'admin'
  }
  profile: {
    phone?: string
    department?: string
    employeeId?: string
    avatar?: string
  }
  preferences: {
    currency: string
    dateFormat: string
    timezone: string
  }
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// ==================== COMPANY INTERFACES ====================

export interface ICompany extends Document {
  _id: Types.ObjectId
  name: string
  type: 'client' | 'vendor' | 'partner'
  registration: {
    gst?: string
    pan?: string
    cin?: string
    registeredAddress: {
      street: string
      city: string
      state: string
      pincode: string
      country: string
    }
  }
  contact: {
    primaryContact: {
      name: string
      designation: string
      email: string
      phone: string
    }
    billingContact?: {
      name: string
      email: string
      phone: string
    }
  }
  financial: {
    creditLimit?: number
    paymentTerms?: string
    bankDetails?: {
      accountName: string
      accountNumber: string
      bankName: string
      ifsc: string
      branch: string
    }
  }
  projects: Types.ObjectId[]
  status: 'active' | 'inactive'
  tags: string[]
  metadata: any
  createdAt: Date
  updatedAt: Date
}

// ==================== PROJECT INTERFACES ====================

export interface IProject extends Document {
  _id: Types.ObjectId
  name: string
  code: string
  description?: string
  type: 'construction' | 'consulting' | 'design' | 'maintenance' | 'other'
  
  client: {
    id: Types.ObjectId
    name: string
    contactPerson: string
  }
  
  timeline: {
    startDate: Date
    estimatedEndDate?: Date
    actualEndDate?: Date
    milestones: [{
      name: string
      targetDate: Date
      completedDate?: Date
      status: 'pending' | 'completed' | 'delayed'
    }]
  }
  
  budget: {
    totalBudget: number
    allocatedBudget: number
    spentAmount: number
    remainingBudget: number
    currency: string
    breakdown: {
      materials: number
      labor: number
      equipment: number
      overhead: number
      profit: number
    }
  }
  
  team: {
    projectManager: Types.ObjectId
    engineers: Types.ObjectId[]
    contractors: Types.ObjectId[]
  }
  
  location: {
    site: string
    address: {
      street: string
      city: string
      state: string
      pincode: string
    }
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  
  documents: [{
    type: 'contract' | 'permit' | 'drawing' | 'report' | 'other'
    name: string
    url: string
    uploadedBy: Types.ObjectId
    uploadedAt: Date
  }]
  
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  audit: {
    createdBy: Types.ObjectId
    createdAt: Date
    updatedBy: Types.ObjectId
    updatedAt: Date
    version: number
  }
  
  customFields: any
  tags: string[]
  notes: [{
    content: string
    author: Types.ObjectId
    createdAt: Date
  }]
}

// ==================== CATEGORY INTERFACES ====================

export interface ITransactionCategory extends Document {
  _id: Types.ObjectId
  name: string
  description?: string
  type: 'revenue' | 'expense' | 'transfer' | 'adjustment'
  
  parentId?: Types.ObjectId
  children: Types.ObjectId[]
  level: number
  path: string
  
  accounting: {
    code: string
    glAccount?: string
    taxCategory?: 'taxable' | 'exempt' | 'zero-rated'
    defaultTaxRate?: number
  }
  
  rules: {
    requiresProject: boolean
    requiresApproval: boolean
    allowsRecurring: boolean
    mandatoryFields: string[]
  }
  
  display: {
    icon?: string
    color?: string
    sortOrder: number
  }
  
  isActive: boolean
  isSystemCategory: boolean
  applicableProjectTypes: string[]
  
  stats: {
    transactionCount: number
    totalAmount: number
    lastUsed?: Date
  }
  
  createdAt: Date
  updatedAt: Date
}

export interface IExpenseCategory extends Document {
  _id: Types.ObjectId
  name: string
  description?: string
  type: 'material' | 'labor' | 'equipment' | 'transport' | 'utilities' | 'professional' | 'administrative' | 'other'
  
  parentId?: Types.ObjectId
  children: Types.ObjectId[]
  level: number
  path: string
  
  costCenter: {
    code: string
    department?: string
    location?: string
  }
  
  approval: {
    requiresApproval: boolean
    autoApprovalLimit?: number
    approvers: Types.ObjectId[]
  }
  
  tax: {
    deductible: boolean
    gstApplicable: boolean
    defaultGstRate?: number
    hsnCode?: string
  }
  
  preferredVendors: [{
    vendorId: Types.ObjectId
    preference: number
    contractRate?: number
    notes?: string
  }]
  
  budgetTracking: {
    enabled: boolean
    monthlyLimit?: number
    quarterlyLimit?: number
    yearlyLimit?: number
    alertThreshold?: number
  }
  
  display: {
    icon?: string
    color?: string
    sortOrder: number
  }
  
  isActive: boolean
  applicableProjectTypes: string[]
  
  stats: {
    transactionCount: number
    totalSpent: number
    averageAmount: number
    lastUsed?: Date
  }
  
  createdAt: Date
  updatedAt: Date
}

// ==================== TRANSACTION INTERFACES ====================

export interface ITransaction extends Document {
  _id: Types.ObjectId
  transactionNumber: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: Date
  
  project?: {
    id: Types.ObjectId
    name: string
    code: string
  }
  
  category: {
    id: Types.ObjectId
    name: string
    type: string
    path: string
  }
  
  expenseCategory?: {
    id: Types.ObjectId
    name: string
    type: string
    path: string
  }
  
  party?: {
    id: Types.ObjectId
    name: string
    type: 'client' | 'vendor' | 'employee' | 'other'
    gst?: string
    pan?: string
  }
  
  payment: {
    method: 'cash' | 'bank' | 'card' | 'cheque' | 'upi' | 'neft' | 'rtgs' | 'other'
    reference?: string
    bankAccount?: {
      id: Types.ObjectId
      accountNumber: string
      bankName: string
    }
    chequeDetails?: {
      chequeNumber: string
      bankName: string
      chequeDate: Date
      clearanceDate?: Date
      status: 'issued' | 'cleared' | 'bounced' | 'cancelled'
    }
  }
  
  invoice: {
    number?: string
    date?: Date
    dueDate?: Date
    poNumber?: string
    status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  }
  
  tax: {
    gstRate?: number
    gstAmount?: number
    tdsRate?: number
    tdsAmount?: number
    totalTaxAmount: number
    netAmount: number
  }
  
  attachments: [{
    type: 'invoice' | 'receipt' | 'contract' | 'voucher' | 'other'
    fileName: string
    url: string
    size: number
    uploadedBy: Types.ObjectId
    uploadedAt: Date
  }]
  
  workflow: {
    status: 'draft' | 'pending' | 'approved' | 'rejected'
    submittedBy?: Types.ObjectId
    submittedAt?: Date
    approvedBy?: Types.ObjectId
    approvedAt?: Date
    rejectedBy?: Types.ObjectId
    rejectedAt?: Date
    rejectionReason?: string
    comments: [{
      by: Types.ObjectId
      comment: string
      timestamp: Date
      type: 'comment' | 'approval' | 'rejection'
    }]
  }
  
  allocations: [{
    projectId: Types.ObjectId
    projectName: string
    amount: number
    percentage: number
    notes?: string
  }]
  
  recurring?: {
    isRecurring: boolean
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    interval: number
    endDate?: Date
    nextDue?: Date
    parentTransactionId?: Types.ObjectId
    occurrenceNumber?: number
  }
  
  location?: {
    site?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
    recordedAt?: string
  }
  
  reconciliation: {
    status: 'pending' | 'reconciled' | 'disputed'
    reconciledAt?: Date
    reconciledBy?: Types.ObjectId
    bankStatementRef?: string
    discrepancy?: {
      amount: number
      reason: string
      resolvedAt?: Date
    }
  }
  
  audit: {
    createdBy: Types.ObjectId
    createdAt: Date
    updatedBy?: Types.ObjectId
    updatedAt?: Date
    version: number
    changelog: [{
      field: string
      oldValue: any
      newValue: any
      changedBy: Types.ObjectId
      changedAt: Date
      reason?: string
    }]
  }
  
  customFields: any
  tags: string[]
  notes: [{
    content: string
    author: Types.ObjectId
    createdAt: Date
    type: 'internal' | 'customer' | 'vendor'
  }]
  
  isDeleted: boolean
  isCancelled: boolean
  isVoid: boolean
}

// ==================== ALLOCATION INTERFACES ====================

export interface IAllocation extends Document {
  _id: Types.ObjectId
  allocationNumber: string
  
  sourceProject?: {
    id: Types.ObjectId
    name: string
    code: string
  }
  targetProject: {
    id: Types.ObjectId
    name: string
    code: string
  }
  
  amount: number
  percentage?: number
  description: string
  date: Date
  effectiveDate?: Date
  
  allocationType: 'budget_transfer' | 'cost_sharing' | 'overhead_allocation' | 'profit_sharing' | 'resource_allocation'
  
  basis: {
    type: 'fixed_amount' | 'percentage' | 'ratio' | 'formula'
    formula?: string
    baseAmount?: number
  }
  
  sourceReference?: {
    type: 'transaction' | 'budget' | 'contract' | 'milestone'
    id: Types.ObjectId
    description: string
  }
  
  approval: {
    status: 'draft' | 'pending' | 'approved' | 'rejected'
    requestedBy: Types.ObjectId
    requestedAt: Date
    approvedBy?: Types.ObjectId
    approvedAt?: Date
    approvalNotes?: string
    requiredApprovers: Types.ObjectId[]
    actualApprovers: [{
      userId: Types.ObjectId
      approvedAt: Date
      notes?: string
    }]
  }
  
  impact: {
    sourceProjectImpact: number
    targetProjectImpact: number
    overheadImpact?: number
    taxImpact?: number
  }
  
  recurring?: {
    isRecurring: boolean
    frequency: 'monthly' | 'quarterly' | 'yearly'
    nextAllocation?: Date
    endDate?: Date
    parentAllocationId?: Types.ObjectId
  }
  
  reversal?: {
    isReversed: boolean
    reversedAt?: Date
    reversedBy?: Types.ObjectId
    reversalReason?: string
    reversalTransactionId?: Types.ObjectId
  }
  
  audit: {
    createdBy: Types.ObjectId
    createdAt: Date
    updatedBy?: Types.ObjectId
    updatedAt?: Date
    version: number
  }
  
  status: 'active' | 'cancelled' | 'completed'
  metadata: any
  tags: string[]
}

export { Types }