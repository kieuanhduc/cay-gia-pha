import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  // Export all tables as JSON (database-agnostic backup)
  const [familyLines, members, spouses, memberVersions, activityLogs, memberPhotos, users] = await Promise.all([
    prisma.familyLine.findMany(),
    prisma.member.findMany(),
    prisma.spouse.findMany(),
    prisma.memberVersion.findMany(),
    prisma.activityLog.findMany(),
    prisma.memberPhoto.findMany(),
    prisma.user.findMany({ select: { id: true, username: true, fullName: true, role: true, createdAt: true, updatedAt: true } }),
  ])

  const backup = {
    _type: 'full_backup',
    version: '1.0',
    createdAt: new Date().toISOString(),
    tables: {
      users,
      familyLines,
      members,
      spouses,
      memberVersions,
      activityLogs,
      memberPhotos,
    },
  }

  setHeader(event, 'Content-Type', 'application/json')
  setHeader(event, 'Content-Disposition', `attachment; filename=backup-full-${Date.now()}.json`)
  return backup
})
