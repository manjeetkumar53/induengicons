#!/usr/bin/env node
/**
 * MongoDB Seed Data Script
 * Creates initial data for development and testing
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Define simplified schemas for seeding (without TypeScript)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'accountant', 'viewer'], default: 'viewer' },
  permissions: {
    projects: { type: String, enum: ['read', 'write', 'admin'], default: 'read' },
    transactions: { type: String, enum: ['read', 'write', 'admin'], default: 'read' },
    reports: { type: String, enum: ['read', 'admin'], default: 'read' },
    settings: { type: String, enum: ['read', 'admin'], default: 'read' }
  },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' }
}, { timestamps: true })

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['client', 'vendor', 'partner'], required: true },
  registration: {
    gst: String,
    pan: String,
    registeredAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    }
  },
  contact: {
    primaryContact: {
      name: String,
      designation: String,
      email: String,
      phone: String
    }
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true })

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,
  type: { type: String, enum: ['construction', 'consulting', 'design', 'maintenance', 'other'], default: 'construction' },
  client: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    contactPerson: { type: String, required: true }
  },
  timeline: {
    startDate: { type: Date, required: true },
    estimatedEndDate: Date
  },
  budget: {
    totalBudget: { type: Number, required: true, min: 0 },
    allocatedBudget: { type: Number, default: 0 },
    spentAmount: { type: Number, default: 0 },
    remainingBudget: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  team: {
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  location: {
    site: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    }
  },
  status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'], default: 'planning' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  audit: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 }
  }
}, { timestamps: true })

const transactionCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['revenue', 'expense', 'transfer', 'adjustment'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransactionCategory' },
  level: { type: Number, default: 0 },
  path: { type: String, required: true },
  accounting: {
    code: { type: String, required: true, unique: true },
    taxCategory: { type: String, enum: ['taxable', 'exempt', 'zero-rated'], default: 'taxable' }
  },
  display: {
    icon: String,
    color: String,
    sortOrder: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  isSystemCategory: { type: Boolean, default: true }
}, { timestamps: true })

const expenseCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['material', 'labor', 'equipment', 'transport', 'utilities', 'professional', 'administrative', 'other'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory' },
  level: { type: Number, default: 0 },
  path: { type: String, required: true },
  costCenter: {
    code: { type: String, required: true },
    department: String
  },
  display: {
    icon: String,
    color: String,
    sortOrder: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Create models
const User = mongoose.model('User', userSchema)
const Company = mongoose.model('Company', companySchema)
const Project = mongoose.model('Project', projectSchema)
const TransactionCategory = mongoose.model('TransactionCategory', transactionCategorySchema)
const ExpenseCategory = mongoose.model('ExpenseCategory', expenseCategorySchema)

// Seed data
async function seedDatabase() {
  try {
    console.log('🌱 Starting MongoDB seeding...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Company.deleteMany({})
    await Project.deleteMany({})
    await TransactionCategory.deleteMany({})
    await ExpenseCategory.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@indueng.com',
      password: 'admin123', // In production, this would be hashed
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      permissions: {
        projects: 'admin',
        transactions: 'admin',
        reports: 'admin',
        settings: 'admin'
      }
    })
    console.log('👤 Created admin user')

    // Create sample companies
    const companies = await Company.create([
      {
        name: 'Tech Solutions Pvt Ltd',
        type: 'client',
        registration: {
          gst: '27AABCT1332L1Z1',
          pan: 'AABCT1332L',
          registeredAddress: {
            street: '123 Tech Park',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India'
          }
        },
        contact: {
          primaryContact: {
            name: 'Rahul Sharma',
            designation: 'Project Manager',
            email: 'rahul@techsolutions.com',
            phone: '9876543210'
          }
        }
      },
      {
        name: 'BuildMart Suppliers',
        type: 'vendor',
        registration: {
          gst: '27DEFGH4567M1Z2',
          pan: 'DEFGH4567M',
          registeredAddress: {
            street: '456 Supply Chain Road',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001',
            country: 'India'
          }
        },
        contact: {
          primaryContact: {
            name: 'Priya Patel',
            designation: 'Sales Manager',
            email: 'priya@buildmart.com',
            phone: '9876543211'
          }
        }
      }
    ])
    console.log('🏢 Created sample companies')

    // Create transaction categories
    const transactionCategories = await TransactionCategory.create([
      {
        name: 'Project Revenue',
        description: 'Income from project deliverables',
        type: 'revenue',
        path: 'revenue',
        level: 0,
        accounting: { code: 'REV001', taxCategory: 'taxable' },
        display: { icon: '💰', color: '#4CAF50', sortOrder: 1 },
        isSystemCategory: true
      },
      {
        name: 'Consulting Revenue',
        description: 'Income from consulting services',
        type: 'revenue',
        path: 'revenue',
        level: 0,
        accounting: { code: 'REV002', taxCategory: 'taxable' },
        display: { icon: '🎯', color: '#2196F3', sortOrder: 2 },
        isSystemCategory: true
      },
      {
        name: 'Project Expenses',
        description: 'Direct project costs',
        type: 'expense',
        path: 'expense',
        level: 0,
        accounting: { code: 'EXP001', taxCategory: 'taxable' },
        display: { icon: '📊', color: '#FF9800', sortOrder: 3 },
        isSystemCategory: true
      },
      {
        name: 'Administrative Expenses',
        description: 'Office and administrative costs',
        type: 'expense',
        path: 'expense',
        level: 0,
        accounting: { code: 'EXP002', taxCategory: 'taxable' },
        display: { icon: '🏢', color: '#9C27B0', sortOrder: 4 },
        isSystemCategory: true
      }
    ])
    console.log('📂 Created transaction categories')

    // Create expense categories
    const expenseCategories = await ExpenseCategory.create([
      {
        name: 'Raw Materials',
        description: 'Construction materials and supplies',
        type: 'material',
        path: 'material',
        level: 0,
        costCenter: { code: 'MAT001', department: 'Operations' },
        display: { icon: '🧱', color: '#795548', sortOrder: 1 }
      },
      {
        name: 'Labor Costs',
        description: 'Worker wages and contractor payments',
        type: 'labor',
        path: 'labor',
        level: 0,
        costCenter: { code: 'LAB001', department: 'Operations' },
        display: { icon: '👷', color: '#607D8B', sortOrder: 2 }
      },
      {
        name: 'Equipment Rental',
        description: 'Machinery and equipment rental costs',
        type: 'equipment',
        path: 'equipment',
        level: 0,
        costCenter: { code: 'EQP001', department: 'Operations' },
        display: { icon: '🚜', color: '#FF5722', sortOrder: 3 }
      },
      {
        name: 'Transportation',
        description: 'Vehicle and logistics costs',
        type: 'transport',
        path: 'transport',
        level: 0,
        costCenter: { code: 'TRN001', department: 'Operations' },
        display: { icon: '🚛', color: '#3F51B5', sortOrder: 4 }
      },
      {
        name: 'Office Supplies',
        description: 'Stationery and office equipment',
        type: 'administrative',
        path: 'administrative',
        level: 0,
        costCenter: { code: 'ADM001', department: 'Administration' },
        display: { icon: '📎', color: '#009688', sortOrder: 5 }
      }
    ])
    console.log('💼 Created expense categories')

    // Create sample project
    const sampleProject = await Project.create({
      name: 'Tech Office Complex Construction',
      code: 'PROJ001',
      description: 'Construction of a modern office complex for Tech Solutions',
      type: 'construction',
      client: {
        id: companies[0]._id,
        name: companies[0].name,
        contactPerson: 'Rahul Sharma'
      },
      timeline: {
        startDate: new Date('2024-01-15'),
        estimatedEndDate: new Date('2024-12-31')
      },
      budget: {
        totalBudget: 5000000,
        allocatedBudget: 0,
        spentAmount: 0,
        remainingBudget: 5000000,
        currency: 'INR'
      },
      team: {
        projectManager: adminUser._id
      },
      location: {
        site: 'Tech Park Phase 2',
        address: {
          street: '789 Construction Site',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002'
        }
      },
      status: 'active',
      priority: 'high',
      audit: {
        createdBy: adminUser._id,
        createdAt: new Date(),
        version: 1
      }
    })
    console.log('🏗️  Created sample project')

    console.log('\\n🎉 Seeding completed successfully!')
    console.log('\\n📊 Summary:')
    console.log(`   Users: 1 (admin)`)
    console.log(`   Companies: ${companies.length}`)
    console.log(`   Projects: 1`)
    console.log(`   Transaction Categories: ${transactionCategories.length}`)
    console.log(`   Expense Categories: ${expenseCategories.length}`)
    console.log('\\n🔑 Login credentials:')
    console.log('   Username: admin')
    console.log('   Password: admin123')
    console.log('   Email: admin@indueng.com')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\\n🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }