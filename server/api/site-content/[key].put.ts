import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const key = getRouterParam(event, 'key') as string
  const body = await readBody(event)

  const allowed = ['about', 'contact_info']
  if (!allowed.includes(key)) throw createError({ statusCode: 400, message: 'Key không hợp lệ' })

  const item = await prisma.siteContent.upsert({
    where: { key },
    create: { key, content: body.content || '' },
    update: { content: body.content || '' },
  })

  return item
})
