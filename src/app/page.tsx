'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { AuthButtons, AuthCTA } from '@/components/auth/AuthButtons'
import { useRef } from 'react'

/* ── DATA ── */

const features = [
  {
    icon: '🎙',
    title: 'Talk',
    desc: 'Tell your AI avatar what wastes your time. It interviews you to understand the problem deeply.',
    detail: 'Natural conversation, not forms.',
  },
  {
    icon: '⚡',
    title: 'Design',
    desc: 'Watch it design a workflow in real-time — nodes, connections, logic — built live as you speak.',
    detail: 'Visual builder, zero config.',
  },
  {
    icon: '🚀',
    title: 'Build',
    desc: 'Export your micro tool blueprint. A focused automation that gives you hours back every week.',
    detail: 'One tool. Massive leverage.',
  },
]

const examples = [
  { from: 'Excel', to: 'Online report', icon: '📊' },
  { from: 'Screenshot', to: 'Notes', icon: '📸' },
  { from: 'Invoice PDF', to: 'Spreadsheet', icon: '📄' },
  { from: 'Email', to: 'CRM entry', icon: '📧' },
  { from: 'Meeting notes', to: 'Tasks', icon: '📝' },
]

const steps = [
  { num: '01', label: 'Pick an avatar', desc: 'Choose the AI personality that matches your style.' },
  { num: '02', label: 'Have a conversation', desc: 'Describe what wastes your time. The AI digs deeper.' },
  { num: '03', label: 'Get your tool', desc: 'A working micro-tool, built from your conversation.' },
]

/* ── SMOOTH EASING ── */
const smoothEase = [0.16, 1, 0.3, 1] as const

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.96])

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="gradient-mesh" />

      {/* Floating ambient orbs — CSS only */}
      <div className="ambient-orbs" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      {/* Auth controls top-right */}
      <div className="fixed top-6 right-8 z-50 flex items-center gap-3">
        <AuthButtons />
      </div>

      {/* ═══ HERO ═══ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 md:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: smoothEase }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-sm font-medium mb-10 glass"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--green-300)', animation: 'onlinePulse 2s ease-in-out infinite' }}
            />
            <span style={{ color: 'var(--green-300)' }}>Now in early access</span>
          </motion.div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl tracking-tight mb-8 leading-none"
            style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.04em' }}
          >
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: smoothEase }}
              className="block"
            >
              Build micro tools
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: smoothEase }}
              className="block mt-1"
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
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg md:text-xl lg:text-2xl font-light mb-12 leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--ink-20)' }}
          >
            Tell your AI avatar what wastes your time.
            <br className="hidden md:block" />
            Watch it design a focused tool to fix it — live.
          </motion.p>

          {/* Example transforms */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-14"
          >
            {examples.map((ex, i) => (
              <motion.div
                key={ex.from}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + i * 0.1, ease: smoothEase }}
                className="example-pill"
              >
                <span className="example-pill-icon">{ex.icon}</span>
                <span className="example-pill-from">{ex.from}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.3 }}>
                  <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="example-pill-to">{ex.to}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3, ease: smoothEase }}
            className="flex flex-col items-center gap-4"
          >
            <div className="cta-glow-wrapper">
              <AuthCTA />
            </div>
            <span
              className="text-xs font-light"
              style={{
                color: 'var(--ink-40)',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                letterSpacing: '0.04em',
              }}
            >
              Free to start. No credit card.
            </span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ color: 'rgba(255,255,255,.15)' }}
          >
            <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
              <rect x="1" y="1" width="18" height="26" rx="9" stroke="currentColor" strokeWidth="1.5" />
              <motion.circle
                cx="10" cy="8" r="2" fill="currentColor"
                animate={{ cy: [8, 16, 8] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative z-10 px-6 md:px-8 pt-8 pb-32">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: smoothEase }}
            className="text-center mb-20"
          >
            <div
              className="inline-block text-xs font-semibold uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full"
              style={{
                color: 'var(--green-300)',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                letterSpacing: '0.12em',
                background: 'rgba(61, 158, 28, 0.08)',
                border: '1px solid rgba(61, 158, 28, 0.12)',
              }}
            >
              How it works
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl tracking-tight mb-4"
              style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.035em' }}
            >
              Three steps.{' '}
              <span className="text-gradient">One tool.</span>
            </h2>
            <p className="text-base md:text-lg font-light max-w-lg mx-auto" style={{ color: 'var(--ink-20)' }}>
              From conversation to automation in minutes.
            </p>
          </motion.div>

          {/* Steps with connecting line */}
          <div className="steps-container">
            {/* Vertical connecting line (visible on md+) */}
            <div className="steps-line" aria-hidden="true" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: smoothEase }}
                className="step-row"
              >
                {/* Step number node */}
                <div className="step-node">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: 'var(--green-300)',
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Step content card */}
                <div className="step-card glass">
                  <h3
                    className="text-xl md:text-2xl mb-2"
                    style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif' }}
                  >
                    {step.label}
                  </h3>
                  <p className="text-sm md:text-base font-light leading-relaxed" style={{ color: 'var(--ink-20)' }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative z-10 px-6 md:px-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: smoothEase }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl md:text-5xl tracking-tight mb-4"
              style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.035em' }}
            >
              Talk. Design. Build.
            </h2>
            <p className="text-base md:text-lg font-light max-w-lg mx-auto" style={{ color: 'var(--ink-20)' }}>
              Each phase is designed to feel effortless.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: smoothEase }}
                className="feature-card glass"
              >
                {/* Top accent line */}
                <div className="feature-card-accent" />

                {/* Icon */}
                <div className="feature-card-icon">
                  <span className="text-3xl">{f.icon}</span>
                </div>

                {/* Step label */}
                <div
                  className="text-xs font-semibold mb-3 uppercase"
                  style={{
                    color: 'var(--green-300)',
                    fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    letterSpacing: '0.1em',
                  }}
                >
                  Step {i + 1}
                </div>

                <h3
                  className="text-2xl md:text-3xl mb-4"
                  style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif' }}
                >
                  {f.title}
                </h3>

                <p className="text-sm md:text-base font-light leading-relaxed mb-5" style={{ color: 'var(--ink-20)' }}>
                  {f.desc}
                </p>

                {/* Detail tag */}
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{
                    color: 'var(--green-200)',
                    background: 'rgba(61, 158, 28, 0.06)',
                    border: '1px solid rgba(61, 158, 28, 0.1)',
                    fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5h6M5 2v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {f.detail}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="relative z-10 px-6 md:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: smoothEase }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="bottom-cta-card glass">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4"
              style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.03em' }}
            >
              Ready to build?
            </h2>
            <p className="text-base md:text-lg font-light mb-8 max-w-md mx-auto" style={{ color: 'var(--ink-20)' }}>
              Start a conversation. Get a tool. It really is that simple.
            </p>
            <div className="cta-glow-wrapper">
              <AuthCTA />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 px-6 md:px-8 pb-12 pt-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--green-400)' }}
            />
            <span
              className="text-xs font-medium"
              style={{
                color: 'var(--ink-40)',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                letterSpacing: '0.06em',
              }}
            >
              Printing in 2D
            </span>
          </div>
          <p
            className="text-xs"
            style={{
              color: 'var(--ink-40)',
              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              letterSpacing: '0.04em',
            }}
          >
            Built by{' '}
            <a
              href="https://portfolio-ebon-five-92.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              style={{ color: 'var(--green-300)' }}
            >
              mithunsnottechnical
            </a>
          </p>
        </motion.div>
      </footer>
    </main>
  )
}
