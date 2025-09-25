/**
 * MongoDB Auth Seed Script
 * Creates initial admin user and test users for the system
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
const result = config({ path: resolve(process.cwd(), '.env.local') })

console.log('Loading environment variables...')
if (result.parsed) {
  console.log('✅ Environment variables loaded successfully')
  // Explicitly set the MongoDB URI
  if (result.parsed.MONGODB_URI) {
    process.env.MONGODB_URI = result.parsed.MONGODB_URI
  }
  if (result.parsed.REDIS_URL) {
    process.env.REDIS_URL = result.parsed.REDIS_URL
  }
} else {
  console.log('❌ Failed to load .env.local file')
}

console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
console.log('REDIS_URL exists:', !!process.env.REDIS_URL)

import dbConnect from '@/lib/mongodb'
import { User } from '@/lib/models'
import { createUser } from '@/lib/auth-mongo'

async function seedAuthUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await dbConnect()

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.username)
      return
    }

    console.log('👤 Creating initial admin user...')
    
    // Create admin user
    const adminUser = await createUser({
      username: 'admin',
      email: 'admin@induengicons.com',
      password: 'Admin@123456',
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

    console.log('✅ Admin user created successfully:')
    console.log('   Username:', adminUser.username)
    console.log('   Email:', adminUser.email)
    console.log('   Role:', adminUser.role)
    console.log('   ID:', adminUser.id)

    // Create additional test users
    console.log('👥 Creating additional test users...')

    const testUsers = [
      {
        username: 'manager',
        email: 'manager@induengicons.com',
        password: 'Manager@123',
        firstName: 'Project',
        lastName: 'Manager',
        role: 'manager' as const,
        permissions: {
          projects: 'admin' as const,
          transactions: 'write' as const,
          reports: 'write' as const,
          settings: 'read' as const
        }
      },
      {
        username: 'accountant',
        email: 'accountant@induengicons.com',
        password: 'Accountant@123',
        firstName: 'Senior',
        lastName: 'Accountant',
        role: 'accountant' as const,
        permissions: {
          projects: 'read' as const,
          transactions: 'admin' as const,
          reports: 'admin' as const,
          settings: 'read' as const
        }
      },
      {
        username: 'viewer',
        email: 'viewer@induengicons.com',
        password: 'Viewer@123',
        firstName: 'Report',
        lastName: 'Viewer',
        role: 'viewer' as const,
        permissions: {
          projects: 'read' as const,
          transactions: 'read' as const,
          reports: 'read' as const,
          settings: 'none' as const
        }
      }
    ]

    for (const userData of testUsers) {
      try {
        const user = await createUser(userData)
        console.log(`✅ Created ${userData.role}:`, user.username, `(${user.email})`)
      } catch (error) {
        console.log(`⚠️  ${userData.role} might already exist:`, userData.username)
      }
    }

    console.log('\n🎉 Authentication seed completed successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('   Admin: admin / Admin@123456')
    console.log('   Manager: manager / Manager@123')
    console.log('   Accountant: accountant / Accountant@123')
    console.log('   Viewer: viewer / Viewer@123')
    console.log('\n🔐 All passwords use secure bcrypt hashing')
    console.log('🔑 JWT tokens are used for session management')
    console.log('💾 Session data is cached in Redis for performance')

  } catch (error) {
    console.error('❌ Auth seed failed:', error)
    throw error
  }
}

// Run the seed function
if (require.main === module) {
  seedAuthUsers()
    .then(() => {
      console.log('✅ Auth seed script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Auth seed script failed:', error)
      process.exit(1)
    })
}

export default seedAuthUsers