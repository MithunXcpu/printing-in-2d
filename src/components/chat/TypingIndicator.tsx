'use client'

interface TypingIndicatorProps {
  color?: string
}

export function TypingIndicator({ color = 'var(--green-300)' }: TypingIndicatorProps) {
  return (
    <div className="flex gap-[5px] px-4 py-3.5 self-start">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: color,
            animation: 'typeDot 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}
