import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import { getAccessibleFamilyLineIds } from '~/server/utils/familyLineAccess'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const id = Number(event.context.params?.id)

  const existing = await prisma.deathAnniversary.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy ngày giỗ' })
  }

  // Kiểm tra quyền với dòng họ của record
  const accessibleIds = await getAccessibleFamilyLineIds(event)
  if (accessibleIds !== null && existing.familyLineId && !accessibleIds.includes(existing.familyLineId)) {
    throw createError({ statusCode: 403, message: 'Bạn không có quyền xoá ngày giỗ này' })
  }

  await prisma.deathAnniversary.delete({ where: { id } })

  return { success: true }
})
