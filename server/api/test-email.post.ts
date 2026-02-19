import { requireRole } from '~/server/utils/auth'
import { sendMail, isMailConfigured } from '~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  const user = requireRole(event, 'admin')
  const body = await readBody(event)
  const to = body.to?.trim()

  if (!to) {
    throw createError({ statusCode: 400, message: 'Vui lòng nhập địa chỉ email' })
  }

  if (!isMailConfigured()) {
    throw createError({
      statusCode: 400,
      message: 'SMTP chưa được cấu hình. Vui lòng thiết lập SMTP_HOST, SMTP_USER, SMTP_PASS trong file .env',
    })
  }

  try {
    await sendMail(
      to,
      '🧪 Test email từ Cây Gia Phả',
      `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a5f, #2d5a87); padding: 24px; border-radius: 12px 12px 0 0;">
            <h2 style="color: #fff; margin: 0;">✅ Test email thành công!</h2>
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 14px;">
              Email này xác nhận rằng hệ thống gửi email của <strong>Cây Gia Phả</strong> đã được cấu hình đúng.
            </p>
            <p style="color: #374151; font-size: 14px;">
              Hệ thống sẽ tự động gửi thông báo nhắc nhở ngày giỗ trước <strong>3 ngày</strong> vào <strong>8:00 sáng</strong> hàng ngày.
            </p>
            <p style="margin-top: 16px; font-size: 13px; color: #9ca3af;">
              Email tự động từ hệ thống Cây Gia Phả
            </p>
          </div>
        </div>
      `,
    )

    return { success: true, message: `Đã gửi test email đến ${to}` }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: `Gửi email thất bại: ${err.message}`,
    })
  }
})
