import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!body.spouseId) {
    throw createError({ statusCode: 400, message: 'Vui lòng chọn vợ/chồng cần xóa' })
  }

  // Delete in both directions
  await prisma.spouse.deleteMany({
    where: {
      OR: [
        { memberAId: id, memberBId: body.spouseId },
        { memberAId: body.spouseId, memberBId: id },
      ],
    },
  })

  return { message: 'Đã xóa quan hệ vợ/chồng' }
})
