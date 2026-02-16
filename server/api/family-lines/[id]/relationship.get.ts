import prisma from '~/server/utils/prisma'
import { findRelationship } from '~/server/utils/relationship'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const familyLineId = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const memberAId = Number(query.memberA)
  const memberBId = Number(query.memberB)

  if (!memberAId || !memberBId) {
    throw createError({ statusCode: 400, message: 'Vui lòng chọn đầy đủ hai thành viên' })
  }

  const familyLine = await prisma.familyLine.findUnique({
    where: { id: familyLineId },
    select: { id: true },
  })

  if (!familyLine) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy dòng họ' })
  }

  // Fetch all members of the family line
  const members = await prisma.member.findMany({
    where: { familyLineId },
    select: {
      id: true,
      fullName: true,
      gender: true,
      generation: true,
      birthOrder: true,
      fatherId: true,
      motherId: true,
    },
  })

  // Fetch all spouse records involving members in this family line
  const memberIds = members.map((m) => m.id)
  const spouses = await prisma.spouse.findMany({
    where: {
      OR: [
        { memberAId: { in: memberIds } },
        { memberBId: { in: memberIds } },
      ],
    },
    select: {
      memberAId: true,
      memberBId: true,
    },
  })

  // Verify both members belong to this family line
  const memberAExists = members.some((m) => m.id === memberAId)
  const memberBExists = members.some((m) => m.id === memberBId)

  if (!memberAExists || !memberBExists) {
    throw createError({ statusCode: 400, message: 'Thành viên không thuộc dòng họ này' })
  }

  const result = findRelationship(members, spouses, memberAId, memberBId)

  if (!result) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy mối quan hệ giữa hai thành viên' })
  }

  return result
})
