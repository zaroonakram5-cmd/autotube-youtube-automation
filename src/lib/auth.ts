import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import type { User } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
)

const COOKIE_NAME = 'auth-token'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

// Auto-create default user for public access
export async function getOrCreateDefaultUser(): Promise<User> {
  const defaultEmail = 'default@autotube.local'
  
  let user = await prisma.user.findUnique({
    where: { email: defaultEmail },
  })
  
  if (!user) {
    const hashedPassword = await bcrypt.hash('default-password-' + Date.now(), 12)
    user = await prisma.user.create({
      data: {
        email: defaultEmail,
        password: hashedPassword,
        name: 'AutoTube User',
        role: 'USER',
        credits: 1000,
      },
    })
  }
  
  return user as User
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  
  if (!token) {
    // Auto-create and return default user for public access
    return await getOrCreateDefaultUser()
  }
  
  const payload = await verifyToken(token)
  if (!payload) {
    // Auto-create and return default user for public access
    return await getOrCreateDefaultUser()
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      credits: true,
      createdAt: true,
    },
  })
  
  if (!user) {
    return await getOrCreateDefaultUser()
  }
  
  return user as User | null
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }
  return user
}
