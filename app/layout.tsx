import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Veriphy — Veille Réglementaire Pesticides',
  description: 'Service d\'alertes réglementaires pesticides pour l\'export agricole',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-tx font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
