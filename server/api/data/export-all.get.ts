import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const familyLines = await prisma.familyLine.findMany({
    include: {
      members: {
        include: {
          spousesAsA: true,
          photos: true,
        },
        orderBy: [{ generation: 'asc' }, { birthOrder: 'asc' }],
      },
    },
  })

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    familyLines: familyLines.map((fl) => ({
      name: fl.name,
      description: fl.description,
      originPlace: fl.originPlace,
      members: fl.members.map((m) => ({
        exportId: m.id,
        fullName: m.fullName,
        gender: m.gender,
        birthDate: m.birthDate,
        deathDate: m.deathDate,
        isAlive: m.isAlive,
        birthPlace: m.birthPlace,
        bio: m.bio,
        generation: m.generation,
        birthOrder: m.birthOrder,
        fatherExportId: m.fatherId,
        motherExportId: m.motherId,
        deathAnniversaryLunar: m.deathAnniversaryLunar,
        deathAnniversaryNote: m.deathAnniversaryNote,
      })),
      spouses: fl.members.flatMap((m) =>
        m.spousesAsA.map((s) => ({
          memberAExportId: s.memberAId,
          memberBExportId: s.memberBId,
          marriedDate: s.marriedDate,
        }))
      ),
    })),
  }

  return exportData
})
