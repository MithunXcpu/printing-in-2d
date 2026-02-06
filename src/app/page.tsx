import { AuthButtons, AuthCTA } from '@/components/auth/AuthButtons'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8">
      {/* Auth controls top-right */}
      <div className="fixed top-6 right-8 z-50 flex items-center gap-3">
        <AuthButtons />
      </div>

      <div className="text-center max-w-2xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
          style={{
            background: 'var(--green-50)',
            border: '1px solid var(--green-100)',
            color: 'var(--green-600)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--green-300)', animation: 'blink 2s ease-in-out infinite' }}
          />
          Now in early access
        </div>

        <h1
          className="text-5xl md:text-7xl tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.03em' }}
        >
          Build micro tools that{' '}
          <em className="italic font-light" style={{ color: 'var(--green-300)' }}>
            give you time back.
          </em>
        </h1>

        <p
          className="text-lg font-light mb-6 leading-relaxed"
          style={{ color: 'var(--ink-20)' }}
        >
          Tell your AI avatar what wastes your time.
          Watch it design a small, focused tool to fix it.
        </p>

        {/* Example use cases */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            'Excel \u2192 online report',
            'Screenshot \u2192 notes',
            'Invoice PDF \u2192 spreadsheet',
          ].map((example) => (
            <span
              key={example}
              className="px-3.5 py-1.5 rounded-full text-xs"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)',
                color: 'rgba(255,255,255,.5)',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                letterSpacing: '0.02em',
              }}
            >
              {example}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 justify-center">
          <AuthCTA />
        </div>
      </div>
    </main>
  )
}
