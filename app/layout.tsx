import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/Toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asso-aes.fr'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Association Afrique de l'Est et ses amis — Intégration en France",
    template: "%s | Association Afrique de l'Est et ses amis",
  },
  description:
    "Association loi 1901 qui accompagne les familles d'Afrique de l'Est dans leur intégration en France : cours de français (FLE), aide à la jeunesse, emploi et traduction.",
  keywords: [
    'association', 'afrique de l\'est', 'intégration', 'france', 'familles',
    'cours de français', 'FLE', 'emploi', 'jeunesse', 'traduction', 'loi 1901',
  ],
  authors: [{ name: "Association Afrique de l'Est et ses amis" }],
  creator: "Association Afrique de l'Est et ses amis",
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: "Association Afrique de l'Est et ses amis",
    title: "Association Afrique de l'Est et ses amis",
    description:
      "Accompagnons ensemble les familles d'Afrique de l'Est dans leur intégration en France.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "Association Afrique de l'Est et ses amis",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Association Afrique de l'Est et ses amis",
    description: "Accompagnons ensemble les familles d'Afrique de l'Est.",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        {/* Plausible Analytics — RGPD-friendly, sans cookies */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-warm-50">
        <a href="#main-content" className="skip-nav">
          Aller au contenu principal
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
