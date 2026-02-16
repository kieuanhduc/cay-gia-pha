import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import { createMemberSnapshot } from '~/server/utils/memberVersion'

export default defineEventHandler(async (event) => {
  const auth = requireRole(event, 'admin', 'editor')
  const memberId = Number(getRouterParam(event, 'id'))
  const versionId = Number(getRouterParam(event, 'versionId'))

  const member = await prisma.$transaction(async (tx) => {
    const targetVersion = await tx.memberVersion.findFirst({
      where: { id: versionId, memberId },
    })
    if (!targetVersion) {
      throw createError({ statusCode: 404, message: 'Không tìm thấy phiên bản' })
    }

    const current = await tx.member.findUnique({ where: { id: memberId } })
    if (!current) {
      throw createError({ statusCode: 404, message: 'Không tìm thấy thành viên' })
    }

    await createMemberSnapshot(tx, current, auth, 'revert')

    return tx.member.update({
      where: { id: memberId },
      data: {
        fullName: targetVersion.fullName,
        gender: targetVersion.gender,
        birthDate: targetVersion.birthDate,
        deathDate: targetVersion.deathDate,
        isAlive: targetVersion.isAlive,
        birthPlace: targetVersion.birthPlace,
        avatarUrl: targetVersion.avatarUrl,
        bio: targetVersion.bio,
        generation: targetVersion.generation,
        birthOrder: targetVersion.birthOrder,
        fatherId: targetVersion.fatherId,
        motherId: targetVersion.motherId,
      },
    })
  })

  return member
})
