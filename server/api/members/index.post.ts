import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import { logActivity } from '~/server/utils/activityLog'

export default defineEventHandler(async (event) => {
  const auth = requireRole(event, 'admin', 'editor')
  const body = await readBody(event)

  if (!body.fullName?.trim()) {
    throw createError({ statusCode: 400, message: 'Họ tên không được để trống' })
  }
  if (!body.gender) {
    throw createError({ statusCode: 400, message: 'Giới tính không được để trống' })
  }
  if (!body.familyLineId) {
    throw createError({ statusCode: 400, message: 'Vui lòng chọn dòng họ' })
  }

  // Auto-calculate generation from father
  let generation = body.generation || 1
  if (body.fatherId) {
    const father = await prisma.member.findUnique({ where: { id: body.fatherId } })
    if (father) generation = father.generation + 1
  }

  const member = await prisma.member.create({
    data: {
      familyLineId: Number(body.familyLineId),
      fullName: body.fullName.trim(),
      gender: body.gender,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      deathDate: body.deathDate ? new Date(body.deathDate) : null,
      isAlive: body.isAlive !== false,
      birthPlace: body.birthPlace?.trim() || null,
      bio: body.bio?.trim() || null,
      generation,
      birthOrder: body.birthOrder || 1,
      fatherId: body.fatherId || null,
      motherId: body.motherId || null,
      deathAnniversaryLunar: body.deathAnniversaryLunar?.trim() || null,
      deathAnniversaryNote: body.deathAnniversaryNote?.trim() || null,
    },
  })

  // Create spouse relationship if provided
  if (body.spouseId) {
    await prisma.spouse.create({
      data: {
        memberAId: member.id,
        memberBId: body.spouseId,
        marriedDate: body.marriedDate ? new Date(body.marriedDate) : null,
      },
    })
  }

  await logActivity(prisma, {
    action: 'create',
    entityType: 'member',
    entityId: member.id,
    entityName: member.fullName,
    auth,
  })

  return member
})
