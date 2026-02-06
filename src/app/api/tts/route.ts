const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1'

// Default voice (Rachel) — used when no voiceId specified
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'

function hasElevenLabsKey(): boolean {
  return !!ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'your-elevenlabs-key-here' && ELEVENLABS_API_KEY.trim() !== ''
}

export async function POST(request: Request) {
  const { text, voiceId } = (await request.json()) as {
    text: string
    voiceId?: string
  }

  if (!hasElevenLabsKey()) {
    return new Response('ElevenLabs not configured', { status: 503 })
  }

  if (!text || text.trim().length === 0) {
    return new Response('No text provided', { status: 400 })
  }

  try {
    const voice = voiceId || DEFAULT_VOICE_ID

    const response = await fetch(
      `${ELEVENLABS_BASE}/text-to-speech/${voice}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: text.slice(0, 5000), // ElevenLabs has a char limit
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs API error:', response.status, error)
      return new Response('ElevenLabs API error', { status: 502 })
    }

    // Stream the audio response directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return new Response('TTS error', { status: 500 })
  }
}
