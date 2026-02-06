import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Check if Supabase is configured
 */
export function hasSupabase(): boolean {
  return !!supabaseUrl && !!supabaseServiceKey && supabaseUrl.includes('supabase.co')
}

/**
 * Server-side Supabase client with service role key.
 * Use this in API routes — has full access to all tables.
 */
let serverClient: SupabaseClient | null = null

export function createServerClient(): SupabaseClient | null {
  if (!hasSupabase()) return null
  if (serverClient) return serverClient
  serverClient = createSupabaseClient(supabaseUrl!, supabaseServiceKey!)
  return serverClient
}
