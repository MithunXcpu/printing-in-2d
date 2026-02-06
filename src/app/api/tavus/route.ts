const TAVUS_API_KEY = process.env.TAVUS_API_KEY
const TAVUS_BASE = 'https://tavusapi.com/v2'

function hasTavusKey(): boolean {
  return !!TAVUS_API_KEY && TAVUS_API_KEY !== 'your-tavus-key-here' && TAVUS_API_KEY.trim() !== ''
}

export async function POST(request: Request) {
  const { replicaId, personaId, conversationName } = (await request.json()) as {
    replicaId?: string
    personaId?: string
    conversationName?: string
  }

  if (!hasTavusKey()) {
    return new Response('Tavus not configured', { status: 503 })
  }

  try {
    // Create a Tavus conversation session
    const response = await fetch(`${TAVUS_BASE}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVUS_API_KEY!,
      },
      body: JSON.stringify({
        ...(replicaId ? { replica_id: replicaId } : {}),
        ...(personaId ? { persona_id: personaId } : {}),
        conversation_name: conversationName || 'Printing in 2D Session',
        // Disable Tavus's built-in conversational AI — we control speech via speak() endpoint
        conversational_context:
          'You are a silent video avatar. Do NOT speak on your own. Only speak when explicitly given text via the injection API. Never initiate conversation.',
        custom_greeting: null,
        properties: {
          max_call_duration: 1800, // 30 minutes max
          enable_recording: false,
          language: 'english',
          apply_greenscreen: false,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Tavus API error:', response.status, error)
      return Response.json(
        { error: 'Failed to create Tavus session' },
        { status: 502 }
      )
    }

    const data = await response.json()

    return Response.json({
      conversationId: data.conversation_id,
      conversationUrl: data.conversation_url,
    })
  } catch (error) {
    console.error('Tavus session error:', error)
    return Response.json(
      { error: 'Failed to create Tavus session' },
      { status: 500 }
    )
  }
}

// End a conversation
export async function DELETE(request: Request) {
  const { conversationId } = (await request.json()) as {
    conversationId: string
  }

  if (!hasTavusKey() || !conversationId) {
    return new Response('Not available', { status: 503 })
  }

  try {
    await fetch(`${TAVUS_BASE}/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'x-api-key': TAVUS_API_KEY!,
      },
    })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}
