import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!body.spouseId) {
    throw createError({ statusCode: 400, message: 'Vui lòng chọn vợ/chồng' })
  }

  const spouse = await prisma.spouse.create({
    data: {
      memberAId: id,
      memberBId: body.spouseId,
      marriedDate: body.marriedDate ? new Date(body.marriedDate) : null,
    },
  })

  return spouse
})
