import bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { User } from '@/lib/models'
import { createClient } from 'redis'

// JWT secret - in production, this should be a strong secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

// Redis client for token caching
let redisClient: any = null

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL
    })
    await redisClient.connect()
  }
  return redisClient
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  permissions: {
    projects: string
    transactions: string
    reports: string
    settings: string
  }
  status: string
  lastLogin?: Date
}

export interface JWTPayload {
  userId: string
  username: string
  role: string
  iat: number
  exp: number
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a JWT token
 */
export function generateToken(user: AuthUser): string {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role
  }

  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'induengicons',
    audience: 'induengicons-users'
  }

  return jwt.sign(payload, JWT_SECRET, options)
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const options: jwt.VerifyOptions = {
      issuer: 'induengicons',
      audience: 'induengicons-users'
    }
    
    const decoded = jwt.verify(token, JWT_SECRET, options) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Authenticate user with username/password
 */
export async function authenticateUser(credentials: LoginCredentials): Promise<AuthUser | null> {
  try {
    await dbConnect()

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: credentials.username },
        { email: credentials.username }
      ],
      status: 'active'
    }).select('+password') // Include password field

    if (!user) {
      return null
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password)
    if (!isValidPassword) {
      return null
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    })

    // Return user data (without password)
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      lastLogin: new Date()
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Create a session by generating JWT and caching in Redis
 */
export async function createSession(user: AuthUser): Promise<string> {
  try {
    // Generate JWT token
    const token = generateToken(user)
    
    // Cache token in Redis with user data for fast access
    const redis = await getRedisClient()
    const sessionKey = `session:${user.id}`
    const sessionData = {
      userId: user.id,
      username: user.username,
      role: user.role,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }

    // Store session in Redis with expiration (7 days)
    await redis.setEx(sessionKey, 7 * 24 * 60 * 60, JSON.stringify(sessionData))
    
    // Also store token mapping for quick lookup
    await redis.setEx(`token:${token}`, 7 * 24 * 60 * 60, user.id)

    return token
  } catch (error) {
    console.error('Session creation error:', error)
    throw new Error('Failed to create session')
  }
}

/**
 * Validate session token and return user data
 */
export async function validateSession(token: string): Promise<AuthUser | null> {
  try {
    // Verify JWT token
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    // Check if session exists in Redis cache
    const redis = await getRedisClient()
    const sessionKey = `session:${payload.userId}`
    const sessionData = await redis.get(sessionKey)

    if (!sessionData) {
      // Session not found in cache, validate against database
      await dbConnect()
      const user = await User.findById(payload.userId).select('-password')
      if (!user || user.status !== 'active') {
        return null
      }

      // Recreate session in cache
      const newSessionData = {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }
      await redis.setEx(sessionKey, 7 * 24 * 60 * 60, JSON.stringify(newSessionData))

      return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
        status: user.status,
        lastLogin: user.lastLogin
      }
    }

    // Update last activity in cache
    const session = JSON.parse(sessionData)
    session.lastActivity = new Date().toISOString()
    await redis.setEx(sessionKey, 7 * 24 * 60 * 60, JSON.stringify(session))

    // Get fresh user data from database
    await dbConnect()
    const user = await User.findById(payload.userId).select('-password')
    if (!user || user.status !== 'active') {
      return null
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      lastLogin: user.lastLogin
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

/**
 * Destroy a session
 */
export async function destroySession(token: string): Promise<boolean> {
  try {
    // Decode token to get user ID
    const payload = verifyToken(token)
    if (!payload) {
      return false
    }

    // Remove from Redis cache
    const redis = await getRedisClient()
    await redis.del(`session:${payload.userId}`)
    await redis.del(`token:${token}`)

    return true
  } catch (error) {
    console.error('Session destruction error:', error)
    return false
  }
}

/**
 * Create a new user (admin function)
 */
export async function createUser(userData: {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
  permissions?: any
}): Promise<AuthUser> {
  try {
    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: userData.username },
        { email: userData.email }
      ]
    })

    if (existingUser) {
      throw new Error('User with this username or email already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Create user
    const user = await User.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'viewer',
      permissions: userData.permissions || {
        projects: 'read',
        transactions: 'read',
        reports: 'read',
        settings: 'read'
      },
      status: 'active'
    })

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      status: user.status
    }
  } catch (error) {
    console.error('User creation error:', error)
    throw error
  }
}

/**
 * Check if setup is required (no admin users exist)
 */
export async function isSetupRequired(): Promise<boolean> {
  try {
    await dbConnect()
    const adminCount = await User.countDocuments({ role: 'admin' })
    return adminCount === 0
  } catch (error) {
    console.error('Setup check error:', error)
    return true
  }
}

export default {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authenticateUser,
  createSession,
  validateSession,
  destroySession,
  createUser,
  isSetupRequired
}