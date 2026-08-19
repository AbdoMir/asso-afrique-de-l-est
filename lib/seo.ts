/**
 * Données structurées (JSON-LD) — source unique.
 *
 * Les moteurs ne devinent pas qu'un site associatif décrit une organisation
 * réelle, implantée à une adresse, joignable par téléphone. Sans balisage, la
 * page reste du texte ; avec lui, elle devient une entité que Google peut
 * relier à une recherche locale (« association aide administrative
 * Strasbourg ») et afficher avec ses coordonnées.
 *
 * Le type `NGO` est la spécialisation de `Organization` prévue pour les
 * organisations à but non lucratif. Toutes les valeurs proviennent de
 * `lib/association.ts` ou des pages publiques : ne jamais baliser une
 * information qui n'est pas visible sur le site.
 */

import {
  ASSOCIATION_ADDRESS,
  ASSOCIATION_NAME,
  ASSOCIATION_SIREN,
} from '@/lib/association'

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://asso.afrique.est-sa.org'

const EMAIL =
  process.env.NEXT_PUBLIC_ASSOCIATION_EMAIL ||
  'asso.afrique.est.et.ses.amis@outlook.fr'

const PHONE = '+33605675911'

/** Décomposition de ASSOCIATION_ADDRESS, que schema.org attend en champs. */
const STREET = '1 rue de Graffenstaden'
const POSTAL_CODE = '67380'
const CITY = 'Lingolsheim'

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': `${SITE_URL}/#organization`,
    name: ASSOCIATION_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description:
      "Association de droit local qui accompagne les familles d'Afrique de l'Est " +
      "(Somalie, Somaliland, Éthiopie, Soudan, Érythrée, Djibouti) dans leur " +
      "intégration en France : cours de français (FLE), soutien scolaire, " +
      "accompagnement vers l'emploi et traduction.",
    foundingDate: '2025',
    address: {
      '@type': 'PostalAddress',
      streetAddress: STREET,
      postalCode: POSTAL_CODE,
      addressLocality: CITY,
      addressRegion: 'Grand Est',
      addressCountry: 'FR',
    },
    email: EMAIL,
    telephone: PHONE,
    identifier: {
      '@type': 'PropertyValue',
      name: 'SIREN',
      value: ASSOCIATION_SIREN.replace(/\s/g, ''),
    },
    areaServed: [
      { '@type': 'City', name: 'Strasbourg' },
      { '@type': 'AdministrativeArea', name: 'Eurométropole de Strasbourg' },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: "accueil et accompagnement des familles",
      telephone: PHONE,
      email: EMAIL,
      availableLanguage: ['fr', 'ar', 'so', 'am', 'en'],
    },
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: ASSOCIATION_NAME,
    inLanguage: 'fr-FR',
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

/**
 * Fil d'Ariane balisé. Les pages en affichent déjà un visuellement ; le
 * balisage le rend exploitable par Google, qui remplace alors l'URL brute du
 * résultat par le chemin de navigation.
 */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

/**
 * `FAQPage` n'est légitime que si les questions et réponses sont réellement
 * visibles sur la page — c'est le cas sur /adherer-soutenir, où elles sont
 * rendues dans des <details>. Ne pas réutiliser ailleurs sans contenu associé.
 */
export function faqJsonLd(entries: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.q,
      acceptedAnswer: { '@type': 'Answer', text: entry.a },
    })),
  }
}
