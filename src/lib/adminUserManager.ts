import { createClient } from 'redis'
import bcrypt from 'bcryptjs'

export interface AdminUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'super_admin'
  hashedPassword: string
  createdAt: string
  lastLogin?: string
  isActive: boolean
}

export interface CreateAdminUserData {
  username: string
  email: string
  password: string
  role?: 'admin' | 'super_admin'
}

export class AdminUserManager {
  private redis: any

  constructor() {
    this.redis = null
  }

  private async getRedisClient() {
    if (!this.redis) {
      this.redis = createClient({
        url: process.env.REDIS_URL
      })
      await this.redis.connect()
    }
    return this.redis
  }

  async createAdminUser(userData: CreateAdminUserData): Promise<AdminUser> {
    const redis = await this.getRedisClient()
    
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

    // Create user object
    const adminUser: AdminUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      role: userData.role || 'admin',
      hashedPassword,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    // Store in Redis
    const userKey = `admin:user:${adminUser.id}`
    await redis.set(userKey, JSON.stringify(adminUser))

    // Add to username index
    await redis.set(`admin:username:${userData.username}`, adminUser.id)
    
    // Add to email index
    await redis.set(`admin:email:${userData.email}`, adminUser.id)

    // Add to user list
    await redis.lPush('admin:users', userKey)

    return adminUser
  }

  async findUserByUsername(username: string): Promise<AdminUser | null> {
    const redis = await this.getRedisClient()
    
    const userId = await redis.get(`admin:username:${username}`)
    if (!userId) return null

    const userKey = `admin:user:${userId}`
    const userData = await redis.get(userKey)
    
    return userData ? JSON.parse(userData) : null
  }

  async findUserByEmail(email: string): Promise<AdminUser | null> {
    const redis = await this.getRedisClient()
    
    const userId = await redis.get(`admin:email:${email}`)
    if (!userId) return null

    const userKey = `admin:user:${userId}`
    const userData = await redis.get(userKey)
    
    return userData ? JSON.parse(userData) : null
  }

  async findUserById(id: string): Promise<AdminUser | null> {
    const redis = await this.getRedisClient()
    
    const userKey = `admin:user:${id}`
    const userData = await redis.get(userKey)
    
    return userData ? JSON.parse(userData) : null
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  async updateLastLogin(userId: string): Promise<void> {
    const redis = await this.getRedisClient()
    
    const user = await this.findUserById(userId)
    if (user) {
      user.lastLogin = new Date().toISOString()
      const userKey = `admin:user:${userId}`
      await redis.set(userKey, JSON.stringify(user))
    }
  }

  async getAllUsers(): Promise<AdminUser[]> {
    const redis = await this.getRedisClient()
    
    const userKeys = await redis.lRange('admin:users', 0, -1)
    const users: AdminUser[] = []

    for (const key of userKeys) {
      const userData = await redis.get(key)
      if (userData) {
        users.push(JSON.parse(userData))
      }
    }

    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async disconnect() {
    if (this.redis) {
      await this.redis.disconnect()
      this.redis = null
    }
  }
}

// Export singleton instance
export const adminUserManager = new AdminUserManager()