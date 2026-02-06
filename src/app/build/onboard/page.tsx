'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { TopBar } from '@/components/layout/TopBar'
import { useSessionStore } from '@/stores/session.store'
import { useInterviewStore } from '@/stores/interview.store'
import { AVATAR_PERSONALITIES } from '@/lib/avatar-config'

const TOTAL_STEPS = 4

const INDUSTRY_OPTIONS = [
  'Tech',
  'Finance',
  'Healthcare',
  'Marketing',
  'Retail',
  'Education',
  'Real Estate',
  'Other',
]

const PAIN_POINT_EXAMPLES = [
  'I manually copy data from Excel to our reporting tool',
  'I screenshot receipts and type them into a spreadsheet',
  'I format the same Word doc every week with updated numbers',
]

const OUTCOME_EXAMPLES = [
  'Upload a file and get a formatted report in 10 seconds',
  'Take a photo and have it auto-populate a spreadsheet',
  'One click to generate this week\'s client update',
]

export default function OnboardPage() {
  const router = useRouter()
  const avatarKey = useSessionStore((s) => s.avatarKey)
  const sessionId = useSessionStore((s) => s.sessionId)
  const setPhase = useSessionStore((s) => s.setPhase)
  const updateProfile = useInterviewStore((s) => s.updateProfile)
  const setOnboardingComplete = useInterviewStore((s) => s.setOnboardingComplete)

  const avatar = avatarKey ? AVATAR_PERSONALITIES[avatarKey] : null

  const [step, setStep] = useState(0)

  // Form state
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [industry, setIndustry] = useState('')
  const [painPoint, setPainPoint] = useState('')
  const [outcome, setOutcome] = useState('')

  const nameRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLInputElement>(null)
  const painRef = useRef<HTMLTextAreaElement>(null)
  const outcomeRef = useRef<HTMLTextAreaElement>(null)

  // Focus input on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 0) nameRef.current?.focus()
      else if (step === 1) roleRef.current?.focus()
      else if (step === 2) painRef.current?.focus()
      else if (step === 3) outcomeRef.current?.focus()
    }, 400)
    return () => clearTimeout(timer)
  }, [step])

  // Redirect if no avatar selected
  useEffect(() => {
    if (!avatarKey) {
      router.push('/build')
    }
  }, [avatarKey, router])

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1)
    }
  }, [step])

  const goBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1)
    }
  }, [step])

  const handleFinish = useCallback(() => {
    updateProfile({
      name: name.trim() || undefined,
      role: role.trim() || undefined,
      industry: industry || undefined,
      painPoints: painPoint.trim() ? [painPoint.trim()] : [],
      desiredOutcomes: outcome.trim() ? [outcome.trim()] : [],
    })
    setOnboardingComplete(true)
    setPhase('design')
    router.push(`/build/session/${sessionId}`)
  }, [name, role, industry, painPoint, outcome, updateProfile, setOnboardingComplete, setPhase, sessionId, router])

  const handleSkip = useCallback(() => {
    setOnboardingComplete(true)
    setPhase('design')
    router.push(`/build/session/${sessionId}`)
  }, [setOnboardingComplete, setPhase, sessionId, router])

  // Enter key navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (step === TOTAL_STEPS - 1) {
          handleFinish()
        } else {
          goNext()
        }
      }
    },
    [step, goNext, handleFinish]
  )

  if (!avatar) return null

  const canProceed = [
    name.trim().length > 0,
    role.trim().length > 0,
    painPoint.trim().length > 0,
    true,
  ][step]

  const stepLabels = [
    `Step 2 of 5 — What's your name?`,
    `Step 3 of 5 — What do you do?`,
    `Step 4 of 5 — What wastes your time?`,
    `Step 5 of 5 — Dream outcome`,
  ]

  const inputStyle = (hasValue: boolean) => ({
    border: `1.5px solid ${hasValue ? avatar.color + '50' : 'rgba(255,255,255,.08)'}`,
    color: '#fff',
    fontFamily: 'var(--font-outfit), Outfit, sans-serif',
    background: 'rgba(255,255,255,.03)',
    boxShadow: hasValue ? `0 0 20px ${avatar.glow}` : 'none',
  })

  return (
    <>
      <TopBar status={stepLabels[step]} />
      <main className="pt-14 min-h-screen flex items-center justify-center px-8">
        <div className="grid md:grid-cols-2 gap-16 max-w-4xl w-full items-center">
          {/* Left: Avatar with glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="hidden md:flex flex-col items-center justify-center"
          >
            <div className="relative">
              {/* Glow behind */}
              <div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                  background: avatar.gradient,
                  opacity: 0.15,
                  transform: 'scale(2)',
                  animation: 'glowPulse 4s ease-in-out infinite',
                }}
              />
              <div
                className="w-40 h-40 rounded-full overflow-hidden relative"
                style={{
                  background: avatar.gradient,
                  boxShadow: `0 0 60px ${avatar.glow}`,
                  border: `3px solid ${avatar.color}33`,
                }}
              >
                {avatar.photoUrl ? (
                  <img src={avatar.photoUrl} alt={avatar.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {avatar.emoji}
                  </div>
                )}
              </div>
            </div>
            <div
              className="mt-6 text-center"
              style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontSize: '1.3rem' }}
            >
              {avatar.name}
            </div>
            <div className="text-sm font-light mt-1" style={{ color: 'var(--ink-20)' }}>
              {avatar.trait}
            </div>
          </motion.div>

          {/* Right: Form steps */}
          <div className="flex flex-col items-center md:items-start">
            {/* Progress bar */}
            <div className="w-full max-w-md mb-10">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,.06)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: avatar.color }}
                  animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <div
                className="flex justify-between mt-2"
                style={{
                  fontSize: '0.6rem',
                  color: 'var(--ink-40)',
                  fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                }}
              >
                <span>{step + 1}/{TOTAL_STEPS}</span>
                <button
                  onClick={handleSkip}
                  className="cursor-pointer transition-colors hover:text-white"
                  style={{ color: 'var(--ink-40)' }}
                >
                  Skip all →
                </button>
              </div>
            </div>

            {/* Step content with AnimatePresence */}
            <div className="w-full max-w-md min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step === 0 && (
                    <div>
                      <h2
                        className="text-2xl mb-2"
                        style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.02em' }}
                      >
                        What&apos;s your name?
                      </h2>
                      <p className="text-sm mb-6" style={{ color: 'var(--ink-20)' }}>
                        Just so {avatar.name} knows who they&apos;re talking to.
                      </p>
                      <input
                        ref={nameRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Your first name"
                        className="w-full text-lg py-3 px-4 rounded-xl outline-none transition-all"
                        style={inputStyle(!!name)}
                      />
                    </div>
                  )}

                  {step === 1 && (
                    <div>
                      <h2
                        className="text-2xl mb-2"
                        style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.02em' }}
                      >
                        What do you do?
                      </h2>
                      <p className="text-sm mb-6" style={{ color: 'var(--ink-20)' }}>
                        Help {avatar.name} understand your world.
                      </p>
                      <input
                        ref={roleRef}
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. Operations Manager, Data Analyst"
                        className="w-full text-lg py-3 px-4 rounded-xl outline-none transition-all mb-4"
                        style={inputStyle(!!role)}
                      />
                      <div className="flex flex-wrap gap-2">
                        {INDUSTRY_OPTIONS.map((ind) => (
                          <button
                            key={ind}
                            onClick={() => setIndustry(ind)}
                            className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                            style={{
                              background: industry === ind ? avatar.color + '20' : 'rgba(255,255,255,.03)',
                              border: `1px solid ${industry === ind ? avatar.color + '50' : 'rgba(255,255,255,.06)'}`,
                              color: industry === ind ? avatar.senderColor : 'rgba(255,255,255,.45)',
                            }}
                          >
                            {ind}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <h2
                        className="text-2xl mb-2"
                        style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.02em' }}
                      >
                        What wastes your time?
                      </h2>
                      <p className="text-sm mb-6" style={{ color: 'var(--ink-20)' }}>
                        Something you do every week that should be automated.
                      </p>
                      <textarea
                        ref={painRef}
                        value={painPoint}
                        onChange={(e) => setPainPoint(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe a repetitive task..."
                        rows={3}
                        className="w-full text-base py-3 px-4 rounded-xl outline-none transition-all resize-none"
                        style={{ ...inputStyle(!!painPoint), lineHeight: '1.6' }}
                      />
                      <div className="flex flex-col gap-2 mt-4">
                        {PAIN_POINT_EXAMPLES.map((ex) => (
                          <button
                            key={ex}
                            onClick={() => setPainPoint(ex)}
                            className="px-4 py-2.5 rounded-xl text-xs text-left transition-all cursor-pointer hover:translate-x-1 glass glass-hover"
                            style={{
                              color: 'rgba(255,255,255,.4)',
                              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                            }}
                          >
                            &ldquo;{ex}&rdquo;
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <h2
                        className="text-2xl mb-2"
                        style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.02em' }}
                      >
                        Dream outcome?
                      </h2>
                      <p className="text-sm mb-6" style={{ color: 'var(--ink-20)' }}>
                        If this tool worked perfectly, what changes?
                      </p>
                      <textarea
                        ref={outcomeRef}
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe what success looks like..."
                        rows={3}
                        className="w-full text-base py-3 px-4 rounded-xl outline-none transition-all resize-none"
                        style={{ ...inputStyle(!!outcome), lineHeight: '1.6' }}
                      />
                      <div className="flex flex-col gap-2 mt-4">
                        {OUTCOME_EXAMPLES.map((ex) => (
                          <button
                            key={ex}
                            onClick={() => setOutcome(ex)}
                            className="px-4 py-2.5 rounded-xl text-xs text-left transition-all cursor-pointer hover:translate-x-1 glass glass-hover"
                            style={{
                              color: 'rgba(255,255,255,.4)',
                              fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                            }}
                          >
                            &ldquo;{ex}&rdquo;
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 mt-8">
              {step > 0 && (
                <button
                  onClick={goBack}
                  className="px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:translate-y-[-1px] glass"
                  style={{ color: 'rgba(255,255,255,.6)' }}
                >
                  Back
                </button>
              )}
              <button
                onClick={step === TOTAL_STEPS - 1 ? handleFinish : goNext}
                disabled={!canProceed}
                className="px-7 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all hover:translate-y-[-1px] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: canProceed ? avatar.color : 'rgba(255,255,255,.1)',
                  color: '#fff',
                  boxShadow: canProceed ? `0 4px 24px ${avatar.glow}` : 'none',
                }}
              >
                {step === TOTAL_STEPS - 1 ? 'Start Building →' : 'Continue'}
              </button>
            </div>

            <p
              className="mt-4 text-xs"
              style={{
                color: 'rgba(255,255,255,.15)',
                fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
              }}
            >
              press enter ↵
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
