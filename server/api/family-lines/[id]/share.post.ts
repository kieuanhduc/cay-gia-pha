import crypto from 'crypto'
import prisma from '~/server/utils/prisma'
import { requireRole, hashPassword } from '~/server/utils/auth'
import { logActivity } from '~/server/utils/activityLog'

export default defineEventHandler(async (event) => {
  const auth = requireRole(event, 'admin', 'editor')

  const familyLineId = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ isPublic: boolean; password?: string }>(event)

  const familyLine = await prisma.familyLine.findUnique({
    where: { id: familyLineId },
  })

  if (!familyLine) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy dòng họ' })
  }

  if (body.isPublic) {
    // Enable sharing
    const shareToken = crypto.randomBytes(32).toString('hex')
    const sharePassword = body.password ? await hashPassword(body.password) : null

    const updated = await prisma.familyLine.update({
      where: { id: familyLineId },
      data: {
        isPublic: true,
        shareToken,
        sharePassword,
      },
    })

    await logActivity(prisma, {
      action: 'share',
      entityType: 'family_line',
      entityId: familyLineId,
      entityName: familyLine.name,
      snapshot: { hasPassword: !!body.password },
      auth: { userId: auth.userId, username: auth.username },
    })

    return updated
  } else {
    // Disable sharing
    const updated = await prisma.familyLine.update({
      where: { id: familyLineId },
      data: {
        isPublic: false,
        shareToken: null,
        sharePassword: null,
      },
    })

    await logActivity(prisma, {
      action: 'unshare',
      entityType: 'family_line',
      entityId: familyLineId,
      entityName: familyLine.name,
      auth: { userId: auth.userId, username: auth.username },
    })

    return updated
  }
})
