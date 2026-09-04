import Stripe from 'stripe'

/**
 * Client Stripe, construit à la première utilisation.
 *
 * Même raison que pour Resend : Next.js évalue les modules des routes pendant
 * la compilation, pour en collecter les métadonnées. Un `new Stripe(...)` au
 * niveau du module ferait échouer tout build dépourvu de clé — ce qui a déjà
 * fait tomber un déploiement de prévisualisation, dont l'environnement
 * n'expose pas les secrets de production.
 *
 * Différer la construction rend la compilation indépendante des secrets, et
 * déplace la panne là où elle est lisible : au premier appel réel, avec un
 * message qui nomme la variable manquante.
 */
let client: Stripe | null = null

export function getStripe(): Stripe {
  if (client) return client

  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error(
      'STRIPE_SECRET_KEY est absente : aucun paiement ne peut être traité. ' +
        "Renseignez-la dans les variables d'environnement du projet."
    )
  }

  client = new Stripe(apiKey)
  return client
}

/**
 * Identifiants des tarifs récurrents créés dans le tableau de bord Stripe.
 *
 * Les dons mensuels s'appuient sur des `Price` déclarés côté Stripe plutôt que
 * sur un montant transmis à la volée : c'est la seule forme acceptée en mode
 * abonnement, et cela évite qu'une valeur falsifiée par le navigateur
 * détermine ce qui sera prélevé chaque mois.
 */
export const MONTHLY_PRICE_IDS: Record<MonthlyFormula, string | undefined> = {
  monthly_5: process.env.STRIPE_PRICE_MONTHLY_5,
  monthly_10: process.env.STRIPE_PRICE_MONTHLY_10,
  monthly_20: process.env.STRIPE_PRICE_MONTHLY_20,
}

export type MonthlyFormula = 'monthly_5' | 'monthly_10' | 'monthly_20'

/**
 * Montants en euros, source de vérité côté serveur.
 *
 * Le navigateur n'envoie qu'un identifiant de formule : le montant n'est
 * jamais lu depuis la requête, sans quoi n'importe qui pourrait adhérer pour
 * un centime.
 */
export const FORMULA_AMOUNTS = {
  simple: 10,
  monthly_5: 5,
  monthly_10: 10,
  monthly_20: 20,
} as const

export type Formula = keyof typeof FORMULA_AMOUNTS

export function isFormula(value: string): value is Formula {
  return value in FORMULA_AMOUNTS
}

export function isMonthlyFormula(formula: Formula): formula is MonthlyFormula {
  return formula !== 'simple'
}
