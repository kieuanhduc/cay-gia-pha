import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)

  const email = body.email?.trim() || null

  const updated = await prisma.user.update({
    where: { id: user.userId },
    data: { email },
    select: {
      id: true,
      username: true,
      fullName: true,
      email: true,
      role: true,
    },
  })

  return updated
})
