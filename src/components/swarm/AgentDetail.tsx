'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AgentResult, AgentCodeSnippet } from '@/lib/types'
import { AGENT_MAP } from '@/lib/agent-definitions'

// Reuse the syntax highlighter from workorders
const TS_KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'const', 'let', 'var', 'function',
  'class', 'interface', 'type', 'enum', 'extends', 'implements', 'return',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'try', 'catch', 'throw', 'finally', 'new', 'this', 'super', 'async',
  'await', 'yield', 'typeof', 'instanceof', 'in', 'of', 'as', 'is',
  'readonly', 'private', 'protected', 'public', 'static', 'abstract',
  'constructor', 'get', 'set', 'true', 'false', 'null', 'undefined', 'void',
  'create', 'table', 'not', 'exists', 'primary', 'key', 'references',
  'on', 'delete', 'cascade', 'text', 'uuid', 'int', 'boolean', 'jsonb',
  'select', 'insert', 'update', 'where', 'index', 'enable', 'row',
  'level', 'security', 'policy', 'alter', 'default',
])

function highlightCode(code: string, accentColor: string): React.ReactNode[] {
  const lines = code.split('\n')
  return lines.map((line, lineIdx) => {
    const tokens: React.ReactNode[] = []
    let remaining = line
    let pos = 0

    while (remaining.length > 0) {
      const commentMatch = remaining.match(/^(\/\/.*)/) || remaining.match(/^(--.*)/)
      if (commentMatch) {
        tokens.push(<span key={`${lineIdx}-${pos}`} style={{ color: 'rgba(255,255,255,.28)' }}>{commentMatch[1]}</span>)
        remaining = remaining.slice(commentMatch[1].length)
        pos += commentMatch[1].length
        continue
      }

      const strMatch = remaining.match(/^(`[^`]*`|'[^']*'|"[^"]*")/)
      if (strMatch) {
        tokens.push(<span key={`${lineIdx}-${pos}`} style={{ color: '#a8d8a8' }}>{strMatch[1]}</span>)
        remaining = remaining.slice(strMatch[1].length)
        pos += strMatch[1].length
        continue
      }

      const numMatch = remaining.match(/^(\b\d[\d_]*\.?\d*\b)/)
      if (numMatch) {
        tokens.push(<span key={`${lineIdx}-${pos}`} style={{ color: '#d4a8ff' }}>{numMatch[1]}</span>)
        remaining = remaining.slice(numMatch[1].length)
        pos += numMatch[1].length
        continue
      }

      const wordMatch = remaining.match(/^(\w+)/)
      if (wordMatch) {
        const word = wordMatch[1]
        if (TS_KEYWORDS.has(word.toLowerCase())) {
          tokens.push(<span key={`${lineIdx}-${pos}`} style={{ color: accentColor, fontWeight: 600 }}>{word}</span>)
        } else if (word.charAt(0) === word.charAt(0).toUpperCase() && word.charAt(0) !== word.charAt(0).toLowerCase()) {
          tokens.push(<span key={`${lineIdx}-${pos}`} style={{ color: '#f0c674' }}>{word}</span>)
        } else {
          tokens.push(<span key={`${lineIdx}-${pos}`}>{word}</span>)
        }
        remaining = remaining.slice(word.length)
        pos += word.length
        continue
      }

      tokens.push(<span key={`${lineIdx}-${pos}`}>{remaining.charAt(0)}</span>)
      remaining = remaining.slice(1)
      pos++
    }

    return (
      <div key={lineIdx} className="flex">
        <span className="select-none shrink-0 text-right pr-4" style={{ color: 'rgba(255,255,255,.15)', width: '3.5rem', fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace', fontSize: '0.72rem' }}>
          {lineIdx + 1}
        </span>
        <span className="flex-1">{tokens}</span>
      </div>
    )
  })
}

function CodeSnippetBlock({ snippet, accentColor }: { snippet: AgentCodeSnippet; accentColor: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,.35)', border: '1px solid rgba(255,255,255,.06)' }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,.1)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,.1)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,.1)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,.3)', marginLeft: '0.5rem' }}>
            {snippet.filename}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-all hover:brightness-110"
          style={{
            background: copied ? accentColor + '30' : 'rgba(255,255,255,.06)',
            color: copied ? accentColor : 'rgba(255,255,255,.5)',
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            fontSize: '0.65rem',
            border: `1px solid ${copied ? accentColor + '40' : 'rgba(255,255,255,.08)'}`,
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto overflow-y-auto p-4" style={{ maxHeight: '400px', fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace', fontSize: '0.75rem', lineHeight: '1.65', color: 'rgba(255,255,255,.85)' }}>
        {highlightCode(snippet.code, accentColor)}
      </div>
      {snippet.description && (
        <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(255,255,255,.04)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--ink-20)', fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace' }}>
            {snippet.description}
          </p>
        </div>
      )}
    </div>
  )
}

interface AgentDetailProps {
  result: AgentResult
  accentColor: string
  avatarName?: string
  avatarEmoji?: string
  avatarTrait?: string
  onRerun: () => void
  isRerunning: boolean
  onGenerateImage?: () => void
}

export function AgentDetail({
  result,
  accentColor,
  avatarName,
  avatarEmoji,
  avatarTrait,
  onRerun,
  isRerunning,
  onGenerateImage,
}: AgentDetailProps) {
  const definition = AGENT_MAP[result.agentId]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="col-span-full"
      >
        <div
          className="rounded-2xl p-6 mt-2 mb-4"
          style={{
            background: 'rgba(255,255,255,.02)',
            border: `1px solid ${accentColor}25`,
          }}
        >
          {/* Header with avatar personality */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-lg">{definition?.name ?? result.agentId}</h3>
                {avatarName && (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5"
                    style={{
                      background: accentColor + '15',
                      color: accentColor,
                      border: `1px solid ${accentColor}25`,
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                      fontSize: '0.6rem',
                    }}
                  >
                    {avatarEmoji} {avatarName}
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--ink-20)' }}>
                {definition?.description}
              </p>
              {avatarTrait && (
                <p className="text-xs mt-1 italic" style={{ color: accentColor + 'aa' }}>
                  {avatarTrait}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Generate Image button */}
              {onGenerateImage && result.imageDescription && !result.imageUrl && (
                <button
                  onClick={onGenerateImage}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all hover:brightness-110 flex items-center gap-1.5"
                  style={{
                    background: 'rgba(255,255,255,.04)',
                    color: 'rgba(255,255,255,.5)',
                    border: '1px solid rgba(255,255,255,.08)',
                    fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Generate Visual
                </button>
              )}
              {/* Re-run button */}
              <button
                onClick={onRerun}
                disabled={isRerunning}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all hover:brightness-110 flex items-center gap-2 disabled:opacity-50"
                style={{
                  background: accentColor + '15',
                  color: accentColor,
                  border: `1px solid ${accentColor}30`,
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                }}
              >
                {isRerunning ? (
                  <>
                    <span className="w-3 h-3 rounded-full animate-pulse" style={{ background: accentColor }} />
                    Re-running...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 2v6h-6" />
                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                      <path d="M3 22v-6h6" />
                      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                    </svg>
                    Re-run Agent
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated visual image */}
          {result.imageUrl && (
            <div className="mb-6">
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  border: `1px solid ${accentColor}25`,
                  background: 'rgba(0,0,0,.2)',
                }}
              >
                <img
                  src={result.imageUrl}
                  alt={`${definition?.name} analysis visual`}
                  className="w-full max-h-80 object-contain"
                />
              </div>
            </div>
          )}

          {/* Image placeholder when description exists but no image yet (mock mode) */}
          {!result.imageUrl && result.imageDescription && (
            <div className="mb-6">
              <div
                className="rounded-xl p-8 flex flex-col items-center justify-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}03)`,
                  border: `1px dashed ${accentColor}20`,
                  minHeight: '160px',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: accentColor + '50' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p
                  className="text-center max-w-md"
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    color: accentColor + '60',
                    lineHeight: '1.6',
                  }}
                >
                  {result.imageDescription}
                </p>
              </div>
            </div>
          )}

          {/* Analysis */}
          <div className="mb-6">
            <h4
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: accentColor }}
            >
              Analysis
            </h4>
            <div
              className="text-sm leading-relaxed"
              style={{ color: 'rgba(255,255,255,.75)' }}
            >
              {result.analysis.split('\n').map((line, i) => {
                if (line.startsWith('### ')) {
                  return <h4 key={i} className="font-semibold mt-4 mb-2 text-white">{line.replace('### ', '')}</h4>
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={i} className="font-semibold text-white">{line.replace(/\*\*/g, '')}</p>
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <div key={i} className="flex gap-2 ml-2 mb-1">
                      <span style={{ color: accentColor }}>•</span>
                      <span>{line.slice(2)}</span>
                    </div>
                  )
                }
                if (line.startsWith('| ')) {
                  return (
                    <div key={i} style={{ fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace', fontSize: '0.72rem' }}>
                      {line}
                    </div>
                  )
                }
                if (line.trim() === '') return <div key={i} className="h-2" />
                return <p key={i} className="mb-1">{line}</p>
              })}
            </div>
          </div>

          {/* Code Snippets */}
          {result.codeSnippets.length > 0 && (
            <div className="mb-6">
              <h4
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                Generated Code ({result.codeSnippets.length} {result.codeSnippets.length === 1 ? 'file' : 'files'})
              </h4>
              <div className="flex flex-col gap-4">
                {result.codeSnippets.map((snippet, i) => (
                  <CodeSnippetBlock key={i} snippet={snippet} accentColor={accentColor} />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="mb-4">
              <h4
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                Recommendations
              </h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,.7)' }}>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                      style={{ background: accentColor + '15', color: accentColor }}
                    >
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Estimated Hours */}
          {result.estimatedHours && (
            <div
              className="flex items-center gap-2 pt-4 mt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ink-20)' }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  fontSize: '0.72rem',
                  color: 'var(--ink-20)',
                }}
              >
                Estimated: ~{result.estimatedHours} hours
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
