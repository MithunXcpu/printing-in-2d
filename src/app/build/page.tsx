'use client'

import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { AvatarSelector } from '@/components/avatar/AvatarSelector'
import { useSessionStore } from '@/stores/session.store'
import type { AvatarKey } from '@/lib/types'

export default function BuildPage() {
  const router = useRouter()
  const setSession = useSessionStore((s) => s.setSession)

  const handleSelectAvatar = (key: AvatarKey) => {
    const sessionId = `session-${Date.now()}`
    setSession(sessionId, key)
    router.push(`/build/session/${sessionId}`)
  }

  return (
    <>
      <TopBar status="Select your co-builder" />
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <AvatarSelector onSelect={handleSelectAvatar} />
      </main>
    </>
  )
}
