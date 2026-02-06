'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TopBar } from '@/components/layout/TopBar'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with AI-powered workflow building',
    features: [
      '3 sessions per month',
      '1 AI avatar personality',
      'Basic workflow diagrams',
      'Export to JSON',
    ],
    cta: 'Get Started',
    href: '/build',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Unlimited sessions with all avatars and premium features',
    features: [
      'Unlimited sessions',
      'All 4 AI avatars',
      'Live video avatars (Tavus)',
      'Voice input & screen share',
      'AI image generation',
      'Session history & resume',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    href: null,
    highlight: true,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current', email: '' }),
      })
      const { url, error } = await response.json()
      if (url) {
        window.location.href = url
      } else {
        console.error('Checkout error:', error)
        alert('Payments are not configured yet. Please try again later.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar status="Choose your plan" />
      <main className="pt-20 min-h-screen flex flex-col items-center px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1
            className="text-4xl md:text-5xl tracking-tight mb-3"
            style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.03em' }}
          >
            Simple{' '}
            <em className="italic font-light text-gradient">pricing</em>
          </h1>
          <p
            className="text-base font-light mb-14"
            style={{ color: 'var(--ink-20)' }}
          >
            Start free. Upgrade when you need more.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl w-full">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`rounded-3xl p-8 flex flex-col relative overflow-hidden ${
                plan.highlight ? 'border-gradient' : 'glass'
              }`}
              style={{
                background: plan.highlight
                  ? 'linear-gradient(135deg, rgba(61,158,28,.12), rgba(61,158,28,.04))'
                  : undefined,
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {/* Most Popular badge */}
              {plan.highlight && (
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(61,158,28,.15)',
                    color: 'var(--green-300)',
                    border: '1px solid rgba(61,158,28,.25)',
                    fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Most Popular
                </div>
              )}

              <div
                className="text-sm font-semibold mb-3"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  color: plan.highlight ? 'var(--green-300)' : 'var(--ink-20)',
                  letterSpacing: '0.06em',
                }}
              >
                {plan.name}
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                <span style={{ color: 'var(--ink-20)', fontSize: '0.85rem' }}>{plan.period}</span>
              </div>
              <p className="text-sm mb-8" style={{ color: 'var(--ink-20)', lineHeight: 1.6 }}>
                {plan.description}
              </p>
              <ul className="flex-1 mb-8 space-y-3">
                {plan.features.map((f, fi) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + fi * 0.06 }}
                    className="flex items-center gap-2.5 text-sm"
                    style={{ color: 'rgba(255,255,255,.8)' }}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                      style={{
                        background: plan.highlight ? 'rgba(61,158,28,.15)' : 'rgba(255,255,255,.05)',
                        color: 'var(--green-300)',
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </motion.li>
                ))}
              </ul>
              {plan.href ? (
                <Link
                  href={plan.href}
                  className="w-full text-center py-3 rounded-full font-semibold text-sm transition-all hover:translate-y-[-1px] block glass glass-hover"
                  style={{
                    color: 'rgba(255,255,255,.7)',
                  }}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-3.5 rounded-full font-semibold text-sm transition-all hover:translate-y-[-2px] cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'var(--green-400)',
                    color: '#fff',
                    boxShadow: '0 4px 24px rgba(61,158,28,.3)',
                  }}
                >
                  {loading ? 'Redirecting...' : plan.cta}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </main>
    </>
  )
}
