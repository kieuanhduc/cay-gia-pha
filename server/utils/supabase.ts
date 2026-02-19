import { createClient } from '@supabase/supabase-js'

// Supabase client cho server-side storage operations
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const config = useRuntimeConfig()
  
  const dbUrl = config.databaseUrl || process.env.DATABASE_URL || ''
  
  // Extract project ref từ connection string
  // Format: postgresql://postgres.PROJECT_REF:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
  const match = dbUrl.match(/postgres\.([^:]+):/)
  const projectRef = match ? match[1] : ''
  
  if (!projectRef) {
    throw new Error('Cannot extract Supabase project reference from DATABASE_URL')
  }

  // Supabase URL format: https://PROJECT_REF.supabase.co
  const supabaseUrl = `https://${projectRef}.supabase.co`
  
  // Service role key từ env (cần thêm vào .env)
  const supabaseKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY || ''
  
  if (!supabaseKey) {
    throw new Error('SUPABASE_SERVICE_KEY is required for storage operations')
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })

  return supabaseClient
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadToSupabase(
  bucket: string,
  path: string,
  file: Buffer | Blob,
  contentType?: string
): Promise<string> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    })

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Upload failed: ${error.message}`,
    })
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromSupabase(
  bucket: string,
  path: string
): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Delete failed:', error)
    // Don't throw - không quan trọng lắm nếu xóa fail
  }
}
