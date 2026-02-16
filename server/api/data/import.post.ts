import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin')
  const body = await readBody(event)

  if (!body.familyLine || !body.members) {
    throw createError({ statusCode: 400, message: 'Dữ liệu không hợp lệ' })
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create family line
    const familyLine = await tx.familyLine.create({
      data: {
        name: body.familyLine.name,
        description: body.familyLine.description || null,
        originPlace: body.familyLine.originPlace || null,
      },
    })

    // Create all members without parent references first
    const exportIdToNewId = new Map<number, number>()

    for (const m of body.members) {
      const member = await tx.member.create({
        data: {
          familyLineId: familyLine.id,
          fullName: m.fullName,
          gender: m.gender,
          birthDate: m.birthDate ? new Date(m.birthDate) : null,
          deathDate: m.deathDate ? new Date(m.deathDate) : null,
          isAlive: m.isAlive !== false,
          birthPlace: m.birthPlace || null,
          bio: m.bio || null,
          generation: m.generation || 1,
          birthOrder: m.birthOrder || 1,
        },
      })
      exportIdToNewId.set(m.exportId, member.id)
    }

    // Update parent references
    for (const m of body.members) {
      const newId = exportIdToNewId.get(m.exportId)
      if (!newId) continue

      const fatherId = m.fatherExportId ? exportIdToNewId.get(m.fatherExportId) : null
      const motherId = m.motherExportId ? exportIdToNewId.get(m.motherExportId) : null

      if (fatherId || motherId) {
        await tx.member.update({
          where: { id: newId },
          data: { fatherId: fatherId || null, motherId: motherId || null },
        })
      }
    }

    // Create spouse relationships
    if (body.spouses) {
      for (const s of body.spouses) {
        const memberAId = exportIdToNewId.get(s.memberAExportId)
        const memberBId = exportIdToNewId.get(s.memberBExportId)
        if (memberAId && memberBId) {
          await tx.spouse.create({
            data: {
              memberAId,
              memberBId,
              marriedDate: s.marriedDate ? new Date(s.marriedDate) : null,
            },
          })
        }
      }
    }

    return { familyLineId: familyLine.id, membersImported: body.members.length }
  })

  return { message: 'Nhập dữ liệu thành công', ...result }
})
