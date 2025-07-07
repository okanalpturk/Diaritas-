import type { Metadata } from 'next'
import './globals.css'
import { ProfileProvider } from '@/contexts/ProfileContext'

export const metadata: Metadata = {
  title: 'Diaritas - RPG Life Tracker',
  description: 'Turn your daily activities into RPG-style character progression',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-white min-h-screen">
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  )
}