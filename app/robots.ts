import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asso.afrique.est-sa.org'

/**
 * `/login` et `/espace-adherent` ne figurent plus ici : elles portent désormais
 * un `noindex` (voir leurs layouts). Bloquer une URL dans robots.txt empêche le
 * robot de la lire — donc de voir la directive qui l'exclut de l'index. Une
 * page interdite mais pointée par un lien externe peut ainsi rester listée,
 * sans titre ni description. Le noindex, lui, la retire vraiment.
 *
 * Restent bloquées les routes qui n'ont aucune page à explorer : l'API, et
 * l'administration dont chaque écran est déjà en noindex.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
