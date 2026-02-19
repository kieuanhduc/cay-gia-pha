import prisma from '~/server/utils/prisma'
import { signToken } from '~/server/utils/auth'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile'],
  },

  async onSuccess(event, { user: googleUser }) {
    // Tìm user theo googleId hoặc email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.sub as string },
          { email: googleUser.email as string },
        ],
      },
    })

    if (!user) {
      // Tạo tài khoản viewer mới
      const emailPrefix = (googleUser.email as string).split('@')[0].slice(0, 47)
      let username = emailPrefix
      let attempt = 0
      while (await prisma.user.findUnique({ where: { username } })) {
        attempt++
        username = `${emailPrefix}${attempt}`
      }

      user = await prisma.user.create({
        data: {
          username,
          fullName: googleUser.name as string,
          email: googleUser.email as string,
          googleId: googleUser.sub as string,
          role: 'viewer',
          password: null,
        },
      })
    } else if (!user.googleId) {
      // Link Google vào tài khoản đã có (email trùng)
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.sub as string },
      })
    }

    // Issue JWT — giống hệt login truyền thống
    const token = signToken({
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    })

    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return sendRedirect(event, '/admin')
  },

  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/login?error=google')
  },
})
