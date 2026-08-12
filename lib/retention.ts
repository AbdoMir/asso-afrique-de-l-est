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
  /**
   * Journal des accès — 12 mois. La CNIL recommande de conserver les journaux
   * entre 6 mois et 1 an : assez pour enquêter sur un incident, pas au point
   * de constituer un fichier de surveillance des bénévoles.
   */
  auditLog: 12,
  /**
   * Rendez-vous extérieurs — 3 mois après la date du rendez-vous. Assez pour
   * suivre une démarche en cours, trop court pour constituer l'historique
   * médical et administratif d'une personne. Ce sont des données de l'art. 9 :
   * la durée la plus courte utile est ici la bonne.
   */
  externalAppointments: 3,
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
