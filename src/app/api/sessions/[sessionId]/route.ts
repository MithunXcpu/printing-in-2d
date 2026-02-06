import { createServerClient } from '@/lib/supabase'
import { type NextRequest } from 'next/server'

/**
 * GET /api/sessions/[sessionId] — Load full session data
 * PATCH /api/sessions/[sessionId] — Update session (phase, etc.)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const supabase = createServerClient()
  if (!supabase) {
    return Response.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  const { sessionId } = await params

  // Fetch session + all related data in parallel
  const [sessionRes, messagesRes, nodesRes, connectionsRes, profileRes] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', sessionId).single(),
    supabase.from('messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }),
    supabase.from('workflow_nodes').select('*').eq('session_id', sessionId),
    supabase.from('workflow_connections').select('*').eq('session_id', sessionId),
    supabase.from('interview_profiles').select('*').eq('session_id', sessionId).single(),
  ])

  if (sessionRes.error) {
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  return Response.json({
    session: sessionRes.data,
    messages: messagesRes.data || [],
    nodes: nodesRes.data || [],
    connections: connectionsRes.data || [],
    profile: profileRes.data || null,
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const supabase = createServerClient()
  if (!supabase) {
    return Response.json({ ok: true }) // No-op if Supabase not configured
  }

  const { sessionId } = await params
  const updates = await request.json()

  const { error } = await supabase
    .from('sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) {
    console.error('Session update error:', error)
    return Response.json({ error: 'Failed to update session' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
