import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin')
  const userId = Number(event.context.params?.id)

  const records = await prisma.userFamilyLine.findMany({
    where: { userId },
    select: { familyLineId: true },
  })

  return records.map((r) => r.familyLineId)
})
