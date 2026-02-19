import prisma from '~/server/utils/prisma'
import { requireRole, hashPassword } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin')
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const data: Record<string, any> = {}

  if (body.fullName?.trim()) {
    data.fullName = body.fullName.trim()
  }

  if (body.role) {
    if (!['admin', 'editor', 'viewer'].includes(body.role)) {
      throw createError({ statusCode: 400, message: 'Vai trò không hợp lệ' })
    }
    data.role = body.role
  }

  if (body.password?.trim()) {
    data.password = await hashPassword(body.password)
  }

  if (body.email !== undefined) {
    data.email = body.email?.trim() || null
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return user
})
