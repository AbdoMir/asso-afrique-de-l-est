import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ActionsPage } from '@/components/pages/ActionsPage'
import { FocusPage } from '@/components/pages/FocusPage'
import { AboutPage } from '@/components/pages/AboutPage'
import { PartnersPage } from '@/components/pages/PartnersPage'
import { SupportPage } from '@/components/pages/SupportPage'
import { ContactPage } from '@/components/pages/ContactPage'
import { AppointmentPage } from '@/components/pages/AppointmentPage'
import { getDictionary, type Dictionary } from '@/lib/dictionaries'
import {
  alternatesFor,
  isLocale,
  pageFromSlug,
  PAGES,
  slugFor,
  TRANSLATED_PAGES,
  type Locale,
  type PageKey,
} from '@/lib/i18n'

/**
 * Toutes les pages traduites autres que l'accueil, servies par un seul
 * fichier.
 *
 * Les slugs diffèrent d'une langue à l'autre — /en/our-actions,
 * /ar/أنشطتنا — d'où le segment dynamique plutôt qu'un dossier par page et
 * par langue. `pageFromSlug` fait la correspondance inverse, et
 * `generateStaticParams` n'énumère que les couples réellement traduits :
 * toute autre URL renvoie un 404 au lieu d'entrer dans l'index.
 */
export const dynamicParams = false

type Renderer = (props: { locale: Locale }) => React.ReactNode

/** Une page n'est routable que si le dictionnaire porte ses textes. */
type TranslatedPage = keyof Dictionary['pages']

/**
 * Une entrée par page traduite. Une page absente d'ici reste hors du routage
 * même si elle est déclarée dans `TRANSLATED_PAGES` — les deux doivent avancer
 * ensemble.
 */
const RENDERERS: Partial<Record<TranslatedPage, Renderer>> = {
  actions: ActionsPage,
  focus: FocusPage,
  about: AboutPage,
  partners: PartnersPage,
  support: SupportPage,
  contact: ContactPage,
  appointment: AppointmentPage,
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []

  for (const page of PAGES) {
    if (page === 'home' || !(page in RENDERERS)) continue
    for (const locale of TRANSLATED_PAGES[page]) {
      if (locale === 'fr') continue
      params.push({ locale, slug: slugFor(page, locale) })
    }
  }
  return params
}

function resolve(locale: string, slug: string) {
  if (!isLocale(locale)) return null
  const page = pageFromSlug(decodeURIComponent(slug), locale)
  if (!page || page === 'home' || !(page in RENDERERS)) return null
  return { locale, page: page as TranslatedPage }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const resolved = resolve(locale, slug)
  if (!resolved) return {}

  const t = getDictionary(resolved.locale).pages[resolved.page]

  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: alternatesFor(resolved.page, resolved.locale),
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const resolved = resolve(locale, slug)
  if (!resolved) notFound()

  const Component = RENDERERS[resolved.page]!
  return <Component locale={resolved.locale} />
}
