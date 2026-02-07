import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Outfit, Fraunces, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Printing in 2D — Talk. Build. Ship.',
  description: 'Meet your AI co-builder. Pick one. Start talking. Watch it build working software from conversation.',
}

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#2d8014',
    colorBackground: '#0d1208',
    colorInputBackground: '#151a10',
    colorText: 'rgba(255,255,255,.9)',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const body = (
    <html lang="en">
      <body className={`${outfit.variable} ${fraunces.variable} ${jetbrainsMono.variable} antialiased`}>
        <div className="texture" />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(20, 26, 14, 0.95)',
              border: '1px solid rgba(255,255,255,.08)',
              color: '#fafcf8',
              backdropFilter: 'blur(16px)',
              fontFamily: 'var(--font-outfit)',
            },
          }}
        />
      </body>
    </html>
  )

  if (!hasClerk) return body

  return (
    <ClerkProvider appearance={clerkAppearance}>
      {body}
    </ClerkProvider>
  )
}
