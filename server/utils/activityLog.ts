import prisma from '~/server/utils/prisma'

type PrismaLike = typeof prisma | Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

interface LogParams {
  action: 'create' | 'update' | 'delete' | 'revert' | 'restore' | 'share' | 'unshare'
  entityType: 'member' | 'family_line'
  entityId: number
  entityName: string
  snapshot?: any
  auth: { userId: number; username: string }
}

export async function logActivity(db: PrismaLike, params: LogParams) {
  return db.activityLog.create({
    data: {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      snapshot: params.snapshot ? JSON.stringify(params.snapshot) : null,
      userId: params.auth.userId,
      userName: params.auth.username,
    },
  })
}
