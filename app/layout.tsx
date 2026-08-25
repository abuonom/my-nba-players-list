import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NBA 2K Players',
  description: 'Lista giocatori NBA 2K con filtri e salvataggio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
