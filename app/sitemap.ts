import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asso.afrique.est-sa.org'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/qui-sommes-nous',
    '/nos-actions',
    '/nos-focus',
    '/adherer-soutenir',
    '/partenaires',
    '/contact',
    '/rendez-vous',
    '/legal/mentions-legales',
    '/legal/confidentialite',
    '/legal/statuts',
  ]

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))
}
