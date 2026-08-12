import type { AppointmentReason, ExternalAppointmentCategory } from '@/types'

/**
 * Libellés partagés des rendez-vous.
 *
 * Regroupés ici parce qu'ils sont affichés à trois endroits — l'interface
 * d'administration, le tableau de bord de l'adhérent et les emails de rappel.
 * Les dupliquer garantirait qu'un jour les trois divergent.
 */

export const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  administratif: 'Accompagnement administratif',
  fle_atelier: 'Cours de FLE / Atelier',
  autre: 'Rendez-vous général',
}

/**
 * Motif d'un rendez-vous avec l'association. Liste fermée : le champ libre
 * « Précisions » a été retiré, c'est là que les personnes décrivaient
 * spontanément leur situation médicale ou administrative.
 */
export const APPOINTMENT_REASON_LABELS: Record<AppointmentReason, string> = {
  aide_administrative: 'Aide administrative',
  cours_francais: 'Cours de français',
  emploi: 'Emploi',
  traduction: 'Traduction',
  autre: 'Autre',
}

export const APPOINTMENT_REASONS = Object.entries(APPOINTMENT_REASON_LABELS).map(
  ([id, label]) => ({ id: id as AppointmentReason, label })
)

/**
 * Catégories de rendez-vous extérieurs. `sante` et `prefecture` suffisent à
 * qualifier une donnée de l'art. 9 — c'est la catégorie qui porte la
 * sensibilité, jamais le titre, qui doit rester neutre.
 */
export const EXTERNAL_CATEGORY_LABELS: Record<ExternalAppointmentCategory, string> = {
  prefecture: 'Préfecture',
  sante: 'Santé',
  caf: 'CAF / Allocations',
  france_travail: 'France Travail',
  logement: 'Logement',
  ecole: 'École',
  justice: 'Justice',
  autre: 'Autre',
}

export const EXTERNAL_CATEGORIES = Object.entries(EXTERNAL_CATEGORY_LABELS).map(
  ([id, label]) => ({ id: id as ExternalAppointmentCategory, label })
)

/** Les données arrivent de l'API sans typage : on borne l'accès au libellé. */
export function libelleCategorie(categorie?: string | null): string {
  if (!categorie) return ''
  return EXTERNAL_CATEGORY_LABELS[categorie as ExternalAppointmentCategory] ?? categorie
}
