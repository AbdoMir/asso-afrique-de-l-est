import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Inter, Outfit } from 'next/font/google'
import '../../globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/Toaster'
import { Analytics } from '@vercel/analytics/next'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { getDictionary } from '@/lib/dictionaries'
import { LOCALE_TAGS, LOCALES, isLocale, isRtl, type Locale } from '@/lib/i18n'

/**
 * Layout racine des versions traduites — /en et /ar.
 *
 * Le français reste servi par app/(fr)/layout.tsx, à la racine des URL. Deux
 * layouts racine cohabitent donc, ce que Next.js autorise via les groupes de
 * routes : c'est le seul moyen de faire varier `lang` et `dir` sur la balise
 * <html>, qu'un layout imbriqué ne peut pas atteindre. Sans cela, une page
 * arabe s'annoncerait en français et serait lue par les lecteurs d'écran avec
 * une voix française.
 */

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asso.afrique.est-sa.org'

/**
 * `[locale]` capturerait n'importe quel segment de premier niveau. En figeant
 * la liste et en refusant les paramètres non prévus, /nimportequoi renvoie un
 * 404 au lieu d'une page vide — et aucune URL parasite n'entre dans l'index.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.filter((locale) => locale !== 'fr').map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const dict = getDictionary(locale)

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: dict.home.meta.title,
      template: `%s | ${dict.nav.brandShort}`,
    },
    description: dict.home.meta.description,
    openGraph: {
      type: 'website',
      locale: LOCALE_TAGS[locale].replace('-', '_'),
      url: `${siteUrl}/${locale}`,
      siteName: "Association Afrique de l'Est et ses amis",
      title: dict.home.meta.title,
      description: dict.home.meta.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.home.meta.title,
      description: dict.home.meta.description,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  }
}

export default async function IntlRootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale) || locale === 'fr') notFound()

  const typed: Locale = locale
  const dict = getDictionary(typed)

  return (
    <html
      lang={LOCALE_TAGS[typed]}
      dir={isRtl(typed) ? 'rtl' : 'ltr'}
      className={`${inter.variable} ${outfit.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-warm-50">
        <a href="#main-content" className="skip-nav">
          {dict.nav.skipToContent}
        </a>
        <Header dict={dict.nav} locale={typed} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer dict={dict} locale={typed} />
        <Toaster />
        <Analytics />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  )
}
