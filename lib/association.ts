/**
 * Identité légale de l'association — source unique.
 *
 * Ces informations transitaient par des variables d'environnement, ce qui les
 * rendait absentes en production : les mentions légales affichaient encore
 * « WXXXXXXXXXX » et un SIRET fictif, et l'adresse divergeait entre les
 * environnements. Or rien ici n'est confidentiel : ce sont des données
 * publiques, consultables au répertoire SIRENE. Elles ont leur place dans le
 * code, où une valeur manquante se voit à la relecture plutôt qu'en ligne.
 *
 * Source : avis de situation au répertoire SIRENE du 10 août 2026.
 */

export const ASSOCIATION_NAME = "Association Afrique de l'Est et ses amis"

export const ASSOCIATION_SIREN = '107 843 583'
export const ASSOCIATION_SIRET = '107 843 583 00017'

/** 94.99Z — Autres organisations fonctionnant par adhésion volontaire. */
export const ASSOCIATION_APE = '94.99Z'
export const ASSOCIATION_APE_LABEL = 'Autres organisations fonctionnant par adhésion volontaire'

export const ASSOCIATION_ADDRESS = '1 rue de Graffenstaden, 67380 Lingolsheim'

/**
 * Catégorie juridique 9260 au répertoire SIRENE : association de **droit
 * local**, et non association « loi 1901 ».
 *
 * Les associations dont le siège est en Alsace-Moselle relèvent des articles 21
 * à 79-IV du Code civil local, hérités du droit allemand et maintenus en
 * vigueur après 1918. Elles s'inscrivent au registre des associations du
 * tribunal judiciaire, non en préfecture — c'est pourquoi elles n'ont **pas de
 * numéro RNA**, réservé aux associations déclarées sous le régime de 1901.
 */
export const ASSOCIATION_LEGAL_FORM =
  'association de droit local régie par les articles 21 à 79-IV du Code civil local, ' +
  'applicable dans les départements du Bas-Rhin, du Haut-Rhin et de la Moselle'

/** Formulation courte, pour les pieds de page et les emails. */
export const ASSOCIATION_LEGAL_FORM_SHORT = 'Association de droit local (Alsace-Moselle)'

export const ASSOCIATION_PRESIDENT = 'Ismael Ali Moussa'
