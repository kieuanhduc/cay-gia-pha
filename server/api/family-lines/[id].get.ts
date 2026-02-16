import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const familyLine = await prisma.familyLine.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true } },
    },
  })

  if (!familyLine) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy dòng họ' })
  }

  return { ...familyLine, memberCount: familyLine._count.members, _count: undefined }
})
