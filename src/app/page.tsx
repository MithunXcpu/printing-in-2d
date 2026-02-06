import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8">
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
          Meet your AI{' '}
          <em className="italic font-light" style={{ color: 'var(--green-300)' }}>
            co-builder.
          </em>
        </h1>

        <p
          className="text-lg font-light mb-10 leading-relaxed"
          style={{ color: 'var(--ink-20)' }}
        >
          Pick a personality. Describe the outcome. Watch it build working
          software from conversation.
        </p>

        <Link
          href="/build"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all hover:translate-y-[-2px]"
          style={{
            background: 'var(--green-400)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(45,128,20,.25)',
          }}
        >
          Start Building
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </main>
  )
}
