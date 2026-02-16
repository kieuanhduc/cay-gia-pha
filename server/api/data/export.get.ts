import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const { familyLineId } = getQuery(event)

  if (!familyLineId) {
    throw createError({ statusCode: 400, message: 'Vui lòng chọn dòng họ' })
  }

  const familyLine = await prisma.familyLine.findUnique({
    where: { id: Number(familyLineId) },
    include: {
      members: {
        include: {
          spousesAsA: true,
        },
        orderBy: [{ generation: 'asc' }, { birthOrder: 'asc' }],
      },
    },
  })

  if (!familyLine) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy dòng họ' })
  }

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    familyLine: {
      name: familyLine.name,
      description: familyLine.description,
      originPlace: familyLine.originPlace,
    },
    members: familyLine.members.map((m) => ({
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
    })),
    spouses: familyLine.members.flatMap((m) =>
      m.spousesAsA.map((s) => ({
        memberAExportId: s.memberAId,
        memberBExportId: s.memberBId,
        marriedDate: s.marriedDate,
      }))
    ),
  }

  const safeFilename = encodeURIComponent(familyLine.name)
  setHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''gia-pha-${safeFilename}.json`)
  return exportData
})
