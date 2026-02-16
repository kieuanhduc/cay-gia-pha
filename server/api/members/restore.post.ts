import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import { logActivity } from '~/server/utils/activityLog'

export default defineEventHandler(async (event) => {
  const auth = requireRole(event, 'admin')
  const body = await readBody(event)
  const { logId } = body

  if (!logId) {
    throw createError({ statusCode: 400, message: 'Thiếu logId' })
  }

  const actLog = await prisma.activityLog.findUnique({ where: { id: Number(logId) } })
  if (!actLog || actLog.action !== 'delete' || !actLog.snapshot) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy dữ liệu để khôi phục' })
  }

  const snapshot = JSON.parse(actLog.snapshot)

  // Verify familyLine still exists
  const familyLine = await prisma.familyLine.findUnique({ where: { id: snapshot.familyLineId } })
  if (!familyLine) {
    throw createError({ statusCode: 400, message: 'Dòng họ không còn tồn tại, không thể khôi phục' })
  }

  const member = await prisma.member.create({
    data: {
      familyLineId: snapshot.familyLineId,
      fullName: snapshot.fullName,
      gender: snapshot.gender,
      birthDate: snapshot.birthDate ? new Date(snapshot.birthDate) : null,
      deathDate: snapshot.deathDate ? new Date(snapshot.deathDate) : null,
      isAlive: snapshot.isAlive,
      birthPlace: snapshot.birthPlace,
      avatarUrl: snapshot.avatarUrl,
      bio: snapshot.bio,
      generation: snapshot.generation,
      birthOrder: snapshot.birthOrder,
      fatherId: snapshot.fatherId,
      motherId: snapshot.motherId,
    },
  })

  await logActivity(prisma, {
    action: 'restore',
    entityType: 'member',
    entityId: member.id,
    entityName: member.fullName,
    auth,
  })

  return member
})
