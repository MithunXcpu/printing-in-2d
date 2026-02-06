'use client'

import { useEffect, useState, type ReactNode } from 'react'

// Dynamically import Clerk components to avoid build-time errors when keys are missing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ClerkComponents: Record<string, any> | null = null

/**
 * Auth-aware sign-in/sign-out buttons.
 * When Clerk is not configured, renders the fallback (or nothing).
 */
export function AuthButtons({ fallback }: { fallback?: ReactNode }) {
  const [clerk, setClerk] = useState(ClerkComponents)

  useEffect(() => {
    if (clerk) return
    // Only try to load Clerk at runtime — skips if publishable key is missing
    import('@clerk/nextjs')
      .then((mod) => {
        ClerkComponents = mod
        setClerk(mod)
      })
      .catch(() => {
        // Clerk not available — stay in unauthenticated mode
      })
  }, [clerk])

  if (!clerk) {
    return <>{fallback}</>
  }

  const { SignedIn, SignedOut, SignInButton, UserButton } = clerk

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className="px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-all hover:text-white"
            style={{
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.08)',
              color: 'rgba(255,255,255,.5)',
              fontFamily: 'var(--font-outfit), Outfit, sans-serif',
            }}
          >
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: 'w-9 h-9' } }}
        />
      </SignedIn>
    </>
  )
}

/**
 * CTA button that adapts to auth state.
 * Signed out → "Get Started" (opens sign-in modal)
 * Signed in → "Start Building" (links to /build)
 * No Clerk → "Start Building" (links to /build)
 */
export function AuthCTA() {
  const [clerk, setClerk] = useState(ClerkComponents)

  useEffect(() => {
    if (clerk) return
    import('@clerk/nextjs')
      .then((mod) => {
        ClerkComponents = mod
        setClerk(mod)
      })
      .catch(() => {})
  }, [clerk])

  const ctaStyle = {
    background: 'var(--green-400)',
    color: '#fff',
    boxShadow: '0 8px 32px rgba(45,128,20,.25)',
  }

  const arrow = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  if (!clerk) {
    return (
      <a
        href="/build"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all hover:translate-y-[-2px]"
        style={ctaStyle}
      >
        Start Building {arrow}
      </a>
    )
  }

  const { SignedIn, SignedOut, SignInButton } = clerk

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all hover:translate-y-[-2px] cursor-pointer"
            style={ctaStyle}
          >
            Get Started {arrow}
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <a
          href="/build"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all hover:translate-y-[-2px]"
          style={ctaStyle}
        >
          Start Building {arrow}
        </a>
      </SignedIn>
    </>
  )
}
