# 🏗️ MongoDB Schema Architecture Plan
## InduEngicons Comprehensive Accounting System

**Date:** September 23, 2025  
**Goal:** Design a robust, scalable MongoDB schema that supports full CRUD accounting operations with proper relationships and validation

---

## 📋 Requirements Analysis

### **Core Entities Identified:**
1. **Projects** - Engineering projects with budgets and timelines
2. **Transactions** - Income and expense records
3. **Transaction Categories** - Classification for business operations
4. **Expense Categories** - Specific expense classifications
5. **Allocations** - Budget allocations between projects
6. **Users** - Admin and user management (future-ready)
7. **Companies/Clients** - Client relationship management
8. **Vendors** - Supplier and contractor management

### **Business Requirements:**
- Full CRUD operations on all entities
- Proper audit trails and versioning
- Flexible schema for business growth
- Strong data validation and relationships
- Performance optimization for reporting
- Multi-project financial tracking
- Real-time financial reporting

---

## 🎯 MongoDB Schema Design

### **1. Users Collection**
```typescript
interface IUser extends Document {
  _id: ObjectId
  username: string           // Unique username
  email: string             // Unique email
  password: string          // Hashed password
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'accountant' | 'viewer'
  permissions: {
    projects: 'read' | 'write' | 'admin'
    transactions: 'read' | 'write' | 'admin'
    reports: 'read' | 'admin'
    settings: 'read' | 'admin'
  }
  profile: {
    phone?: string
    department?: string
    employeeId?: string
    avatar?: string
  }
  preferences: {
    currency: string          // Default INR
    dateFormat: string
    timezone: string
  }
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
```

### **2. Companies Collection (Clients)**
```typescript
interface ICompany extends Document {
  _id: ObjectId
  name: string              // Company name
  type: 'client' | 'vendor' | 'partner'
  registration: {
    gst?: string            // GST number
    pan?: string            // PAN number
    cin?: string            // Corporate identification
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
    paymentTerms?: string    // "30 days", "COD", etc.
    bankDetails?: {
      accountName: string
      accountNumber: string
      bankName: string
      ifsc: string
      branch: string
    }
  }
  projects: [ObjectId]      // References to Project documents
  status: 'active' | 'inactive'
  tags: [string]            // Flexible tagging
  metadata: any             // Flexible additional data
  createdAt: Date
  updatedAt: Date
}
```

### **3. Projects Collection**
```typescript
interface IProject extends Document {
  _id: ObjectId
  name: string              // Project name
  code: string              // Unique project code (AUTO-GENERATED)
  description?: string
  type: 'construction' | 'consulting' | 'design' | 'maintenance' | 'other'
  
  // Client and stakeholder information
  client: {
    id: ObjectId            // Reference to Company
    name: string            // Denormalized for performance
    contactPerson: string
  }
  
  // Project timeline and status
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
  
  // Financial planning
  budget: {
    totalBudget: number
    allocatedBudget: number
    spentAmount: number      // Calculated field
    remainingBudget: number  // Calculated field
    currency: string
    breakdown: {
      materials: number
      labor: number
      equipment: number
      overhead: number
      profit: number
    }
  }
  
  // Project team and management
  team: {
    projectManager: ObjectId // Reference to User
    engineers: [ObjectId]    // References to Users
    contractors: [ObjectId] // References to Companies
  }
  
  // Location and specifications
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
  
  // Documents and compliance
  documents: [{
    type: 'contract' | 'permit' | 'drawing' | 'report' | 'other'
    name: string
    url: string
    uploadedBy: ObjectId
    uploadedAt: Date
  }]
  
  // Project status and workflow
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  // Audit and metadata
  audit: {
    createdBy: ObjectId
    createdAt: Date
    updatedBy: ObjectId
    updatedAt: Date
    version: number
  }
  
  // Flexible fields for future expansion
  customFields: any
  tags: [string]
  notes: [{
    content: string
    author: ObjectId
    createdAt: Date
  }]
}
```

### **4. Transaction Categories Collection**
```typescript
interface ITransactionCategory extends Document {
  _id: ObjectId
  name: string              // Category name
  description?: string
  type: 'revenue' | 'expense' | 'transfer' | 'adjustment'
  
  // Hierarchical structure support
  parentId?: ObjectId       // Reference to parent category
  children: [ObjectId]      // References to child categories
  level: number             // 0 = root, 1 = first level, etc.
  path: string              // Full path like "Revenue/Consulting/Engineering"
  
  // Financial classification
  accounting: {
    code: string            // Accounting code (e.g., "REV001", "EXP101")
    glAccount?: string      // General Ledger account mapping
    taxCategory?: 'taxable' | 'exempt' | 'zero-rated'
    defaultTaxRate?: number
  }
  
  // Business rules
  rules: {
    requiresProject: boolean        // Must be associated with project
    requiresApproval: boolean       // Needs approval workflow
    allowsRecurring: boolean        // Can be recurring transaction
    mandatoryFields: [string]       // Required fields for this category
  }
  
  // Display and organization
  display: {
    icon?: string           // Icon identifier
    color?: string          // Color code for UI
    sortOrder: number       // Display order
  }
  
  // Status and metadata
  isActive: boolean
  isSystemCategory: boolean // Cannot be deleted
  applicableProjectTypes: [string] // Which project types can use this
  
  // Statistics (calculated fields)
  stats: {
    transactionCount: number
    totalAmount: number
    lastUsed?: Date
  }
  
  createdAt: Date
  updatedAt: Date
}
```

### **5. Expense Categories Collection**
```typescript
interface IExpenseCategory extends Document {
  _id: ObjectId
  name: string
  description?: string
  type: 'material' | 'labor' | 'equipment' | 'transport' | 'utilities' | 'professional' | 'administrative' | 'other'
  
  // Hierarchical structure
  parentId?: ObjectId
  children: [ObjectId]
  level: number
  path: string
  
  // Cost center mapping
  costCenter: {
    code: string
    department?: string
    location?: string
  }
  
  // Approval and limits
  approval: {
    requiresApproval: boolean
    autoApprovalLimit?: number
    approvers: [ObjectId]    // Users who can approve
  }
  
  // Tax and compliance
  tax: {
    deductible: boolean      // Tax deductible
    gstApplicable: boolean   // GST applicable
    defaultGstRate?: number
    hsnCode?: string         // HSN/SAC code
  }
  
  // Vendor management
  preferredVendors: [{
    vendorId: ObjectId       // Reference to Company
    preference: number       // 1 = highest preference
    contractRate?: number
    notes?: string
  }]
  
  // Budget tracking
  budgetTracking: {
    enabled: boolean
    monthlyLimit?: number
    quarterlyLimit?: number
    yearlyLimit?: number
    alertThreshold?: number  // Percentage threshold for alerts
  }
  
  // Display properties
  display: {
    icon?: string
    color?: string
    sortOrder: number
  }
  
  isActive: boolean
  applicableProjectTypes: [string]
  
  // Usage statistics
  stats: {
    transactionCount: number
    totalSpent: number
    averageAmount: number
    lastUsed?: Date
  }
  
  createdAt: Date
  updatedAt: Date
}
```

### **6. Transactions Collection**
```typescript
interface ITransaction extends Document {
  _id: ObjectId
  transactionNumber: string // Auto-generated unique number
  type: 'income' | 'expense'
  amount: number
  description: string
  date: Date
  
  // Related entities with denormalized data for performance
  project?: {
    id: ObjectId
    name: string
    code: string
  }
  
  category: {
    id: ObjectId
    name: string
    type: string
    path: string             // Full category path
  }
  
  expenseCategory?: {
    id: ObjectId
    name: string
    type: string
    path: string
  }
  
  // Party information (client/vendor)
  party?: {
    id: ObjectId
    name: string
    type: 'client' | 'vendor' | 'employee' | 'other'
    gst?: string
    pan?: string
  }
  
  // Payment details
  payment: {
    method: 'cash' | 'bank' | 'card' | 'cheque' | 'upi' | 'neft' | 'rtgs' | 'other'
    reference?: string       // Transaction reference number
    bankAccount?: {
      id: ObjectId          // Reference to bank account
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
  
  // Invoice and documentation
  invoice: {
    number?: string
    date?: Date
    dueDate?: Date
    poNumber?: string        // Purchase order number
    status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  }
  
  // Tax calculations
  tax: {
    gstRate?: number
    gstAmount?: number
    tdsRate?: number
    tdsAmount?: number
    totalTaxAmount: number
    netAmount: number        // Amount after tax adjustments
  }
  
  // Attachments and documents
  attachments: [{
    type: 'invoice' | 'receipt' | 'contract' | 'voucher' | 'other'
    fileName: string
    url: string
    size: number
    uploadedBy: ObjectId
    uploadedAt: Date
  }]
  
  // Approval workflow
  workflow: {
    status: 'draft' | 'pending' | 'approved' | 'rejected'
    submittedBy?: ObjectId
    submittedAt?: Date
    approvedBy?: ObjectId
    approvedAt?: Date
    rejectedBy?: ObjectId
    rejectedAt?: Date
    rejectionReason?: string
    comments: [{
      by: ObjectId
      comment: string
      timestamp: Date
      type: 'comment' | 'approval' | 'rejection'
    }]
  }
  
  // Allocation tracking
  allocations: [{
    projectId: ObjectId
    projectName: string
    amount: number
    percentage: number
    notes?: string
  }]
  
  // Recurring transaction support
  recurring?: {
    isRecurring: boolean
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    interval: number         // Every X days/weeks/months
    endDate?: Date
    nextDue?: Date
    parentTransactionId?: ObjectId // Original template transaction
    occurrenceNumber?: number      // Which occurrence this is
  }
  
  // Location and context
  location?: {
    site?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
    recordedAt?: string      // Where the transaction was recorded
  }
  
  // Financial reconciliation
  reconciliation: {
    status: 'pending' | 'reconciled' | 'disputed'
    reconciledAt?: Date
    reconciledBy?: ObjectId
    bankStatementRef?: string
    discrepancy?: {
      amount: number
      reason: string
      resolvedAt?: Date
    }
  }
  
  // Audit trail
  audit: {
    createdBy: ObjectId
    createdAt: Date
    updatedBy?: ObjectId
    updatedAt?: Date
    version: number
    changelog: [{
      field: string
      oldValue: any
      newValue: any
      changedBy: ObjectId
      changedAt: Date
      reason?: string
    }]
  }
  
  // Flexible fields
  customFields: any
  tags: [string]
  notes: [{
    content: string
    author: ObjectId
    createdAt: Date
    type: 'internal' | 'customer' | 'vendor'
  }]
  
  // Status flags
  isDeleted: boolean        // Soft delete
  isCancelled: boolean
  isVoid: boolean
}
```

### **7. Allocations Collection**
```typescript
interface IAllocation extends Document {
  _id: ObjectId
  allocationNumber: string  // Auto-generated unique number
  
  // Source and destination
  sourceProject?: {
    id: ObjectId
    name: string
    code: string
  }
  targetProject: {
    id: ObjectId
    name: string
    code: string
  }
  
  // Allocation details
  amount: number
  percentage?: number       // If percentage-based allocation
  description: string
  date: Date
  effectiveDate?: Date      // When allocation takes effect
  
  // Allocation type and rules
  allocationType: 'budget_transfer' | 'cost_sharing' | 'overhead_allocation' | 'profit_sharing' | 'resource_allocation'
  
  basis: {
    type: 'fixed_amount' | 'percentage' | 'ratio' | 'formula'
    formula?: string        // For complex calculations
    baseAmount?: number     // Base amount for percentage calculations
  }
  
  // Reference transaction or event
  sourceReference?: {
    type: 'transaction' | 'budget' | 'contract' | 'milestone'
    id: ObjectId
    description: string
  }
  
  // Approval workflow
  approval: {
    status: 'draft' | 'pending' | 'approved' | 'rejected'
    requestedBy: ObjectId
    requestedAt: Date
    approvedBy?: ObjectId
    approvedAt?: Date
    approvalNotes?: string
    requiredApprovers: [ObjectId]
    actualApprovers: [{
      userId: ObjectId
      approvedAt: Date
      notes?: string
    }]
  }
  
  // Financial impact tracking
  impact: {
    sourceProjectImpact: number    // Negative impact on source
    targetProjectImpact: number    // Positive impact on target
    overheadImpact?: number        // Impact on overhead allocation
    taxImpact?: number             // Tax implications
  }
  
  // Recurring allocation support
  recurring?: {
    isRecurring: boolean
    frequency: 'monthly' | 'quarterly' | 'yearly'
    nextAllocation?: Date
    endDate?: Date
    parentAllocationId?: ObjectId
  }
  
  // Reversal support
  reversal?: {
    isReversed: boolean
    reversedAt?: Date
    reversedBy?: ObjectId
    reversalReason?: string
    reversalTransactionId?: ObjectId
  }
  
  // Audit trail
  audit: {
    createdBy: ObjectId
    createdAt: Date
    updatedBy?: ObjectId
    updatedAt?: Date
    version: number
  }
  
  // Status and metadata
  status: 'active' | 'cancelled' | 'completed'
  metadata: any
  tags: [string]
}
```

### **8. Bank Accounts Collection**
```typescript
interface IBankAccount extends Document {
  _id: ObjectId
  accountName: string
  accountNumber: string
  bankName: string
  branchName: string
  ifscCode: string
  accountType: 'savings' | 'current' | 'od' | 'fixed_deposit'
  
  // Account holder details
  accountHolder: {
    name: string
    type: 'company' | 'individual'
    pan?: string
    gstin?: string
  }
  
  // Balance tracking
  balance: {
    currentBalance: number
    availableBalance: number
    lastUpdated: Date
    currency: string
  }
  
  // Bank integration
  integration: {
    isConnected: boolean
    provider?: string       // Bank API provider
    lastSync?: Date
    syncEnabled: boolean
  }
  
  // Limits and features
  limits: {
    dailyTransactionLimit?: number
    monthlyTransactionLimit?: number
    overdraftLimit?: number
  }
  
  isActive: boolean
  isPrimary: boolean        // Primary account for the company
  
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔗 Relationships and Indexing Strategy

### **Primary Relationships:**
```typescript
// Project → Company (client)
Project.client.id → Company._id

// Transaction → Project
Transaction.project.id → Project._id

// Transaction → Category
Transaction.category.id → TransactionCategory._id
Transaction.expenseCategory.id → ExpenseCategory._id

// Transaction → Company (party)
Transaction.party.id → Company._id

// Allocation → Projects
Allocation.sourceProject.id → Project._id
Allocation.targetProject.id → Project._id

// All entities → User (audit trail)
*.audit.createdBy → User._id
*.audit.updatedBy → User._id
```

### **MongoDB Indexes:**
```javascript
// Performance indexes
db.transactions.createIndex({ "date": -1, "type": 1 })
db.transactions.createIndex({ "project.id": 1, "date": -1 })
db.transactions.createIndex({ "category.id": 1 })
db.transactions.createIndex({ "transactionNumber": 1 }, { unique: true })
db.transactions.createIndex({ "invoice.number": 1 })
db.transactions.createIndex({ "workflow.status": 1 })

db.projects.createIndex({ "code": 1 }, { unique: true })
db.projects.createIndex({ "client.id": 1 })
db.projects.createIndex({ "status": 1, "timeline.startDate": -1 })
db.projects.createIndex({ "team.projectManager": 1 })

db.companies.createIndex({ "name": 1 })
db.companies.createIndex({ "registration.gst": 1 }, { sparse: true })
db.companies.createIndex({ "type": 1, "status": 1 })

// Text search indexes
db.transactions.createIndex({ "description": "text", "invoice.number": "text" })
db.projects.createIndex({ "name": "text", "description": "text" })
db.companies.createIndex({ "name": "text" })

// Compound indexes for complex queries
db.transactions.createIndex({ 
  "type": 1, 
  "workflow.status": 1, 
  "date": -1 
})
```

---

## 🎯 Data Validation Rules

### **Schema Validation (MongoDB Level):**
```javascript
// Transaction validation
db.createCollection("transactions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["transactionNumber", "type", "amount", "description", "date", "category"],
      properties: {
        amount: {
          bsonType: "number",
          minimum: 0.01,
          description: "Amount must be a positive number"
        },
        type: {
          enum: ["income", "expense"],
          description: "Type must be income or expense"
        },
        date: {
          bsonType: "date",
          description: "Valid date required"
        }
      }
    }
  }
})
```

### **Application Level Validation (Mongoose):**
- Email format validation for users and companies
- Phone number format validation
- GST number format validation (Indian format)
- PAN number format validation
- Amount precision (2 decimal places)
- Date range validations (no future dates for certain transaction types)
- Conditional field requirements based on transaction type

---

## 📊 Performance Optimization Strategy

### **1. Data Denormalization:**
- Store frequently accessed data (names, codes) in related documents
- Pre-calculate totals and balances where appropriate
- Maintain aggregated statistics in parent documents

### **2. Aggregation Pipelines:**
```javascript
// Project financial summary
const projectSummary = [
  {
    $match: { "project.id": projectId }
  },
  {
    $group: {
      _id: "$type",
      total: { $sum: "$amount" },
      count: { $sum: 1 },
      avgAmount: { $avg: "$amount" }
    }
  }
]

// Monthly expense breakdown
const monthlyExpenses = [
  {
    $match: {
      type: "expense",
      date: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$date" },
        month: { $month: "$date" },
        category: "$expenseCategory.name"
      },
      total: { $sum: "$amount" },
      count: { $sum: 1 }
    }
  }
]
```

### **3. Caching Strategy:**
- Redis for frequently accessed aggregations
- Cache project summaries, category totals
- Cache user permissions and preferences
- Implement cache invalidation on data updates

---

## 🔄 Migration and Seeding Strategy

### **1. Database Initialization:**
```javascript
// Create default admin user
// Create system categories (non-deletable)
// Create default expense categories
// Set up initial company profile
// Configure default settings
```

### **2. Development Seed Data:**
```javascript
// Sample projects with realistic data
// Sample transactions covering all scenarios
// Sample companies (clients/vendors)
// Sample allocations
// Sample users with different roles
```

---

## 🛡️ Security and Audit

### **1. Data Security:**
- Field-level encryption for sensitive data (bank details, PAN)
- Role-based access control (RBAC)
- Audit trail for all CRUD operations
- Soft delete with retention policies

### **2. Compliance:**
- GST compliance data structure
- TDS calculation support
- Financial year-based reporting
- Backup and retention policies

---

## 🚀 Implementation Priority

### **Phase 1: Core Entities (High Priority)**
1. Users and authentication
2. Companies (basic structure)
3. Projects (essential fields)
4. Transaction Categories
5. Expense Categories

### **Phase 2: Financial Operations (High Priority)**
1. Transactions (core fields)
2. Basic allocations
3. Payment methods
4. Basic reporting

### **Phase 3: Advanced Features (Medium Priority)**
1. Approval workflows
2. Recurring transactions
3. Advanced allocations
4. Bank account management

### **Phase 4: Integration & Enhancement (Low Priority)**
1. Document management
2. Advanced reporting
3. Mobile optimization
4. Third-party integrations

---

**Total Implementation Estimate:** 6-8 hours for core functionality  
**Recommended Approach:** Start with minimal viable schema, iterate and expand

---

*This architecture provides a solid foundation for a professional accounting system that can scale with your business needs while maintaining data integrity and performance.*