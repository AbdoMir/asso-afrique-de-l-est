/**
 * Durées de conservation des données personnelles.
 *
 * Source de vérité unique : la tâche planifiée /api/cron/purge les applique, la
 * politique de confidentialité les annonce et docs/RGPD.md les documente. Une
 * durée modifiée ici doit être répercutée dans ces deux documents — annoncer
 * une durée qu'on n'applique pas est un manquement à l'art. 13 du RGPD.
 *
 * Les dons, adhésions et reçus fiscaux n'y figurent pas : ils relèvent d'une
 * obligation comptable de 6 ans et ne sont jamais purgés automatiquement.
 */

export const RETENTION_MONTHS = {
  /** Messages de contact — 12 mois après réception. */
  contactMessages: 12,
  /** Créneaux de rendez-vous — 12 mois après le créneau (cascade sur les réservations). */
  appointmentSlots: 12,
  /** Documents déposés par les adhérents — 24 mois après le dépôt. */
  memberDocuments: 24,
} as const

export const RETENTION_DAYS = {
  /** Inscriptions newsletter jamais confirmées : sans confirmation, pas de consentement. */
  unconfirmedNewsletter: 7,
} as const

/** Date limite : tout ce qui est antérieur est purgeable. */
export function cutoffMonthsAgo(months: number, now: Date = new Date()): Date {
  const cutoff = new Date(now)
  cutoff.setMonth(cutoff.getMonth() - months)
  return cutoff
}

/** Date limite exprimée en jours, pour les durées courtes. */
export function cutoffDaysAgo(days: number, now: Date = new Date()): Date {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - days)
  return cutoff
}
