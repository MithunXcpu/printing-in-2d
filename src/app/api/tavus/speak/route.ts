const TAVUS_API_KEY = process.env.TAVUS_API_KEY
const TAVUS_BASE = 'https://tavusapi.com/v2'

export async function POST(request: Request) {
  const { conversationId, message } = (await request.json()) as {
    conversationId: string
    message: string
  }

  if (!TAVUS_API_KEY || !conversationId || !message) {
    return new Response('Missing required fields', { status: 400 })
  }

  try {
    const response = await fetch(
      `${TAVUS_BASE}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY,
        },
        body: JSON.stringify({
          message,
          type: 'assistant',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Tavus speak error:', response.status, error)
      return Response.json(
        { error: 'Failed to send message to Tavus' },
        { status: 502 }
      )
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Tavus speak error:', error)
    return Response.json({ error: 'Tavus speak failed' }, { status: 500 })
  }
}
