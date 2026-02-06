import Anthropic from '@anthropic-ai/sdk'
import { getSystemPrompt } from '@/lib/system-prompts'
import { WORKFLOW_TOOLS } from '@/lib/tool-definitions'
import { isMockMode } from '@/lib/mock-mode'
import { MOCK_CONVERSATIONS } from '@/lib/mock-conversations'
import type { AvatarKey } from '@/lib/types'

function createMockStream(
  messages: Array<{ role: string; content: string | Array<Record<string, unknown>> }>,
  avatarKey: AvatarKey
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const conversation = MOCK_CONVERSATIONS[avatarKey]

  // Step index = number of user messages minus 1 (first user message = greeting = step 0)
  const userMessageCount = messages.filter((m) => m.role === 'user').length
  const stepIndex = Math.min(userMessageCount - 1, conversation.steps.length - 1)
  const step = conversation.steps[Math.max(0, stepIndex)]

  return new ReadableStream({
    async start(controller) {
      const emit = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))
      }

      // ── 1. Stream the text response word by word ──
      emit({
        type: 'content_block_start',
        index: 0,
        content_block: { type: 'text', text: '' },
      })

      const words = step.ai.split(' ')
      for (let i = 0; i < words.length; i++) {
        const word = (i === 0 ? '' : ' ') + words[i]
        emit({
          type: 'content_block_delta',
          index: 0,
          delta: { type: 'text_delta', text: word },
        })
        // Simulate typing: 30–80ms per word
        await new Promise((r) => setTimeout(r, 30 + Math.random() * 50))
      }

      emit({ type: 'content_block_stop', index: 0 })

      // ── 2. Stream tool calls ──
      let blockIndex = 1
      for (const tc of step.toolCalls) {
        // Start the tool_use block
        emit({
          type: 'content_block_start',
          index: blockIndex,
          content_block: {
            type: 'tool_use',
            id: `mock_tool_${blockIndex}_${Date.now()}`,
            name: tc.name,
            input: {},
          },
        })

        // Send the full input as one JSON delta
        const inputJson = JSON.stringify(tc.input)
        emit({
          type: 'content_block_delta',
          index: blockIndex,
          delta: { type: 'input_json_delta', partial_json: inputJson },
        })

        emit({ type: 'content_block_stop', index: blockIndex })

        blockIndex++
        // Small delay between tool calls for visual effect
        await new Promise((r) => setTimeout(r, 80))
      }

      // ── 3. Send suggestions (custom mock event) ──
      if (step.options.length > 0) {
        emit({
          type: 'mock_suggestions',
          suggestions: step.options,
        })
      }

      // ── 4. Send commentary (custom mock event) ──
      if (step.commentary) {
        emit({
          type: 'mock_commentary',
          commentary: step.commentary,
        })
      }

      // ── 5. Message delta (end of message) ──
      emit({
        type: 'message_delta',
        delta: { stop_reason: 'end_turn' },
      })

      controller.close()
    },
  })
}

export async function POST(request: Request) {
  const { messages, avatarKey, profile } = (await request.json()) as {
    messages: Array<{ role: 'user' | 'assistant'; content: string | Array<Record<string, unknown>> }>
    avatarKey: AvatarKey
    profile?: import('@/lib/types').UserProfile
  }

  // ── Mock mode: no API key needed ──
  if (isMockMode()) {
    const readable = createMockStream(messages, avatarKey)
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }

  // ── Live mode: real Anthropic API ──
  const anthropic = new Anthropic()
  const systemPrompt = getSystemPrompt(avatarKey, profile)

  // Cast messages to the Anthropic SDK's expected type
  // Messages with multimodal content (image + text) are already in the correct format
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    tools: WORKFLOW_TOOLS,
    tool_choice: { type: 'any' },
    messages: messages as Anthropic.MessageParam[],
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          const data = JSON.stringify(event) + '\n'
          controller.enqueue(encoder.encode(data))
        }
        controller.close()
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error'
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', error: errMsg }) + '\n'))
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
