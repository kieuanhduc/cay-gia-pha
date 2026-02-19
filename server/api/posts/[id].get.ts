import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) throw createError({ statusCode: 404, message: 'Không tìm thấy bài viết' })
  return post
})
