import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin')
  const body = await readBody(event)

  if (body._type !== 'full_backup' || !body.tables) {
    throw createError({ statusCode: 400, message: 'File backup không hợp lệ' })
  }

  const t = body.tables

  await prisma.$transaction(async (tx) => {
    // Clear all data in correct order (foreign key constraints)
    await tx.memberPhoto.deleteMany()
    await tx.activityLog.deleteMany()
    await tx.memberVersion.deleteMany()
    await tx.spouse.deleteMany()
    await tx.member.deleteMany()
    await tx.familyLine.deleteMany()

    // Restore family lines
    for (const fl of t.familyLines || []) {
      await tx.familyLine.create({
        data: {
          id: fl.id,
          name: fl.name,
          description: fl.description,
          originPlace: fl.originPlace,
          isPublic: fl.isPublic ?? false,
          shareToken: fl.shareToken,
          sharePassword: fl.sharePassword,
          createdAt: new Date(fl.createdAt),
          updatedAt: new Date(fl.updatedAt),
        },
      })
    }

    // Restore members (without parent refs first)
    for (const m of t.members || []) {
      await tx.member.create({
        data: {
          id: m.id,
          familyLineId: m.familyLineId,
          fullName: m.fullName,
          gender: m.gender,
          birthDate: m.birthDate ? new Date(m.birthDate) : null,
          deathDate: m.deathDate ? new Date(m.deathDate) : null,
          isAlive: m.isAlive,
          birthPlace: m.birthPlace,
          avatarUrl: m.avatarUrl,
          bio: m.bio,
          generation: m.generation,
          birthOrder: m.birthOrder,
          deathAnniversaryLunar: m.deathAnniversaryLunar,
          deathAnniversaryNote: m.deathAnniversaryNote,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
        },
      })
    }

    // Update parent references
    for (const m of t.members || []) {
      if (m.fatherId || m.motherId) {
        await tx.member.update({
          where: { id: m.id },
          data: { fatherId: m.fatherId, motherId: m.motherId },
        })
      }
    }

    // Restore spouses
    for (const s of t.spouses || []) {
      await tx.spouse.create({
        data: {
          id: s.id,
          memberAId: s.memberAId,
          memberBId: s.memberBId,
          marriedDate: s.marriedDate ? new Date(s.marriedDate) : null,
          isActive: s.isActive ?? true,
          createdAt: new Date(s.createdAt),
        },
      })
    }

    // Restore member versions
    for (const v of t.memberVersions || []) {
      await tx.memberVersion.create({
        data: {
          id: v.id,
          memberId: v.memberId,
          version: v.version,
          fullName: v.fullName,
          gender: v.gender,
          birthDate: v.birthDate ? new Date(v.birthDate) : null,
          deathDate: v.deathDate ? new Date(v.deathDate) : null,
          isAlive: v.isAlive,
          birthPlace: v.birthPlace,
          avatarUrl: v.avatarUrl,
          bio: v.bio,
          generation: v.generation,
          birthOrder: v.birthOrder,
          fatherId: v.fatherId,
          motherId: v.motherId,
          deathAnniversaryLunar: v.deathAnniversaryLunar,
          deathAnniversaryNote: v.deathAnniversaryNote,
          changedBy: v.changedBy,
          changedByName: v.changedByName,
          changeType: v.changeType,
          createdAt: new Date(v.createdAt),
        },
      })
    }

    // Restore activity logs
    for (const a of t.activityLogs || []) {
      await tx.activityLog.create({
        data: {
          id: a.id,
          action: a.action,
          entityType: a.entityType,
          entityId: a.entityId,
          entityName: a.entityName,
          snapshot: a.snapshot,
          userId: a.userId,
          userName: a.userName,
          createdAt: new Date(a.createdAt),
        },
      })
    }

    // Restore member photos
    for (const p of t.memberPhotos || []) {
      await tx.memberPhoto.create({
        data: {
          id: p.id,
          memberId: p.memberId,
          url: p.url,
          caption: p.caption,
          takenDate: p.takenDate ? new Date(p.takenDate) : null,
          sortOrder: p.sortOrder ?? 0,
          createdAt: new Date(p.createdAt),
        },
      })
    }
  })

  return { message: 'Khôi phục dữ liệu thành công' }
})
