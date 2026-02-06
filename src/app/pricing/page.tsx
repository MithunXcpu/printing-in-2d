'use client'

import { useState } from 'react'
import Link from 'next/link'
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
    href: null, // triggers checkout
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
        <h1
          className="text-4xl md:text-5xl tracking-tight mb-3 text-center"
          style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.03em' }}
        >
          Simple pricing
        </h1>
        <p
          className="text-base font-light mb-12 text-center"
          style={{ color: 'var(--ink-20)' }}
        >
          Start free. Upgrade when you need more.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl w-full">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-8 flex flex-col"
              style={{
                background: plan.highlight
                  ? 'linear-gradient(135deg, rgba(45,128,20,.15), rgba(45,128,20,.05))'
                  : 'rgba(255,255,255,.03)',
                border: plan.highlight
                  ? '1px solid rgba(45,128,20,.4)'
                  : '1px solid rgba(255,255,255,.06)',
              }}
            >
              <div
                className="text-sm font-semibold mb-2"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                  color: plan.highlight ? 'var(--green-300)' : 'var(--ink-20)',
                  letterSpacing: '0.06em',
                }}
              >
                {plan.name}
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span style={{ color: 'var(--ink-20)', fontSize: '0.85rem' }}>{plan.period}</span>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--ink-20)', lineHeight: 1.5 }}>
                {plan.description}
              </p>
              <ul className="flex-1 mb-8 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: 'rgba(255,255,255,.8)' }}
                  >
                    <span style={{ color: 'var(--green-300)' }}>&#x2713;</span>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.href ? (
                <Link
                  href={plan.href}
                  className="w-full text-center py-3 rounded-full font-semibold text-sm transition-all hover:translate-y-[-1px]"
                  style={{
                    background: 'rgba(255,255,255,.06)',
                    border: '1px solid rgba(255,255,255,.1)',
                    color: 'rgba(255,255,255,.7)',
                  }}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-3 rounded-full font-semibold text-sm transition-all hover:translate-y-[-1px] cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'var(--green-400)',
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(45,128,20,.3)',
                  }}
                >
                  {loading ? 'Redirecting...' : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
