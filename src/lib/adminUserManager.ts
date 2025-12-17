import dbConnect from './mongodb'
import { User } from './models'
import bcrypt from 'bcryptjs'

export interface AdminUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'super_admin' | 'manager' | 'accountant' | 'viewer'
  hashedPassword: string
  createdAt: string
  lastLogin?: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface CreateAdminUserData {
  username: string
  email: string
  password: string
  role?: 'admin' | 'super_admin' | 'manager' | 'accountant' | 'viewer'
}

export class AdminUserManager {
  constructor() {
    // No Redis - use MongoDB only for Vercel compatibility
  }

  async createAdminUser(userData: CreateAdminUserData): Promise<AdminUser> {
    await dbConnect()
    
    // Check if user already exists
    const existingUser = await this.findUserByUsername(userData.username)
    if (existingUser) {
      throw new Error('Username already exists')
    }

    const existingEmail = await this.findUserByEmail(userData.email)
    if (existingEmail) {
      throw new Error('Email already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Create user in MongoDB
    const newUser = await User.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'admin',
      permissions: {
        projects: 'admin',
        transactions: 'admin',
        reports: 'admin',
        settings: userData.role === 'super_admin' ? 'admin' : 'read'
      },
      status: 'active',
      createdAt: new Date()
    })

    return {
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      hashedPassword: newUser.password,
      createdAt: newUser.createdAt.toISOString(),
      status: newUser.status
    }
  }

  async findUserByUsername(username: string): Promise<AdminUser | null> {
    await dbConnect()
    
    const user = await User.findOne({ username })
    if (!user) return null

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      hashedPassword: user.password,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      status: user.status
    }
  }

  async findUserByEmail(email: string): Promise<AdminUser | null> {
    await dbConnect()
    
    const user = await User.findOne({ email })
    if (!user) return null

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      hashedPassword: user.password,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      status: user.status
    }
  }

  async findUserById(id: string): Promise<AdminUser | null> {
    await dbConnect()
    
    const user = await User.findById(id)
    if (!user) return null

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      hashedPassword: user.password,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      status: user.status
    }
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  async updateLastLogin(userId: string): Promise<void> {
    await dbConnect()
    
    await User.findByIdAndUpdate(userId, {
      lastLogin: new Date()
    })
  }

  async getAllUsers(): Promise<AdminUser[]> {
    await dbConnect()
    
    const users = await User.find({}).sort({ createdAt: -1 })
    
    return users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      hashedPassword: user.password,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      status: user.status
    }))
  }

  async disconnect() {
    // No Redis to disconnect - MongoDB connection is handled automatically
  }
}

// Export singleton instance
export const adminUserManager = new AdminUserManager()