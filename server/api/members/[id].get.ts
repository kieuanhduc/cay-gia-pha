import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      familyLine: { select: { id: true, name: true } },
      father: { select: { id: true, fullName: true, avatarUrl: true } },
      mother: { select: { id: true, fullName: true, avatarUrl: true } },
      fatherOf: {
        select: { id: true, fullName: true, gender: true, birthDate: true, avatarUrl: true },
        orderBy: { birthOrder: 'asc' },
      },
      motherOf: {
        select: { id: true, fullName: true, gender: true, birthDate: true, avatarUrl: true },
        orderBy: { birthOrder: 'asc' },
      },
      spousesAsA: {
        include: { memberB: { select: { id: true, fullName: true, gender: true, avatarUrl: true } } },
      },
      spousesAsB: {
        include: { memberA: { select: { id: true, fullName: true, gender: true, avatarUrl: true } } },
      },
    },
  })

  if (!member) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy thành viên' })
  }

  // Normalize spouses
  const spouses = [
    ...member.spousesAsA.map((s) => ({ ...s.memberB, marriedDate: s.marriedDate })),
    ...member.spousesAsB.map((s) => ({ ...s.memberA, marriedDate: s.marriedDate })),
  ]

  const children = [...member.fatherOf, ...member.motherOf]
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)

  return { ...member, spouses, children, spousesAsA: undefined, spousesAsB: undefined, fatherOf: undefined, motherOf: undefined }
})
