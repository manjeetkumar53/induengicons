import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import dbConnect from './mongodb'
import { User } from './models'

// JWT secret from environment
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

// Remove Redis client for middleware compatibility
// Redis caching is optional and will be handled elsewhere if needed

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
 * Generate JWT token
 */
async function generateToken(user: { _id: string; username: string; role: string }): Promise<string> {
  const payload = {
    userId: user._id.toString(),
    username: user.username,
    role: user.role
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify JWT token
 */
async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Authenticate user with username/email and password
 */
export async function authenticateUser(
  usernameOrEmail: string, 
  password: string
): Promise<AuthUser | null> {
  try {
    await dbConnect()

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    }).select('+password')

    if (!user) {
      return null
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return null
    }

    // Check if user is active
    if (user.status !== 'active') {
      return null
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    })

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions || {
        projects: 'read',
        transactions: 'read',
        reports: 'read',
        settings: 'read'
      },
      status: user.status,
      lastLogin: new Date()
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Create session token for authenticated user
 */
export async function createSession(user: AuthUser): Promise<string> {
  try {
    const token = await generateToken({ _id: user.id, username: user.username, role: user.role })
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
    const payload = await verifyToken(token)
    if (!payload) {
      return null
    }

    // Get user from database
    await dbConnect()
    const user = await User.findById(payload.userId).lean()

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
      permissions: user.permissions || {
        projects: 'read',
        transactions: 'read',
        reports: 'read',
        settings: 'read'
      },
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
    // JWT tokens are stateless, so we just verify it's valid
    // In production, you might want to maintain a blacklist
    const payload = await verifyToken(token)
    if (!payload) {
      return false
    }

    return true
  } catch (error) {
    console.error('Session destruction error:', error)
    return false
  }
}

/**
 * Get session info from token (without database lookup)
 */
export async function getSessionInfo(token: string): Promise<JWTPayload | null> {
  return await verifyToken(token)
}

/**
 * Create initial admin user
 */
export async function createInitialAdmin(userData: {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<AuthUser> {
  try {
    await dbConnect()

    // Check if any users exist
    const existingUserCount = await User.countDocuments()
    if (existingUserCount > 0) {
      throw new Error('Admin user already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Create admin user
    const adminUser = await User.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'admin',
      permissions: {
        projects: 'admin',
        transactions: 'admin',
        reports: 'admin',
        settings: 'admin'
      },
      status: 'active',
      createdAt: new Date()
    })

    return {
      id: adminUser._id.toString(),
      username: adminUser.username,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
      permissions: adminUser.permissions,
      status: adminUser.status
    }
  } catch (error) {
    console.error('Initial admin creation error:', error)
    throw error
  }
}

/**
 * Check if initial setup is needed
 */
export async function needsInitialSetup(): Promise<boolean> {
  try {
    await dbConnect()
    const userCount = await User.countDocuments()
    return userCount === 0
  } catch (error) {
    console.error('Setup check error:', error)
    return false
  }
}