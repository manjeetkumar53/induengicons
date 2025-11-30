import mongoose, { Schema, Types } from 'mongoose'
import {
  IUser,
  ICompany,
  IProject,
  ITransactionCategory,
  IExpenseCategory,
  ITransaction,
  IAllocation
} from './interfaces'

// ==================== USER SCHEMA ====================

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Exclude password by default in queries
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'accountant', 'viewer'],
    default: 'viewer'
  },
  permissions: {
    projects: {
      type: String,
      enum: ['none', 'read', 'write', 'admin'],
      default: 'read'
    },
    transactions: {
      type: String,
      enum: ['none', 'read', 'write', 'admin'],
      default: 'read'
    },
    reports: {
      type: String,
      enum: ['none', 'read', 'write', 'admin'],
      default: 'read'
    },
    settings: {
      type: String,
      enum: ['none', 'read', 'write', 'admin'],
      default: 'none'
    }
  },
  profile: {
    phone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid phone number']
    },
    department: String,
    employeeId: String,
    avatar: String
  },
  preferences: {
    currency: {
      type: String,
      default: 'INR'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: Date
}, {
  timestamps: true
})

// User indexes
// UserSchema.index({ username: 1 }) // Defined in schema
// UserSchema.index({ email: 1 }) // Defined in schema
UserSchema.index({ role: 1, status: 1 })

// ==================== COMPANY SCHEMA ====================

const CompanySchema = new Schema<ICompany>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['client', 'vendor', 'partner'],
    required: true
  },
  registration: {
    gst: {
      type: String,
      sparse: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format']
    },
    pan: {
      type: String,
      sparse: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
    },
    cin: String,
    registeredAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: {
        type: String,
        required: true,
        match: [/^[1-9][0-9]{5}$/, 'Invalid pincode']
      },
      country: { type: String, default: 'India' }
    }
  },
  contact: {
    primaryContact: {
      name: { type: String, required: true },
      designation: { type: String, required: true },
      email: {
        type: String,
        required: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
      },
      phone: {
        type: String,
        required: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid phone number']
      }
    },
    billingContact: {
      name: String,
      email: {
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
      },
      phone: {
        type: String,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid phone number']
      }
    }
  },
  financial: {
    creditLimit: {
      type: Number,
      min: 0
    },
    paymentTerms: String,
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      ifsc: {
        type: String,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code']
      },
      branch: String
    }
  },
  projects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  tags: [String],
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
})

// Company indexes
CompanySchema.index({ name: 1 })
CompanySchema.index({ type: 1, status: 1 })
// CompanySchema.index({ 'registration.gst': 1 }, { sparse: true }) // Defined in schema
// CompanySchema.index({ 'registration.pan': 1 }, { sparse: true }) // Defined in schema

// ==================== PROJECT SCHEMA ====================

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    maxlength: 20
  },
  description: {
    type: String,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['construction', 'consulting', 'design', 'maintenance', 'other'],
    default: 'construction'
  },

  client: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    contactPerson: {
      type: String,
      required: true
    }
  },

  timeline: {
    startDate: {
      type: Date,
      required: true
    },
    estimatedEndDate: Date,
    actualEndDate: Date,
    milestones: [{
      name: { type: String, required: true },
      targetDate: { type: Date, required: true },
      completedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'completed', 'delayed'],
        default: 'pending'
      }
    }]
  },

  budget: {
    totalBudget: {
      type: Number,
      required: true,
      min: 0
    },
    allocatedBudget: {
      type: Number,
      default: 0,
      min: 0
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    remainingBudget: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    breakdown: {
      materials: { type: Number, default: 0 },
      labor: { type: Number, default: 0 },
      equipment: { type: Number, default: 0 },
      overhead: { type: Number, default: 0 },
      profit: { type: Number, default: 0 }
    }
  },

  team: {
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    engineers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    contractors: [{
      type: Schema.Types.ObjectId,
      ref: 'Company'
    }]
  },

  location: {
    site: {
      type: String,
      required: true
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: {
        type: String,
        required: true,
        match: [/^[1-9][0-9]{5}$/, 'Invalid pincode']
      }
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },

  documents: [{
    type: {
      type: String,
      enum: ['contract', 'permit', 'drawing', 'report', 'other'],
      required: true
    },
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  audit: {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: Date,
    version: {
      type: Number,
      default: 1
    }
  },

  customFields: Schema.Types.Mixed,
  tags: [String],
  notes: [{
    content: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
})

// Project indexes
// ProjectSchema.index({ code: 1 }, { unique: true }) // Defined in schema
ProjectSchema.index({ 'client.id': 1 })
ProjectSchema.index({ status: 1, 'timeline.startDate': -1 })
ProjectSchema.index({ 'team.projectManager': 1 })
ProjectSchema.index({ name: 'text', description: 'text' })

// ==================== TRANSACTION CATEGORY SCHEMA ====================

const TransactionCategorySchema = new Schema<ITransactionCategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['revenue', 'expense', 'transfer', 'adjustment'],
    required: true
  },

  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'TransactionCategory'
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'TransactionCategory'
  }],
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  path: {
    type: String,
    required: true
  },

  accounting: {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    glAccount: String,
    taxCategory: {
      type: String,
      enum: ['taxable', 'exempt', 'zero-rated'],
      default: 'taxable'
    },
    defaultTaxRate: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  rules: {
    requiresProject: {
      type: Boolean,
      default: false
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    allowsRecurring: {
      type: Boolean,
      default: true
    },
    mandatoryFields: [String]
  },

  display: {
    icon: String,
    color: String,
    sortOrder: {
      type: Number,
      default: 0
    }
  },

  isActive: {
    type: Boolean,
    default: true
  },
  isSystemCategory: {
    type: Boolean,
    default: false
  },
  applicableProjectTypes: [String],

  stats: {
    transactionCount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    lastUsed: Date
  }
}, {
  timestamps: true
})

// Transaction Category indexes
// TransactionCategorySchema.index({ 'accounting.code': 1 }, { unique: true }) // Defined in schema
TransactionCategorySchema.index({ type: 1, isActive: 1 })
TransactionCategorySchema.index({ parentId: 1 })
TransactionCategorySchema.index({ level: 1, 'display.sortOrder': 1 })

// ==================== EXPENSE CATEGORY SCHEMA ====================

const ExpenseCategorySchema = new Schema<IExpenseCategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['material', 'labor', 'equipment', 'transport', 'utilities', 'professional', 'administrative', 'other'],
    required: true
  },

  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'ExpenseCategory'
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'ExpenseCategory'
  }],
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  path: {
    type: String,
    required: true
  },

  costCenter: {
    code: {
      type: String,
      required: true,
      uppercase: true
    },
    department: String,
    location: String
  },

  approval: {
    requiresApproval: {
      type: Boolean,
      default: false
    },
    autoApprovalLimit: {
      type: Number,
      min: 0
    },
    approvers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  tax: {
    deductible: {
      type: Boolean,
      default: true
    },
    gstApplicable: {
      type: Boolean,
      default: true
    },
    defaultGstRate: {
      type: Number,
      min: 0,
      max: 100
    },
    hsnCode: String
  },

  preferredVendors: [{
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    preference: {
      type: Number,
      min: 1,
      max: 10,
      default: 1
    },
    contractRate: {
      type: Number,
      min: 0
    },
    notes: String
  }],

  budgetTracking: {
    enabled: {
      type: Boolean,
      default: false
    },
    monthlyLimit: {
      type: Number,
      min: 0
    },
    quarterlyLimit: {
      type: Number,
      min: 0
    },
    yearlyLimit: {
      type: Number,
      min: 0
    },
    alertThreshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    }
  },

  display: {
    icon: String,
    color: String,
    sortOrder: {
      type: Number,
      default: 0
    }
  },

  isActive: {
    type: Boolean,
    default: true
  },
  applicableProjectTypes: [String],

  stats: {
    transactionCount: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    averageAmount: {
      type: Number,
      default: 0
    },
    lastUsed: Date
  }
}, {
  timestamps: true
})

// Expense Category indexes
ExpenseCategorySchema.index({ 'costCenter.code': 1 })
ExpenseCategorySchema.index({ type: 1, isActive: 1 })
ExpenseCategorySchema.index({ parentId: 1 })
ExpenseCategorySchema.index({ level: 1, 'display.sortOrder': 1 })

// ==================== SIMPLIFIED TRANSACTION SCHEMA ====================

const SimpleTransactionSchema = new Schema({
  transactionNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  date: {
    type: Date,
    required: true
  },

  // Simplified relationships
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  projectName: String,

  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'TransactionCategory'
  },
  categoryName: {
    type: String,
    required: true
  },

  expenseCategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'ExpenseCategory'
  },
  expenseCategoryName: String,

  // Payment details
  paymentMethod: {
    type: String,
    required: true
  },
  paymentReference: String,
  source: String, // For income: who paid, For expense: vendor/supplier

  // Invoice details
  invoiceNumber: String,
  receiptNumber: String,

  // Status and workflow
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'approved'
  },

  // Audit trail
  createdBy: {
    type: String,
    default: 'system'
  },

  // Flexible fields
  notes: String,
  tags: [String],
  metadata: Schema.Types.Mixed,

  // Vector search embedding (384 dimensions)
  descriptionEmbedding: {
    type: [Number],
    select: false // Don't return in normal queries to save bandwidth
  }
}, {
  timestamps: true
})

// Transaction indexes
// SimpleTransactionSchema.index({ transactionNumber: 1 }, { unique: true }) // Defined in schema
SimpleTransactionSchema.index({ date: -1, type: 1 })
SimpleTransactionSchema.index({ projectId: 1, date: -1 })
SimpleTransactionSchema.index({ categoryId: 1 })
SimpleTransactionSchema.index({ status: 1 })
SimpleTransactionSchema.index({ description: 'text' })

// Auto-generate transaction number
SimpleTransactionSchema.pre('save', async function (next) {
  if (this.isNew && !this.transactionNumber) {
    const count = await mongoose.models.Transaction.countDocuments()
    const year = new Date().getFullYear()
    this.transactionNumber = `TXN${year}${String(count + 1).padStart(6, '0')}`
  }
  next()
})

// ==================== SIMPLIFIED ALLOCATION SCHEMA ====================

const SimpleAllocationSchema = new Schema({
  allocationNumber: {
    type: String,
    required: true,
    unique: true
  },

  sourceProjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  sourceProjectName: String,

  targetProjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  targetProjectName: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  date: {
    type: Date,
    required: true
  },

  allocationType: {
    type: String,
    enum: ['budget_transfer', 'cost_sharing', 'overhead_allocation', 'profit_sharing'],
    default: 'budget_transfer'
  },

  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'approved'
  },

  createdBy: {
    type: String,
    default: 'system'
  },

  notes: String,
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
})

// Allocation indexes
// SimpleAllocationSchema.index({ allocationNumber: 1 }, { unique: true }) // Defined in schema
SimpleAllocationSchema.index({ targetProjectId: 1, date: -1 })
SimpleAllocationSchema.index({ sourceProjectId: 1, date: -1 })
SimpleAllocationSchema.index({ status: 1 })

// Auto-generate allocation number
SimpleAllocationSchema.pre('save', async function (next) {
  if (this.isNew && !this.allocationNumber) {
    const count = await mongoose.models.Allocation.countDocuments()
    const year = new Date().getFullYear()
    this.allocationNumber = `ALLOC${year}${String(count + 1).padStart(4, '0')}`
  }
  next()
})

// ==================== MODELS EXPORT ====================

// Clear existing models to avoid compilation issues
const models = ['User', 'Company', 'Project', 'TransactionCategory', 'ExpenseCategory', 'Transaction', 'Allocation']
models.forEach(modelName => {
  if (mongoose.models[modelName]) {
    delete mongoose.models[modelName]
  }
})

export const User = mongoose.model<IUser>('User', UserSchema)
export const Company = mongoose.model<ICompany>('Company', CompanySchema)
export const Project = mongoose.model<IProject>('Project', ProjectSchema)
export const TransactionCategory = mongoose.model<ITransactionCategory>('TransactionCategory', TransactionCategorySchema)
export const ExpenseCategory = mongoose.model<IExpenseCategory>('ExpenseCategory', ExpenseCategorySchema)
export const Transaction = mongoose.model('Transaction', SimpleTransactionSchema)
export const Allocation = mongoose.model('Allocation', SimpleAllocationSchema)

export { Types }