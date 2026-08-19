import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import '../globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/Toaster'
import { Analytics } from '@vercel/analytics/next'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { getDictionary } from '@/lib/dictionaries'

const dict = getDictionary('fr')

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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asso.afrique.est-sa.org'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Association Afrique de l'Est et ses amis — Intégration en France",
    template: `%s | ${dict.nav.brandShort}`,
  },
  description:
    "Association de droit local qui accompagne les familles d'Afrique de l'Est dans leur intégration en France : cours de français (FLE), aide à la jeunesse, emploi et traduction.",
  keywords: [
    'association', 'afrique de l\'est', 'intégration', 'france', 'familles',
    'cours de français', 'FLE', 'emploi', 'jeunesse', 'traduction', 'association droit local', 'Alsace',
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
  },
  twitter: {
    card: 'summary_large_image',
    title: "Association Afrique de l'Est et ses amis",
    description: "Accompagnons ensemble les familles d'Afrique de l'Est.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: '6sy_gigvCArx_-xo9daToAIrJ5FdObZw2_nEUF_5EGE',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col bg-warm-50">
        <a href="#main-content" className="skip-nav">
          {dict.nav.skipToContent}
        </a>
        <Header dict={dict.nav} locale="fr" />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer dict={dict} locale="fr" />
        <Toaster />
        <Analytics />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  )
}
