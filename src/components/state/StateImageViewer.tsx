'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StateImageViewerProps {
  currentStateImage: string | null
  futureStateImage: string | null
  viewMode: 'current_image' | 'future_image' | 'compare'
  onValidate?: (type: 'current' | 'future', approved: boolean) => void
  avatarColor: string
}

export function StateImageViewer({
  currentStateImage,
  futureStateImage,
  viewMode,
  onValidate,
  avatarColor,
}: StateImageViewerProps) {
  const [compareView, setCompareView] = useState<'current' | 'future'>('current')

  if (viewMode === 'compare') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 gap-4">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setCompareView('current')}
            className="px-4 py-1.5 rounded-full text-xs transition-all"
            style={{
              background: compareView === 'current' ? avatarColor : 'rgba(255,255,255,.05)',
              color: compareView === 'current' ? '#fff' : 'rgba(255,255,255,.5)',
              fontFamily: 'var(--font-jetbrains-mono)',
            }}
          >
            Current State
          </button>
          <button
            onClick={() => setCompareView('future')}
            className="px-4 py-1.5 rounded-full text-xs transition-all"
            style={{
              background: compareView === 'future' ? avatarColor : 'rgba(255,255,255,.05)',
              color: compareView === 'future' ? '#fff' : 'rgba(255,255,255,.5)',
              fontFamily: 'var(--font-jetbrains-mono)',
            }}
          >
            Future State
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={compareView}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg"
            style={{ perspective: '1000px' }}
          >
            {(compareView === 'current' ? currentStateImage : futureStateImage) ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={compareView === 'current' ? currentStateImage || '' : futureStateImage || ''}
                alt={`${compareView} state diagram`}
                className="w-full rounded-xl"
                style={{ border: '1px solid rgba(255,255,255,.08)' }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 rounded-xl" style={{ border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.02)' }}>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.75rem' }}
                >
                  No image yet
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Validation buttons for compare mode */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => onValidate?.('future', true)}
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={{
              background: avatarColor,
              color: '#fff',
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: '0.8rem',
            }}
          >
            Approve future state
          </button>
          <button
            onClick={() => onValidate?.('future', false)}
            className="px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,.05)',
              color: 'rgba(255,255,255,.6)',
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: '0.8rem',
            }}
          >
            Make changes
          </button>
        </div>
      </div>
    )
  }

  // Single image view (current_image or future_image)
  const type = viewMode === 'current_image' ? 'current' : 'future'
  const image = type === 'current' ? currentStateImage : futureStateImage
  const label = type === 'current' ? 'CURRENT STATE' : 'FUTURE STATE'

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 gap-6">
      <div
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: avatarColor, fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        {label}
      </div>

      {image ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={`${label} diagram`}
            className="w-full rounded-xl"
            style={{
              border: '1px solid rgba(255,255,255,.08)',
              boxShadow: `0 8px 40px ${avatarColor}15`,
            }}
          />
        </motion.div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              color: 'rgba(255,255,255,.3)',
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: '0.75rem',
            }}
          >
            Generating diagram...
          </motion.div>
        </div>
      )}

      {image && (
        <div className="flex gap-3">
          <button
            onClick={() => onValidate?.(type, true)}
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={{
              background: avatarColor,
              color: '#fff',
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: '0.8rem',
            }}
          >
            Looks good
          </button>
          <button
            onClick={() => onValidate?.(type, false)}
            className="px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,.05)',
              color: 'rgba(255,255,255,.6)',
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: '0.8rem',
            }}
          >
            Make changes
          </button>
        </div>
      )}
    </div>
  )
}
