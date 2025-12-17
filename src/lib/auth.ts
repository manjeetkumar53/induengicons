import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import dbConnect from './mongodb'
import { User } from './models'

const secretKey = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const key = new TextEncoder().encode(secretKey)

export interface SessionPayload {
  userId: string
  username: string
  email: string
  role: 'admin' | 'super_admin' | 'manager' | 'accountant' | 'viewer'
  expiresAt: number
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export async function createSession(userId: string) {
  await dbConnect()
  const user = await User.findById(userId).select('-password')
  if (!user) {
    throw new Error('User not found')
  }

  const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  const session: SessionPayload = {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    expiresAt
  }

  const sessionToken = await encrypt(session)
  
  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set('admin-session', sessionToken, {
    expires: new Date(expiresAt),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  // Update last login
  await User.findByIdAndUpdate(userId, { 
    lastLogin: new Date() 
  })

  return sessionToken
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('admin-session')?.value

  if (!sessionToken) {
    return null
  }

  const session = await decrypt(sessionToken)
  
  if (!session || session.expiresAt < Date.now()) {
    return null
  }

  return session
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-session')
}

export async function updateSession() {
  const session = await verifySession()
  
  if (!session) {
    return null
  }

  const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // Extend for 24 hours
  const newSession: SessionPayload = {
    ...session,
    expiresAt
  }

  const sessionToken = await encrypt(newSession)
  
  const cookieStore = await cookies()
  cookieStore.set('admin-session', sessionToken, {
    expires: new Date(expiresAt),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  return newSession
}