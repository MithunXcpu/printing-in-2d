import { useState } from 'react'
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen'
import { InterviewScreen } from '@/features/interview/InterviewScreen'
import { SettingsScreen } from '@/features/settings/SettingsScreen'

type Screen = 'onboarding' | 'interview' | 'settings'

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#fff', color: '#111' }}>
      {/* Title bar with drag region */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #e5e5e5',
          // @ts-expect-error Electron-specific CSS property
          WebkitAppRegion: 'drag',
          paddingLeft: 80,
          fontSize: 13,
          fontWeight: 600,
          color: '#333',
          background: '#fafafa',
        }}
      >
        PRINTING IN 2D
      </div>

      {/* Nav tabs - only show after onboarding */}
      {screen !== 'onboarding' && (
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
          {(['interview', 'settings'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScreen(s)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderBottom: screen === s ? '2px solid #4c6ef5' : '2px solid transparent',
                background: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: screen === s ? 600 : 400,
                color: screen === s ? '#4c6ef5' : '#666',
                textTransform: 'capitalize',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {screen === 'onboarding' && (
          <OnboardingScreen onComplete={() => setScreen('interview')} />
        )}
        {screen === 'interview' && <InterviewScreen />}
        {screen === 'settings' && <SettingsScreen />}
      </div>
    </div>
  )
}
