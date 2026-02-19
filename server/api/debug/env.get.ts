// Debug API - XÓA SAU KHI DEBUG XONG!
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  
  return {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    hasJwtSecret: !!config.jwtSecret,
    jwtSecretLength: config.jwtSecret?.length || 0,
    hasDatabaseUrl: !!config.databaseUrl,
    hasSupabaseKey: !!config.supabaseServiceKey,
    // KHÔNG return giá trị thật!
  }
})
