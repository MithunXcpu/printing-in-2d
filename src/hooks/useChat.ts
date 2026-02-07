'use client'

import { useCallback, useRef } from 'react'
import { useConversationStore } from '@/stores/conversation.store'
import { useWorkflowStore } from '@/stores/workflow.store'
import { useInterviewStore } from '@/stores/interview.store'
import type { AvatarKey, InterviewStage } from '@/lib/types'

interface UseChatOptions {
  onAssistantResponse?: (text: string) => void
  onToolAction?: (action: { type: string; payload: Record<string, unknown> }) => void
}

export function useChat(avatarKey: AvatarKey, options?: UseChatOptions) {
  // Use a ref for options to always call the latest callbacks without
  // causing sendMessage/sendGreeting to be recreated on every render
  const optionsRef = useRef(options)
  optionsRef.current = options
  const profile = useInterviewStore((s) => s.profile)
  const profileRef = useRef(profile)
  profileRef.current = profile
  const addMessage = useConversationStore((s) => s.addMessage)
  const setStreaming = useConversationStore((s) => s.setStreaming)
  const setCurrentStreamingText = useConversationStore((s) => s.setCurrentStreamingText)
  const setInterviewStage = useConversationStore((s) => s.setInterviewStage)
  const setSuggestions = useConversationStore((s) => s.setSuggestions)
  const messages = useConversationStore((s) => s.messages)

  const addNode = useWorkflowStore((s) => s.addNode)
  const revealNode = useWorkflowStore((s) => s.revealNode)
  const addConnection = useWorkflowStore((s) => s.addConnection)
  const setCommentary = useWorkflowStore((s) => s.setCommentary)
  const clearCommentary = useWorkflowStore((s) => s.clearCommentary)

  const updateProfile = useInterviewStore((s) => s.updateProfile)
  const setStage = useInterviewStore((s) => s.setStage)

  const abortRef = useRef<AbortController | null>(null)

  const handleToolCall = useCallback(
    (toolName: string, toolInput: Record<string, unknown>) => {
      switch (toolName) {
        case 'add_workflow_node': {
          const nodeId = toolInput.id as string
          const nodeLabel = toolInput.label as string
          const nodeType = toolInput.type as 'source' | 'processor' | 'decision' | 'output' | 'ai'
          addNode({
            id: nodeId,
            label: nodeLabel,
            type: nodeType,
            icon: (toolInput.icon as string) || '',
            description: toolInput.description as string | undefined,
          })
          setTimeout(() => revealNode(nodeId), 300)
          // Notify session page via onToolAction
          optionsRef.current?.onToolAction?.({ type: 'add_workflow_node', payload: toolInput })
          break
        }
        case 'add_workflow_connection': {
          addConnection({
            from: toolInput.from as string,
            to: toolInput.to as string,
            label: toolInput.label as string | undefined,
          })
          break
        }
        case 'update_interview_stage': {
          const stage = toolInput.stage as InterviewStage
          setInterviewStage(stage)
          setStage(stage)
          if (toolInput.commentary) {
            setCommentary(toolInput.commentary as string)
            setTimeout(() => clearCommentary(), 4000)
          }
          // Notify session page via onToolAction
          optionsRef.current?.onToolAction?.({ type: 'update_interview_stage', payload: toolInput })
          break
        }
        case 'extract_user_context': {
          updateProfile({
            role: toolInput.role as string | undefined,
            department: toolInput.department as string | undefined,
            companyContext: toolInput.company_context as string | undefined,
            desiredOutcomes: toolInput.desired_outcomes as string[] | undefined,
            painPoints: toolInput.pain_points as string[] | undefined,
            currentTools: toolInput.current_tools as string[] | undefined,
          })
          break
        }
        case 'generate_state_image': {
          optionsRef.current?.onToolAction?.({ type: 'generate_state_image', payload: toolInput })
          break
        }
        case 'request_validation': {
          optionsRef.current?.onToolAction?.({ type: 'request_validation', payload: toolInput })
          break
        }
      }
    },
    [addNode, revealNode, addConnection, setCommentary, clearCommentary, setInterviewStage, setStage, updateProfile]
  )

  /**
   * Processes a stream of JSON-line events from the /api/chat endpoint.
   * Handles both real Anthropic events and mock-mode custom events.
   */
  const processStream = useCallback(
    async (reader: ReadableStreamDefaultReader<Uint8Array>, signal?: AbortSignal) => {
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      // Tool call accumulation state
      let currentToolName = ''
      let currentToolInput = ''

      while (true) {
        if (signal?.aborted) break
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)

            // -- Text deltas --
            if (event.type === 'content_block_delta') {
              if (event.delta?.type === 'text_delta') {
                fullText += event.delta.text
                setCurrentStreamingText(fullText)
              }
              if (event.delta?.type === 'input_json_delta') {
                // Accumulate JSON input for the current tool call
                currentToolInput += event.delta.partial_json || ''
              }
            }

            // -- Tool call starting --
            if (event.type === 'content_block_start') {
              if (event.content_block?.type === 'tool_use') {
                currentToolName = event.content_block.name || ''
                currentToolInput = ''
              }
            }

            // -- Content block stop -> dispatch tool call if we have one --
            if (event.type === 'content_block_stop') {
              if (currentToolName && currentToolInput) {
                try {
                  const input = JSON.parse(currentToolInput)
                  handleToolCall(currentToolName, input)
                } catch {
                  console.warn('Failed to parse tool input:', currentToolInput)
                }
                currentToolName = ''
                currentToolInput = ''
              }
            }

            // -- Mock suggestions (custom event) --
            if (event.type === 'mock_suggestions') {
              setSuggestions(event.suggestions || [])
            }

            // -- Mock commentary (custom event) --
            if (event.type === 'mock_commentary') {
              setCommentary(event.commentary || '')
              setTimeout(() => clearCommentary(), 4000)
            }

            // -- Errors --
            if (event.type === 'error') {
              console.error('Stream error:', event.error)
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }

      return fullText
    },
    [setCurrentStreamingText, handleToolCall, setSuggestions, setCommentary, clearCommentary]
  )

  const sendMessage = useCallback(
    async (userMessage: string, imageUrl?: string) => {
      // Clear previous suggestions
      setSuggestions([])

      // Add user message (with optional image)
      addMessage({ role: 'user', content: userMessage, imageUrl })

      // Build the new user message content -- multimodal if image attached
      let newUserContent: string | Array<Record<string, unknown>> = userMessage
      if (imageUrl) {
        // Extract base64 data and media type from data URL
        const match = imageUrl.match(/^data:(image\/\w+);base64,(.+)$/)
        if (match) {
          newUserContent = [
            { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } },
            { type: 'text', text: userMessage },
          ]
        }
      }

      // Build conversation history for API
      const history = [
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: newUserContent },
      ].filter((m) => m.role === 'user' || m.role === 'assistant')

      setStreaming(true)
      setCurrentStreamingText('')

      abortRef.current = new AbortController()

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            avatarKey,
            profile: profileRef.current,
            interviewStage: useConversationStore.getState().interviewStage,
          }),
          signal: abortRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader')

        const fullText = await processStream(reader, abortRef.current.signal)

        // Finalize the assistant message
        if (fullText) {
          addMessage({ role: 'assistant', content: fullText })
          optionsRef.current?.onAssistantResponse?.(fullText)
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Chat error:', error)
          addMessage({
            role: 'system',
            content: 'Connection error. Please try again.',
          })
        }
      } finally {
        setStreaming(false)
        setCurrentStreamingText('')
      }
    },
    [avatarKey, messages, addMessage, setStreaming, setCurrentStreamingText, setSuggestions, processStream]
  )

  // Send initial greeting -- uses onboarding profile data if available
  const sendGreeting = useCallback(async () => {
    setSuggestions([])
    setStreaming(true)
    setCurrentStreamingText('')

    // Build a contextual greeting that includes what the user told us during onboarding
    const p = profileRef.current
    let greetingMsg = 'Hello! I want to build a micro tool for my workflow.'
    if (p?.name || p?.painPoints?.[0]) {
      const parts = []
      if (p.name) parts.push(`My name is ${p.name}.`)
      if (p.role) parts.push(`I'm a ${p.role}${p.industry ? ` in ${p.industry}` : ''}.`)
      if (p.painPoints?.[0]) parts.push(`My main pain point: ${p.painPoints[0]}`)
      if (p.desiredOutcomes?.[0]) parts.push(`What I want: ${p.desiredOutcomes[0]}`)
      greetingMsg = parts.join(' ')
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: greetingMsg }],
          avatarKey,
          profile: profileRef.current,
          interviewStage: useConversationStore.getState().interviewStage,
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const fullText = await processStream(reader)

      if (fullText) {
        addMessage({ role: 'assistant', content: fullText })
        optionsRef.current?.onAssistantResponse?.(fullText)
      }
    } catch (error) {
      console.error('Greeting error:', error)
      addMessage({
        role: 'assistant',
        content: "Hello! I'm here to help you design a micro tool. What repetitive task is eating your time?",
      })
    } finally {
      setStreaming(false)
      setCurrentStreamingText('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarKey, addMessage, setStreaming, setCurrentStreamingText, setSuggestions, processStream])

  return { sendMessage, sendGreeting, handleToolCall }
}
