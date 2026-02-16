import { requireAuth } from '~/server/utils/auth'
import { execSync } from 'child_process'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw createError({ statusCode: 500, message: 'DATABASE_URL không được cấu hình' })
  }

  // Parse mysql://user:pass@host:port/dbname
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(\?.*)?$/)
  if (!match) {
    throw createError({ statusCode: 500, message: 'Không thể phân tích DATABASE_URL' })
  }

  const [, user, password, host, port, database] = match

  try {
    const sql = execSync(
      `mysqldump -u ${user} -p${password} -h ${host} -P ${port} --single-transaction --routines --triggers ${database}`,
      { maxBuffer: 100 * 1024 * 1024, timeout: 60000 }
    )

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    setHeader(event, 'Content-Type', 'application/sql')
    setHeader(event, 'Content-Disposition', `attachment; filename=${database}-${timestamp}.sql`)
    return sql.toString('utf-8')
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: 'Dump MySQL thất bại: ' + (err.stderr?.toString() || err.message),
    })
  }
})
