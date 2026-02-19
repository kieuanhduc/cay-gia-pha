export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon', 'nuxt-auth-utils'],
  css: [],
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'gia-pha-secret-key-change-me',
    databaseUrl: process.env.DATABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || 'Cây Gia Phả <noreply@example.com>',
    public: {
      appName: 'Cây Gia Phả',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'vi' },
      title: 'Cây Gia Phả',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Giữ gìn và lưu truyền truyền thống gia đình' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,600;0,700&display=swap',
          onload: "this.onload=null;this.rel='stylesheet'",
        },
      ],
      noscript: [
        {
          innerHTML: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,600;0,700&display=swap">',
        },
      ],
    },
  },

  icon: {
    serverBundle: {
      collections: ['ph'],
    },
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
    },
  },

  nitro: {
    compressPublicAssets: { brotli: true, gzip: true },
    minify: true,
  },

  compatibilityDate: '2025-01-01',
})
