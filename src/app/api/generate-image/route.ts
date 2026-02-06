import type { WorkflowNodeType } from '@/lib/types'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

function hasGeminiKey(): boolean {
  return !!GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '' && !GEMINI_API_KEY.startsWith('your-')
}

function hasOpenAIKey(): boolean {
  return !!OPENAI_API_KEY && OPENAI_API_KEY.trim() !== '' && !OPENAI_API_KEY.startsWith('your-')
}

function buildPrompt(label: string, description: string | undefined, type: WorkflowNodeType): string {
  const typeHint: Record<WorkflowNodeType, string> = {
    source: 'data input, file upload, database, API connection, cloud service',
    processor: 'data processing, transformation, pipeline, calculation, filter',
    decision: 'decision logic, branching, conditional routing, AI classification',
    output: 'output delivery, report generation, dashboard display, notification, email',
    ai: 'artificial intelligence, machine learning, neural network, AI processing',
  }
  const hint = typeHint[type] || 'technology'
  const desc = description ? ` — ${description}` : ''

  return `Generate a single clean minimal flat icon. Dark background (#0d1208). Subject: "${label}"${desc}. Style: centered symbolic icon, vibrant neon glow, modern tech aesthetic (${hint}). No text, no labels, no borders. Single object only. 256x256.`
}

/**
 * Generate image using Nano Banana (Gemini 2.5 Flash Image)
 * Free tier: ~500 images/day via Google AI Studio
 */
async function generateWithNanoBanana(prompt: string): Promise<string | null> {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('Nano Banana error:', response.status, error)
    return null
  }

  const data = await response.json()
  const parts = data.candidates?.[0]?.content?.parts || []

  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`
    }
  }

  return null
}

/**
 * Generate image using DALL-E 3 (fallback)
 */
async function generateWithDallE(prompt: string): Promise<string | null> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('DALL-E API error:', error)
    return null
  }

  const data = await response.json()
  return data.data?.[0]?.url || null
}

export async function POST(request: Request) {
  const { label, description, type } = (await request.json()) as {
    label: string
    description?: string
    type: WorkflowNodeType
  }

  // No image generation keys → gracefully return null
  if (!hasGeminiKey() && !hasOpenAIKey()) {
    return Response.json({ imageUrl: null })
  }

  try {
    const prompt = buildPrompt(label, description, type)

    // Try Nano Banana (Gemini) first (free tier), then fall back to DALL-E
    let imageUrl: string | null = null

    if (hasGeminiKey()) {
      imageUrl = await generateWithNanoBanana(prompt)
    }

    if (!imageUrl && hasOpenAIKey()) {
      imageUrl = await generateWithDallE(prompt)
    }

    return Response.json({ imageUrl })
  } catch (error) {
    console.error('Image generation error:', error)
    return Response.json({ imageUrl: null })
  }
}
