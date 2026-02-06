import type { WorkflowNodeType } from '@/lib/types'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

function hasOpenAIKey(): boolean {
  return !!OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-key-here' && OPENAI_API_KEY.trim() !== ''
}

function buildPrompt(label: string, description: string | undefined, type: WorkflowNodeType): string {
  const typeHint: Record<WorkflowNodeType, string> = {
    source: 'data input, database, API feed',
    processor: 'data processing, transformation, pipeline',
    decision: 'decision logic, branching, AI model',
    output: 'output, report, dashboard, notification',
    ai: 'artificial intelligence, machine learning, neural network',
  }
  const hint = typeHint[type] || 'technology'
  const desc = description ? `: ${description}` : ''

  return `Clean minimal flat icon on a solid dark (#0d1208) background. Subject: "${label}"${desc}. Style: single centered object, vibrant neon glow effect, modern tech aesthetic (${hint}). No text, no labels. 256x256 pixel icon.`
}

export async function POST(request: Request) {
  const { label, description, type } = (await request.json()) as {
    label: string
    description?: string
    type: WorkflowNodeType
  }

  // No API key → gracefully return null
  if (!hasOpenAIKey()) {
    return Response.json({ imageUrl: null })
  }

  try {
    const prompt = buildPrompt(label, description, type)

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
        size: '1024x1024', // DALL-E 3 minimum is 1024x1024
        quality: 'standard',
        response_format: 'url',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('DALL-E API error:', error)
      return Response.json({ imageUrl: null })
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url || null

    return Response.json({ imageUrl })
  } catch (error) {
    console.error('Image generation error:', error)
    return Response.json({ imageUrl: null })
  }
}
