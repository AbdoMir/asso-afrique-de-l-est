/**
 * Configuration multilingue — français, anglais, arabe.
 *
 * Le français n'a **pas** de préfixe d'URL : ses pages sont déjà indexées et
 * soumises à la Search Console. Les déplacer vers /fr/ imposerait une
 * redirection 301 sur l'intégralité du site et une perte de positions le temps
 * que Google recompose son index. L'anglais et l'arabe s'ajoutent donc à côté,
 * sous /en/ et /ar/, sans rien déranger.
 */

export const LOCALES = ['fr', 'en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/** L'arabe s'écrit de droite à gauche : le sens de lecture suit la langue. */
export function isRtl(locale: Locale): boolean {
  return locale === 'ar'
}

/** Étiquettes du sélecteur de langue, chacune écrite dans sa propre langue. */
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
}

/** Abréviations du sélecteur compact, quand la place manque pour le nom entier. */
export const LOCALE_SHORT: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
  ar: 'AR',
}
/** Codes complets pour `og:locale`, `hreflang` et l'attribut `lang`. */
export const LOCALE_TAGS: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  ar: 'ar',
}

/**
 * Identifiants de page, indépendants de l'URL.
 *
 * Les slugs sont traduits : un anglophone cherche « our actions », pas « nos
 * actions ». Passer par une clé stable évite d'avoir à retrouver, dans chaque
 * lien, quelle langue emploie quel chemin.
 */
export const PAGES = [
  'home',
  'about',
  'actions',
  'focus',
  'partners',
  'support',
  'contact',
  'appointment',
] as const
export type PageKey = (typeof PAGES)[number]

const SLUGS: Record<PageKey, Record<Locale, string>> = {
  home:        { fr: '',                 en: '',            ar: '' },
  about:       { fr: 'qui-sommes-nous',  en: 'about-us',    ar: 'من-نحن' },
  actions:     { fr: 'nos-actions',      en: 'our-actions', ar: 'أنشطتنا' },
  focus:       { fr: 'nos-focus',        en: 'our-focus',   ar: 'محاورنا' },
  partners:    { fr: 'partenaires',      en: 'partners',    ar: 'شركاؤنا' },
  support:     { fr: 'adherer-soutenir', en: 'support-us',  ar: 'ادعمنا' },
  contact:     { fr: 'contact',          en: 'contact',     ar: 'اتصل-بنا' },
  appointment: { fr: 'rendez-vous',      en: 'appointment', ar: 'موعد' },
}

/**
 * Langues réellement disponibles, page par page.
 *
 * La traduction se fait par étapes. Tant qu'une page n'existe pas dans une
 * langue, il ne faut ni lier vers elle — le visiteur tomberait sur un 404 —
 * ni la déclarer en `hreflang`, ce que Google traite comme une erreur. Ce
 * tableau est donc la source unique : y ajouter une langue suffit à activer
 * partout les liens et les balises correspondants.
 */
export const TRANSLATED_PAGES: Record<PageKey, readonly Locale[]> = {
  home: ['fr', 'en', 'ar'],
  about: ['fr', 'en', 'ar'],
  actions: ['fr', 'en', 'ar'],
  focus: ['fr', 'en', 'ar'],
  partners: ['fr', 'en', 'ar'],
  support: ['fr', 'en', 'ar'],
  contact: ['fr', 'en', 'ar'],
  appointment: ['fr', 'en', 'ar'],
}

function availableLocale(page: PageKey, locale: Locale): Locale {
  return TRANSLATED_PAGES[page].includes(locale) ? locale : DEFAULT_LOCALE
}

/**
 * Chemin d'une page dans une langue donnée.
 *
 * Si la page n'est pas encore traduite, renvoie la version française : mieux
 * vaut conduire un visiteur anglophone vers une page française lisible que
 * vers une URL inexistante.
 */
export function pathFor(page: PageKey, locale: Locale): string {
  const effective = availableLocale(page, locale)
  const slug = SLUGS[page][effective]
  const prefix = effective === DEFAULT_LOCALE ? '' : `/${effective}`
  if (!slug) return prefix || '/'
  return `${prefix}/${slug}`
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://asso.afrique.est-sa.org'

/**
 * Balises `hreflang` d'une page : elles indiquent à Google que les URL
 * listées sont le même contenu en plusieurs langues, et non des pages
 * concurrentes. Seules les langues où la page existe vraiment sont déclarées.
 * `x-default` désigne la version servie à un visiteur dont la langue n'est
 * couverte par aucune.
 */
export function alternatesFor(page: PageKey, locale: Locale) {
  const available = TRANSLATED_PAGES[page]

  const languages: Record<string, string> = {}
  for (const l of available) {
    languages[LOCALE_TAGS[l]] = `${SITE_URL}${pathFor(page, l)}`
  }
  languages['x-default'] = `${SITE_URL}${pathFor(page, DEFAULT_LOCALE)}`

  return {
    canonical: `${SITE_URL}${pathFor(page, locale)}`,
    languages,
  }
}

/**
 * Retrouve la page et la langue correspondant à une URL.
 *
 * Sert au sélecteur de langue : depuis /en, il doit pouvoir proposer / et /ar.
 * Renvoie `null` pour les pages non traduites (mentions légales, espace
 * adhérent), que l'appelant renverra alors vers l'accueil de la langue choisie.
 */
export function pageFromPath(pathname: string): { page: PageKey; locale: Locale } | null {
  const clean = pathname.replace(/\/+$/, '') || '/'

  for (const page of PAGES) {
    for (const locale of TRANSLATED_PAGES[page]) {
      if (pathFor(page, locale) === clean) return { page, locale }
    }
  }
  return null
}

/** Slug d'une page dans une langue — sans préfixe ni barre oblique. */
export function slugFor(page: PageKey, locale: Locale): string {
  return SLUGS[page][availableLocale(page, locale)]
}

/**
 * Opération inverse : à quelle page correspond ce slug, dans cette langue ?
 * Sert à la route dynamique /[locale]/[slug], qui sert les sept pages
 * traduites depuis un seul fichier.
 */
export function pageFromSlug(slug: string, locale: Locale): PageKey | null {
  for (const page of PAGES) {
    if (page === 'home') continue
    if (!TRANSLATED_PAGES[page].includes(locale)) continue
    if (SLUGS[page][locale] === slug) return page
  }
  return null
}

/**
 * Lien de connexion depuis la page de rendez-vous.
 *
 * L'espace adhérent n'existe qu'en français : le chemin reste sans préfixe.
 * Seule la redirection de retour suit la langue, pour que le visiteur retrouve
 * la page de réservation dans la langue où il l'avait quittée.
 */
export function localizedLoginPath(locale: Locale): string {
  return `/login?redirect=${encodeURIComponent(pathFor('appointment', locale))}`
}
