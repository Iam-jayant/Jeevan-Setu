import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { LanguageProvider } from '@/contexts/language-context'
import ClientDebugWrapper from "@/components/layout/ClientDebugWrapper"

export const metadata: Metadata = {
  title: 'Jeevan Setu',
  description:
    'A centralised platform for donors and recipients for organ donation. Created by Jayant Kurekar and Team Xenos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <ClientDebugWrapper />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
