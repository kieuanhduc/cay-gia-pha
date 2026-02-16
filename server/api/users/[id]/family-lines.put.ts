import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin')
  const userId = Number(event.context.params?.id)
  const body = await readBody(event)

  const familyLineIds: number[] = body.familyLineIds || []

  // Delete all existing, then re-create
  await prisma.$transaction([
    prisma.userFamilyLine.deleteMany({ where: { userId } }),
    ...familyLineIds.map((familyLineId) =>
      prisma.userFamilyLine.create({
        data: { userId, familyLineId },
      }),
    ),
  ])

  return { success: true, familyLineIds }
})
