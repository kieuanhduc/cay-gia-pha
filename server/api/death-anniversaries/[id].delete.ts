import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const id = Number(event.context.params?.id)

  const existing = await prisma.deathAnniversary.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy ngày giỗ' })
  }

  await prisma.deathAnniversary.delete({ where: { id } })

  return { success: true }
})
