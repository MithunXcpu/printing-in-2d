'use client'

import { motion } from 'framer-motion'
import { AuthButtons, AuthCTA } from '@/components/auth/AuthButtons'

const features = [
  {
    icon: '🎙',
    title: 'Talk',
    desc: 'Tell your AI avatar what wastes your time. It interviews you to understand the problem.',
  },
  {
    icon: '⚡',
    title: 'Design',
    desc: 'Watch it design a workflow in real-time — nodes, connections, logic — built live as you speak.',
  },
  {
    icon: '🚀',
    title: 'Build',
    desc: 'Export your micro tool blueprint. A focused automation that gives you hours back every week.',
  },
]

const examples = [
  'Excel → online report',
  'Screenshot → notes',
  'Invoice PDF → spreadsheet',
  'Email → CRM entry',
  'Meeting notes → tasks',
]

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="gradient-mesh" />

      {/* Auth controls top-right */}
      <div className="fixed top-6 right-8 z-50 flex items-center gap-3">
        <AuthButtons />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 glass"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--green-300)', animation: 'onlinePulse 2s ease-in-out infinite' }}
            />
            <span style={{ color: 'var(--green-300)' }}>Now in early access</span>
          </motion.div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.04em' }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="block"
            >
              Build micro tools
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="block"
            >
              that{' '}
              <em className="italic font-light text-gradient">
                give you time back.
              </em>
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-lg md:text-xl font-light mb-8 leading-relaxed max-w-xl mx-auto"
            style={{ color: 'var(--ink-20)' }}
          >
            Tell your AI avatar what wastes your time.
            Watch it design a focused tool to fix it — live.
          </motion.p>

          {/* Example pills — scrolling marquee feel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-10"
          >
            {examples.map((example, i) => (
              <motion.span
                key={example}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1 + i * 0.08 }}
                className="px-4 py-2 rounded-full text-xs glass"
                style={{
                  color: 'rgba(255,255,255,.5)',
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  letterSpacing: '0.02em',
                }}
              >
                {example}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="flex items-center gap-4 justify-center"
          >
            <AuthCTA />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ color: 'rgba(255,255,255,.2)' }}
          >
            <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
              <rect x="1" y="1" width="18" height="26" rx="9" stroke="currentColor" strokeWidth="1.5" />
              <motion.circle
                cx="10" cy="8" r="2" fill="currentColor"
                animate={{ cy: [8, 16, 8] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-8 pb-32 pt-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl md:text-4xl tracking-tight mb-3"
              style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.03em' }}
            >
              Three steps. One tool.
            </h2>
            <p className="text-base font-light" style={{ color: 'var(--ink-20)' }}>
              From conversation to automation in minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="glass rounded-2xl p-8 text-center transition-all duration-300 hover:translate-y-[-4px]"
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl"
                  style={{
                    background: 'rgba(61, 158, 28, 0.1)',
                    border: '1px solid rgba(61, 158, 28, 0.15)',
                  }}
                >
                  {f.icon}
                </div>

                {/* Step label */}
                <div
                  className="text-xs font-semibold mb-2 uppercase"
                  style={{
                    color: 'var(--green-300)',
                    fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    letterSpacing: '0.1em',
                  }}
                >
                  Step {i + 1}
                </div>

                <h3
                  className="text-xl mb-3"
                  style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif' }}
                >
                  {f.title}
                </h3>

                <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ink-20)' }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-8 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="text-xs mb-6"
            style={{
              color: 'rgba(255,255,255,.2)',
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              letterSpacing: '0.06em',
            }}
          >
            Built by mithunsnottechnical
          </p>
        </motion.div>
      </section>
    </main>
  )
}
