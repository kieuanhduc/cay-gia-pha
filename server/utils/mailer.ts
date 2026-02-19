import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  const config = useRuntimeConfig()

  if (!config.smtpHost || !config.smtpUser) {
    return null
  }

  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort) || 587,
    secure: Number(config.smtpPort) === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  })

  return transporter
}

export async function sendMail(to: string, subject: string, html: string) {
  const transport = getTransporter()
  if (!transport) {
    throw new Error('SMTP chưa được cấu hình. Vui lòng thiết lập SMTP_HOST, SMTP_USER, SMTP_PASS trong .env')
  }

  const config = useRuntimeConfig()

  return transport.sendMail({
    from: config.smtpFrom,
    to,
    subject,
    html,
  })
}

export function isMailConfigured(): boolean {
  const config = useRuntimeConfig()
  return !!(config.smtpHost && config.smtpUser)
}
