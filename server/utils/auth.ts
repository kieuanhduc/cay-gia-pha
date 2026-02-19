import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

interface TokenPayload {
  userId: number
  username: string
  fullName: string
  role: string
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed)
}

export function signToken(payload: TokenPayload): string {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' })
}

export function verifyToken(token: string): TokenPayload {
  const config = useRuntimeConfig()
  return jwt.verify(token, config.jwtSecret) as TokenPayload
}

export function getTokenFromEvent(event: H3Event): string | null {
  // Check cookie first
  const cookie = getCookie(event, 'auth_token')
  if (cookie) return cookie

  // Then check Authorization header
  const header = getHeader(event, 'authorization')
  if (header?.startsWith('Bearer ')) {
    return header.slice(7)
  }

  return null
}

export function requireAuth(event: H3Event): TokenPayload {
  const token = getTokenFromEvent(event)
  if (!token) {
    throw createError({ statusCode: 401, message: 'Chưa đăng nhập' })
  }
  try {
    return verifyToken(token)
  } catch {
    throw createError({ statusCode: 401, message: 'Phiên đăng nhập hết hạn' })
  }
}

export function requireRole(event: H3Event, ...roles: string[]): TokenPayload {
  const auth = requireAuth(event)
  if (!roles.includes(auth.role)) {
    throw createError({ statusCode: 403, message: 'Không có quyền thực hiện' })
  }
  return auth
}
