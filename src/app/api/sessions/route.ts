import { createServerClient } from '@/lib/supabase'

/**
 * POST /api/sessions — Create a new session
 * GET /api/sessions?userId=xxx — List sessions for a user
 */
export async function POST(request: Request) {
  const supabase = createServerClient()
  if (!supabase) {
    // No Supabase: return a client-side UUID
    return Response.json({ id: crypto.randomUUID(), persisted: false })
  }

  const { userId, avatarKey } = (await request.json()) as {
    userId: string
    avatarKey: string
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({ user_id: userId, avatar_key: avatarKey })
    .select('id')
    .single()

  if (error) {
    console.error('Session create error:', error)
    return Response.json({ error: 'Failed to create session' }, { status: 500 })
  }

  return Response.json({ id: data.id, persisted: true })
}

export async function GET(request: Request) {
  const supabase = createServerClient()
  if (!supabase) {
    return Response.json({ sessions: [] })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return Response.json({ error: 'Missing userId' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('sessions')
    .select('id, avatar_key, phase, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Session list error:', error)
    return Response.json({ sessions: [] })
  }

  return Response.json({ sessions: data })
}
