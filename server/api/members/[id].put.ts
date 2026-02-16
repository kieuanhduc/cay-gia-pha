import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import { createMemberSnapshot } from '~/server/utils/memberVersion'
import { logActivity } from '~/server/utils/activityLog'

export default defineEventHandler(async (event) => {
  const auth = requireRole(event, 'admin', 'editor')
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!body.fullName?.trim()) {
    throw createError({ statusCode: 400, message: 'Họ tên không được để trống' })
  }

  const member = await prisma.$transaction(async (tx) => {
    const current = await tx.member.findUnique({ where: { id } })
    if (!current) {
      throw createError({ statusCode: 404, message: 'Không tìm thấy thành viên' })
    }

    await createMemberSnapshot(tx, current, auth, 'update')

    const updated = await tx.member.update({
      where: { id },
      data: {
        fullName: body.fullName.trim(),
        gender: body.gender,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        deathDate: body.deathDate ? new Date(body.deathDate) : null,
        isAlive: body.isAlive !== false,
        birthPlace: body.birthPlace?.trim() || null,
        bio: body.bio?.trim() || null,
        generation: body.generation || undefined,
        birthOrder: body.birthOrder || undefined,
        fatherId: body.fatherId ?? undefined,
        motherId: body.motherId ?? undefined,
        deathAnniversaryLunar: body.deathAnniversaryLunar?.trim() || null,
        deathAnniversaryNote: body.deathAnniversaryNote?.trim() || null,
      },
    })

    await logActivity(tx, {
      action: 'update',
      entityType: 'member',
      entityId: updated.id,
      entityName: updated.fullName,
      auth,
    })

    return updated
  })

  return member
})
