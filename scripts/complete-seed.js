/**
 * Complete MongoDB Seed Script
 * Creates initial data for the entire application including:
 * - Admin users
 * - Sample projects
 * - Transaction and expense categories
 * - Sample transactions
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Environment setup
const MONGODB_URI = process.env.MONGODB_URI
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456'
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || 'Manager@123'
const ACCOUNTANT_PASSWORD = process.env.ACCOUNTANT_PASSWORD || 'Accountant@123'

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables')
}

// Define schemas directly in the seed script
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'accountant', 'viewer'], default: 'viewer' },
  permissions: {
    projects: { type: String, enum: ['none', 'read', 'write', 'admin'], default: 'read' },
    transactions: { type: String, enum: ['none', 'read', 'write', 'admin'], default: 'read' },
    reports: { type: String, enum: ['none', 'read', 'write', 'admin'], default: 'read' },
    settings: { type: String, enum: ['none', 'read', 'write', 'admin'], default: 'none' }
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
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    name: String,
    contactPerson: String
  },
  timeline: {
    startDate: { type: Date, required: true },
    estimatedEndDate: Date
  },
  budget: {
    totalBudget: { type: Number, default: 0 },
    allocatedBudget: { type: Number, default: 0 },
    spentAmount: { type: Number, default: 0 },
    remainingBudget: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'], default: 'planning' }
}, { timestamps: true })

const transactionCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['revenue', 'expense', 'transfer', 'adjustment'], required: true },
  path: { type: String, required: true },
  level: { type: Number, default: 0 },
  accounting: {
    code: { type: String, required: true, unique: true },
    taxCategory: { type: String, enum: ['taxable', 'exempt', 'zero-rated'], default: 'taxable' }
  },
  isActive: { type: Boolean, default: true },
  isSystemCategory: { type: Boolean, default: false }
}, { timestamps: true })

const expenseCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['material', 'labor', 'equipment', 'transport', 'utilities', 'professional', 'administrative', 'other'], required: true },
  path: { type: String, required: true },
  level: { type: Number, default: 0 },
  costCenter: {
    code: { type: String, required: true }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

const transactionSchema = new mongoose.Schema({
  transactionNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  projectName: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransactionCategory', required: true },
  categoryName: String,
  expenseCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory' },
  expenseCategoryName: String,
  paymentMethod: { type: String, enum: ['cash', 'bank', 'card', 'cheque', 'upi', 'neft', 'rtgs', 'other'], required: true },
  source: String,
  receiptNumber: String,
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'approved' },
  createdBy: { type: String, default: 'system' }
}, { timestamps: true })

// Create models
const User = mongoose.models.User || mongoose.model('User', userSchema)
const Company = mongoose.models.Company || mongoose.model('Company', companySchema)
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)
const TransactionCategory = mongoose.models.TransactionCategory || mongoose.model('TransactionCategory', transactionCategorySchema)
const ExpenseCategory = mongoose.models.ExpenseCategory || mongoose.model('ExpenseCategory', expenseCategorySchema)
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)

async function connectToDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
    console.log('✅ Connected to MongoDB successfully')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw error
  }
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...')
  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Project.deleteMany({}),
    TransactionCategory.deleteMany({}),
    ExpenseCategory.deleteMany({}),
    Transaction.deleteMany({})
  ])
  console.log('✅ Database cleared')
}

async function seedUsers() {
  console.log('👥 Creating users...')

  const users = [
    {
      username: 'admin',
      email: 'admin@induengicons.com',
      password: await bcrypt.hash(ADMIN_PASSWORD, 12),
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      permissions: {
        projects: 'admin',
        transactions: 'admin',
        reports: 'admin',
        settings: 'admin'
      }
    },
    {
      username: 'manager',
      email: 'manager@induengicons.com',
      password: await bcrypt.hash(MANAGER_PASSWORD, 12),
      firstName: 'Project',
      lastName: 'Manager',
      role: 'manager',
      permissions: {
        projects: 'admin',
        transactions: 'write',
        reports: 'write',
        settings: 'read'
      }
    },
    {
      username: 'accountant',
      email: 'accountant@induengicons.com',
      password: await bcrypt.hash(ACCOUNTANT_PASSWORD, 12),
      firstName: 'Senior',
      lastName: 'Accountant',
      role: 'accountant',
      permissions: {
        projects: 'read',
        transactions: 'admin',
        reports: 'admin',
        settings: 'read'
      }
    }
  ]

  const createdUsers = await User.insertMany(users)
  console.log(`✅ Created ${createdUsers.length} users`)
  return createdUsers
}

async function seedCompanies() {
  console.log('🏢 Creating companies...')

  const companies = [
    {
      name: 'ABC Construction Ltd',
      type: 'client',
      registration: {
        gst: '29ABCDE1234F1Z5',
        pan: 'ABCDE1234F',
        registeredAddress: {
          street: '123 Business District',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        }
      },
      contact: {
        primaryContact: {
          name: 'Rajesh Kumar',
          designation: 'Project Director',
          email: 'rajesh@abcconstruction.com',
          phone: '9876543210'
        }
      }
    },
    {
      name: 'XYZ Materials Pvt Ltd',
      type: 'vendor',
      registration: {
        gst: '27XYZAB5678G1Z2',
        pan: 'XYZAB5678G',
        registeredAddress: {
          street: '456 Industrial Area',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          country: 'India'
        }
      },
      contact: {
        primaryContact: {
          name: 'Priya Sharma',
          designation: 'Sales Manager',
          email: 'priya@xyzmaterials.com',
          phone: '9876543211'
        }
      }
    }
  ]

  const createdCompanies = await Company.insertMany(companies)
  console.log(`✅ Created ${createdCompanies.length} companies`)
  return createdCompanies
}

async function seedProjects(companies) {
  console.log('🏗️ Creating projects...')

  const projects = [
    {
      name: 'Residential Complex Phase 1',
      code: 'RCP001',
      description: 'Construction of 50 residential units in Phase 1',
      type: 'construction',
      client: {
        id: companies[0]._id,
        name: companies[0].name,
        contactPerson: 'Rajesh Kumar'
      },
      timeline: {
        startDate: new Date('2024-01-15'),
        estimatedEndDate: new Date('2024-12-31')
      },
      budget: {
        totalBudget: 5000000,
        allocatedBudget: 5000000,
        spentAmount: 0,
        remainingBudget: 5000000,
        currency: 'INR'
      },
      status: 'active'
    },
    {
      name: 'Office Complex Design',
      code: 'OCD002',
      description: 'Architectural design for modern office complex',
      type: 'design',
      client: {
        id: companies[0]._id,
        name: companies[0].name,
        contactPerson: 'Rajesh Kumar'
      },
      timeline: {
        startDate: new Date('2024-02-01'),
        estimatedEndDate: new Date('2024-06-30')
      },
      budget: {
        totalBudget: 1500000,
        allocatedBudget: 1500000,
        spentAmount: 0,
        remainingBudget: 1500000,
        currency: 'INR'
      },
      status: 'planning'
    }
  ]

  const createdProjects = await Project.insertMany(projects)
  console.log(`✅ Created ${createdProjects.length} projects`)
  return createdProjects
}

async function seedTransactionCategories() {
  console.log('📊 Creating transaction categories...')

  const categories = [
    {
      name: 'Project Revenue',
      description: 'Revenue from construction projects',
      type: 'revenue',
      path: 'project-revenue',
      level: 0,
      accounting: {
        code: 'REV001',
        taxCategory: 'taxable'
      },
      isActive: true,
      isSystemCategory: false
    },
    {
      name: 'Consulting Revenue',
      description: 'Revenue from consulting services',
      type: 'revenue',
      path: 'consulting-revenue',
      level: 0,
      accounting: {
        code: 'REV002',
        taxCategory: 'taxable'
      },
      isActive: true,
      isSystemCategory: false
    },
    {
      name: 'Project Expenses',
      description: 'Direct project expenses',
      type: 'expense',
      path: 'project-expenses',
      level: 0,
      accounting: {
        code: 'EXP001',
        taxCategory: 'taxable'
      },
      isActive: true,
      isSystemCategory: false
    },
    {
      name: 'Administrative Expenses',
      description: 'General administrative expenses',
      type: 'expense',
      path: 'admin-expenses',
      level: 0,
      accounting: {
        code: 'EXP002',
        taxCategory: 'taxable'
      },
      isActive: true,
      isSystemCategory: false
    }
  ]

  const createdCategories = await TransactionCategory.insertMany(categories)
  console.log(`✅ Created ${createdCategories.length} transaction categories`)
  return createdCategories
}

async function seedExpenseCategories() {
  console.log('💰 Creating expense categories...')

  const categories = [
    {
      name: 'Construction Materials',
      description: 'Cement, steel, bricks, etc.',
      type: 'material',
      path: 'construction-materials',
      level: 0,
      costCenter: {
        code: 'MAT001'
      },
      isActive: true
    },
    {
      name: 'Labor Costs',
      description: 'Skilled and unskilled labor',
      type: 'labor',
      path: 'labor-costs',
      level: 0,
      costCenter: {
        code: 'LAB001'
      },
      isActive: true
    },
    {
      name: 'Equipment Rental',
      description: 'Construction equipment rental',
      type: 'equipment',
      path: 'equipment-rental',
      level: 0,
      costCenter: {
        code: 'EQP001'
      },
      isActive: true
    },
    {
      name: 'Transportation',
      description: 'Material and equipment transportation',
      type: 'transport',
      path: 'transportation',
      level: 0,
      costCenter: {
        code: 'TRN001'
      },
      isActive: true
    },
    {
      name: 'Office Supplies',
      description: 'Stationery, printing, office equipment',
      type: 'administrative',
      path: 'office-supplies',
      level: 0,
      costCenter: {
        code: 'ADM001'
      },
      isActive: true
    }
  ]

  const createdCategories = await ExpenseCategory.insertMany(categories)
  console.log(`✅ Created ${createdCategories.length} expense categories`)
  return createdCategories
}

async function seedTransactions(projects, transactionCategories, expenseCategories) {
  console.log('💳 Creating sample transactions...')

  const transactions = [
    {
      transactionNumber: 'TXN2024000001',
      type: 'income',
      amount: 1000000,
      description: 'Initial project payment from ABC Construction',
      date: new Date('2024-01-20'),
      projectId: projects[0]._id,
      projectName: projects[0].name,
      categoryId: transactionCategories[0]._id,
      categoryName: transactionCategories[0].name,
      paymentMethod: 'bank',
      source: 'ABC Construction Ltd',
      receiptNumber: 'RCP001-001',
      status: 'approved',
      createdBy: 'system'
    },
    {
      transactionNumber: 'TXN2024000002',
      type: 'expense',
      amount: 250000,
      description: 'Cement and steel purchase for foundation',
      date: new Date('2024-01-25'),
      projectId: projects[0]._id,
      projectName: projects[0].name,
      categoryId: transactionCategories[2]._id,
      categoryName: transactionCategories[2].name,
      expenseCategoryId: expenseCategories[0]._id,
      expenseCategoryName: expenseCategories[0].name,
      paymentMethod: 'bank',
      source: 'XYZ Materials Pvt Ltd',
      receiptNumber: 'MAT-2024-001',
      status: 'approved',
      createdBy: 'system'
    },
    {
      transactionNumber: 'TXN2024000003',
      type: 'expense',
      amount: 150000,
      description: 'Labor costs for foundation work',
      date: new Date('2024-02-01'),
      projectId: projects[0]._id,
      projectName: projects[0].name,
      categoryId: transactionCategories[2]._id,
      categoryName: transactionCategories[2].name,
      expenseCategoryId: expenseCategories[1]._id,
      expenseCategoryName: expenseCategories[1].name,
      paymentMethod: 'cash',
      source: 'Construction Workers Union',
      receiptNumber: 'LAB-2024-001',
      status: 'approved',
      createdBy: 'system'
    },
    {
      transactionNumber: 'TXN2024000004',
      type: 'income',
      amount: 500000,
      description: 'Design consultation payment',
      date: new Date('2024-02-15'),
      projectId: projects[1]._id,
      projectName: projects[1].name,
      categoryId: transactionCategories[1]._id,
      categoryName: transactionCategories[1].name,
      paymentMethod: 'bank',
      source: 'ABC Construction Ltd',
      receiptNumber: 'OCD002-001',
      status: 'approved',
      createdBy: 'system'
    },
    {
      transactionNumber: 'TXN2024000005',
      type: 'expense',
      amount: 25000,
      description: 'Office supplies and stationery',
      date: new Date('2024-02-10'),
      categoryId: transactionCategories[3]._id,
      categoryName: transactionCategories[3].name,
      expenseCategoryId: expenseCategories[4]._id,
      expenseCategoryName: expenseCategories[4].name,
      paymentMethod: 'card',
      source: 'Office Depot',
      receiptNumber: 'OFC-2024-001',
      status: 'approved',
      createdBy: 'system'
    }
  ]

  const createdTransactions = await Transaction.insertMany(transactions)
  console.log(`✅ Created ${createdTransactions.length} transactions`)
  return createdTransactions
}

async function updateProjectBudgets(projects) {
  console.log('📊 Updating project budgets...')

  // Update project budgets based on transactions
  for (const project of projects) {
    const projectTransactions = await Transaction.find({ projectId: project._id })

    const totalIncome = projectTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = projectTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    await Project.findByIdAndUpdate(project._id, {
      'budget.spentAmount': totalExpenses,
      'budget.remainingBudget': project.budget.totalBudget - totalExpenses
    })
  }

  console.log('✅ Project budgets updated')
}

async function displaySummary() {
  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')

  const stats = {
    users: await User.countDocuments(),
    companies: await Company.countDocuments(),
    projects: await Project.countDocuments(),
    transactionCategories: await TransactionCategory.countDocuments(),
    expenseCategories: await ExpenseCategory.countDocuments(),
    transactions: await Transaction.countDocuments()
  }

  console.log(`   Users: ${stats.users}`)
  console.log(`   Companies: ${stats.companies}`)
  console.log(`   Projects: ${stats.projects}`)
  console.log(`   Transaction Categories: ${stats.transactionCategories}`)
  console.log(`   Expense Categories: ${stats.expenseCategories}`)
  console.log(`   Transactions: ${stats.transactions}`)

  console.log('\n🔐 Login Credentials:')
  console.log('   Admin: admin / Admin@123456')
  console.log('   Manager: manager / Manager@123')
  console.log('   Accountant: accountant / Accountant@123')

  console.log('\n💰 Sample Transaction Data:')
  const sampleTransaction = await Transaction.findOne().populate('projectId', 'name')
  if (sampleTransaction) {
    console.log(`   ${sampleTransaction.type}: ₹${sampleTransaction.amount.toLocaleString('en-IN')}`)
    console.log(`   Description: ${sampleTransaction.description}`)
    console.log(`   Project: ${sampleTransaction.projectName || 'N/A'}`)
  }
}

async function main() {
  try {
    await connectToDatabase()
    await clearDatabase()

    const users = await seedUsers()
    const companies = await seedCompanies()
    const projects = await seedProjects(companies)
    const transactionCategories = await seedTransactionCategories()
    const expenseCategories = await seedExpenseCategories()
    const transactions = await seedTransactions(projects, transactionCategories, expenseCategories)

    await updateProjectBudgets(projects)
    await displaySummary()

    console.log('\n✅ Database seeding completed successfully!')
    process.exit(0)

  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  }
}

// Run the seeding
main()