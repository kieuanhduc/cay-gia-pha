import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const familyLineId = Number(getRouterParam(event, 'id'))

  // Get the most recent share/unshare activity for this family line
  const lastShareAction = await prisma.activityLog.findFirst({
    where: {
      entityType: 'family_line',
      entityId: familyLineId,
      action: { in: ['share', 'unshare'] },
    },
    orderBy: { createdAt: 'desc' },
  })

  return lastShareAction
    ? {
        action: lastShareAction.action,
        userName: lastShareAction.userName,
        createdAt: lastShareAction.createdAt,
      }
    : null
})
