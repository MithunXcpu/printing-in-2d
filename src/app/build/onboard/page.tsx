'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [animating, setAnimating] = useState(false)

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
    }, 350)
    return () => clearTimeout(timer)
  }, [step])

  // Redirect if no avatar selected
  useEffect(() => {
    if (!avatarKey) {
      router.push('/build')
    }
  }, [avatarKey, router])

  const goNext = useCallback(() => {
    if (animating) return
    if (step < TOTAL_STEPS - 1) {
      setDirection('forward')
      setAnimating(true)
      setTimeout(() => {
        setStep((s) => s + 1)
        setAnimating(false)
      }, 300)
    }
  }, [step, animating])

  const goBack = useCallback(() => {
    if (animating) return
    if (step > 0) {
      setDirection('backward')
      setAnimating(true)
      setTimeout(() => {
        setStep((s) => s - 1)
        setAnimating(false)
      }, 300)
    }
  }, [step, animating])

  const handleFinish = useCallback(() => {
    // Save all onboarding data to profile
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
    true, // Outcome is optional
  ][step]

  const stepLabels = [
    `Step 2 of 5 — What's your name?`,
    `Step 3 of 5 — What do you do?`,
    `Step 4 of 5 — What wastes your time?`,
    `Step 5 of 5 — Dream outcome`,
  ]

  return (
    <>
      <TopBar status={stepLabels[step]} />
      <main className="pt-14 min-h-screen flex flex-col items-center justify-center px-8">
        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                background: i <= step ? avatar.color : 'rgba(255,255,255,.1)',
                opacity: i <= step ? 1 : 0.4,
              }}
            />
          ))}
        </div>

        {/* Step container with animation */}
        <div
          className="w-full max-w-lg transition-all duration-300 ease-out"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating
              ? direction === 'forward'
                ? 'translateX(-20px)'
                : 'translateX(20px)'
              : 'translateX(0)',
          }}
        >
          {/* Step 0: Name */}
          {step === 0 && (
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-full mx-auto mb-5 overflow-hidden"
                style={{
                  background: avatar.gradient,
                  boxShadow: `0 0 24px ${avatar.glow}`,
                }}
              >
                {avatar.photoUrl ? (
                  <img src={avatar.photoUrl} alt={avatar.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {avatar.emoji}
                  </div>
                )}
              </div>
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
                className="w-full text-center text-xl py-3 px-4 rounded-xl bg-transparent outline-none transition-all"
                style={{
                  border: `1.5px solid ${name ? avatar.color + '60' : 'rgba(255,255,255,.1)'}`,
                  color: '#fff',
                  fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                }}
              />
            </div>
          )}

          {/* Step 1: Role + Industry */}
          {step === 1 && (
            <div className="text-center">
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
                placeholder="e.g. Operations Manager, Data Analyst, Founder"
                className="w-full text-center text-lg py-3 px-4 rounded-xl bg-transparent outline-none transition-all mb-4"
                style={{
                  border: `1.5px solid ${role ? avatar.color + '60' : 'rgba(255,255,255,.1)'}`,
                  color: '#fff',
                  fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                }}
              />
              <div className="flex flex-wrap justify-center gap-2">
                {INDUSTRY_OPTIONS.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                    style={{
                      background: industry === ind ? avatar.color + '25' : 'rgba(255,255,255,.04)',
                      border: `1px solid ${industry === ind ? avatar.color + '60' : 'rgba(255,255,255,.08)'}`,
                      color: industry === ind ? avatar.senderColor : 'rgba(255,255,255,.5)',
                    }}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Pain Point */}
          {step === 2 && (
            <div className="text-center">
              <h2
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.02em' }}
              >
                What wastes your time?
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--ink-20)' }}>
                Think about something you do every week that feels like it should be automated.
              </p>
              <textarea
                ref={painRef}
                value={painPoint}
                onChange={(e) => setPainPoint(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a repetitive task..."
                rows={3}
                className="w-full text-base py-3 px-4 rounded-xl bg-transparent outline-none transition-all resize-none"
                style={{
                  border: `1.5px solid ${painPoint ? avatar.color + '60' : 'rgba(255,255,255,.1)'}`,
                  color: '#fff',
                  fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                  lineHeight: 1.6,
                }}
              />
              {/* Example chips */}
              <div className="flex flex-col gap-2 mt-4">
                {PAIN_POINT_EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPainPoint(ex)}
                    className="px-4 py-2 rounded-lg text-xs text-left transition-all cursor-pointer hover:translate-x-1"
                    style={{
                      background: 'rgba(255,255,255,.03)',
                      border: '1px solid rgba(255,255,255,.06)',
                      color: 'rgba(255,255,255,.45)',
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    }}
                  >
                    &ldquo;{ex}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Desired Outcome */}
          {step === 3 && (
            <div className="text-center">
              <h2
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', letterSpacing: '-0.02em' }}
              >
                What&apos;s the dream outcome?
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--ink-20)' }}>
                If this tool worked perfectly, what would be different?
              </p>
              <textarea
                ref={outcomeRef}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what success looks like..."
                rows={3}
                className="w-full text-base py-3 px-4 rounded-xl bg-transparent outline-none transition-all resize-none"
                style={{
                  border: `1.5px solid ${outcome ? avatar.color + '60' : 'rgba(255,255,255,.1)'}`,
                  color: '#fff',
                  fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                  lineHeight: 1.6,
                }}
              />
              {/* Example chips */}
              <div className="flex flex-col gap-2 mt-4">
                {OUTCOME_EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setOutcome(ex)}
                    className="px-4 py-2 rounded-lg text-xs text-left transition-all cursor-pointer hover:translate-x-1"
                    style={{
                      background: 'rgba(255,255,255,.03)',
                      border: '1px solid rgba(255,255,255,.06)',
                      color: 'rgba(255,255,255,.45)',
                      fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
                    }}
                  >
                    &ldquo;{ex}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3 mt-10">
          {step > 0 && (
            <button
              onClick={goBack}
              className="px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:translate-y-[-1px]"
              style={{
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)',
                color: 'rgba(255,255,255,.6)',
              }}
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
              boxShadow: canProceed ? `0 4px 20px ${avatar.glow}` : 'none',
            }}
          >
            {step === TOTAL_STEPS - 1 ? 'Start Building' : 'Continue'}
          </button>
        </div>

        {/* Enter hint */}
        <p
          className="mt-4 text-xs"
          style={{
            color: 'rgba(255,255,255,.2)',
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
          }}
        >
          press enter to continue
        </p>
      </main>
    </>
  )
}
