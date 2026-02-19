import { getTokenFromEvent, verifyToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const token = getTokenFromEvent(event)
  if (!token) {
    throw createError({ statusCode: 401, message: 'Chưa đăng nhập' })
  }

  try {
    const payload = verifyToken(token)
    // Return directly from verified JWT — no DB query needed
    // fullName falls back to username for tokens issued before this change
    return {
      user: {
        id: payload.userId,
        username: payload.username,
        fullName: payload.fullName || payload.username,
        role: payload.role,
      },
    }
  } catch {
    throw createError({ statusCode: 401, message: 'Phiên đăng nhập hết hạn' })
  }
})
