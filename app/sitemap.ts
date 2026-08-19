import type { MetadataRoute } from 'next'
import { LOCALE_TAGS, PAGES, pathFor, TRANSLATED_PAGES, type PageKey } from '@/lib/i18n'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asso.afrique.est-sa.org'

/**
 * `lastModified` était calculé avec `new Date()` : chaque génération annonçait
 * que l'intégralité du site venait d'être modifiée. Le signal, toujours au
 * maximum, ne distingue plus rien et finit ignoré. On déclare donc une date
 * réelle, à mettre à jour quand le contenu change vraiment.
 */
const LAST_MODIFIED = '2026-08-19'

const PRIORITIES: Record<PageKey, number> = {
  home: 1,
  actions: 0.9,
  appointment: 0.9,
  support: 0.9,
  about: 0.8,
  focus: 0.8,
  contact: 0.8,
  partners: 0.6,
}

/** Pages qui n'existent qu'en français : elles n'ont pas d'équivalent traduit. */
const FRENCH_ONLY = [
  { path: '/legal/mentions-legales', priority: 0.3 },
  { path: '/legal/confidentialite', priority: 0.3 },
  { path: '/legal/statuts', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(LAST_MODIFIED)

  /**
   * Chaque page est déclarée une fois par langue, et chaque entrée liste ses
   * traductions en `alternates`. Le sitemap répète ainsi les hreflang des pages
   * elles-mêmes, ce que Google recommande pour lever toute ambiguïté.
   */
  const translated: MetadataRoute.Sitemap = PAGES.flatMap((page) => {
    const locales = TRANSLATED_PAGES[page]

    const languages = Object.fromEntries(
      locales.map((locale) => [LOCALE_TAGS[locale], `${siteUrl}${pathFor(page, locale)}`])
    )

    return locales.map((locale) => ({
      url: `${siteUrl}${pathFor(page, locale)}`,
      lastModified,
      changeFrequency: page === 'home' ? ('weekly' as const) : ('monthly' as const),
      priority: locale === 'fr' ? PRIORITIES[page] : PRIORITIES[page] - 0.1,
      alternates: { languages },
    }))
  })

  const frenchOnly: MetadataRoute.Sitemap = FRENCH_ONLY.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority,
  }))

  return [...translated, ...frenchOnly]
}
