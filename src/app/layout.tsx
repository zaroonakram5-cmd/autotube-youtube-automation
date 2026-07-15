import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AutoTube - AI-Powered YouTube Automation',
  description: 'Create stunning YouTube videos with AI - scripts, voiceovers, images, and rendering all in one platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-background antialiased">
          {children}
        </div>
      </body>
    </html>
  )
}
