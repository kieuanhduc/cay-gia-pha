import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin')
  const id = Number(getRouterParam(event, 'id'))

  await prisma.familyLine.delete({ where: { id } })
  return { message: 'Đã xóa dòng họ' }
})
