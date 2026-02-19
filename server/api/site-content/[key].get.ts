import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key') as string
  const item = await prisma.siteContent.findUnique({ where: { key } })
  return { key, content: item?.content || '' }
})
