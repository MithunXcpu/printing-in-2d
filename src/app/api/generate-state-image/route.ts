const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: Request) {
  const { type, summary, steps, tools, painPoints, profile } = (await request.json()) as {
    type: 'current' | 'future'
    summary: string
    steps: string[]
    tools?: string[]
    painPoints?: string[]
    profile?: { name?: string; role?: string; industry?: string }
  }

  if (!GEMINI_API_KEY) {
    return Response.json({ imageUrl: null })
  }

  const stateLabel = type === 'current' ? 'CURRENT STATE' : 'FUTURE STATE'
  const profileContext = profile?.name ? `For: ${profile.name}` : ''
  const roleContext = profile?.role ? `, ${profile.role}` : ''
  const industryContext = profile?.industry ? ` in ${profile.industry}` : ''

  const stepsList = steps.map((s: string, i: number) => `${i + 1}. ${s}`).join(' → ')
  const toolsList = tools?.length ? `Tools/Systems: ${tools.join(', ')}` : ''
  const painList = painPoints?.length ? `Key points: ${painPoints.join(', ')}` : ''

  const prompt = `Generate a clean, professional workflow diagram image.

Style: Black and white, Visio/PowerPoint style, clean lines, professional.
- Dark background (#0d1208)
- White/light gray boxes with rounded corners
- Thin white connecting arrows between steps
- Step labels INSIDE boxes in clean sans-serif font
- Title at top: "${stateLabel}"
- Minimal, professional, consistent
- NO color accents, just white/gray on dark

Type: ${stateLabel}
Process: ${summary}
Steps: ${stepsList}
${toolsList}
${painList}
${profileContext}${roleContext}${industryContext}

Layout: Horizontal flow, left to right. If more than 5 steps, wrap to second row.
Each box should contain the step name and a small icon/symbol.
Size: 1024x1024.
Do NOT include any watermarks or branding.`

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      }
    )

    if (!response.ok) {
      console.error('Gemini error:', response.status, await response.text())
      return Response.json({ imageUrl: null })
    }

    const data = await response.json()
    const parts = data.candidates?.[0]?.content?.parts || []

    for (const part of parts) {
      if (part.inlineData) {
        const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`
        return Response.json({ imageUrl })
      }
    }

    return Response.json({ imageUrl: null })
  } catch (error) {
    console.error('State image generation error:', error)
    return Response.json({ imageUrl: null })
  }
}
