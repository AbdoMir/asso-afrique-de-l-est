/**
 * Configuration du compte Stripe : tarifs récurrents et endpoint webhook.
 *
 * Pourquoi ce script existe : ces objets se créent aussi à la main dans le
 * tableau de bord, mais l'endpoint webhook demande de cocher quatre événements
 * précis dans une liste qui en compte plus de deux cents. Un oubli ne se voit
 * pas — le paiement aboutit, et rien ne s'enregistre en base. Autant que la
 * machine s'en charge.
 *
 * La clé secrète se transmet le temps de la commande et n'est écrite nulle
 * part :
 *
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
 *
 * Le script est **rejouable** : chaque tarif porte un `lookup_key`, unique chez
 * Stripe, ce qui permet de retrouver un tarif existant au lieu d'en créer un
 * doublon. Un second lancement ne crée donc rien de neuf et se contente
 * d'afficher les identifiants.
 *
 * Les identifiants de tarifs diffèrent entre le mode test et le mode réel : la
 * même commande se rejoue le jour du passage en production, avec la clé
 * correspondante et le drapeau --live.
 */

import Stripe from 'stripe'

const cle = process.env.STRIPE_SECRET_KEY
const enModeReel = process.argv.includes('--live')

/**
 * Adresse publique du site, pour l'endpoint webhook.
 *
 * L'argument `--url=` prime sur l'environnement. Sans lui, un lancement avec
 * `--env-file=.env.local` reprendrait `NEXT_PUBLIC_APP_URL`, qui vaut
 * `http://localhost:3000` en développement — et Stripe refuse d'enregistrer un
 * webhook vers une adresse qu'il ne peut pas joindre.
 */
const argumentUrl = process.argv.find((a) => a.startsWith('--url='))?.slice(6)
const siteUrl = argumentUrl || process.env.NEXT_PUBLIC_APP_URL || ''
const urlWebhook = `${siteUrl}/api/stripe/webhook`

/** Les quatre événements traités par app/api/stripe/webhook/route.ts. */
const EVENEMENTS = [
  'checkout.session.completed',
  'invoice.paid',
  'charge.refunded',
  'customer.subscription.deleted',
]

const TARIFS = [
  { montant: 5, lookupKey: 'don_mensuel_5', variable: 'STRIPE_PRICE_MONTHLY_5' },
  { montant: 10, lookupKey: 'don_mensuel_10', variable: 'STRIPE_PRICE_MONTHLY_10' },
  { montant: 20, lookupKey: 'don_mensuel_20', variable: 'STRIPE_PRICE_MONTHLY_20' },
]

const CLE_PRODUIT = 'don_mensuel_association'

// ─── Garde-fous ──────────────────────────────────────────────────────────────

if (!cle) {
  console.error(
    'STRIPE_SECRET_KEY absente.\n\n' +
      '  STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs\n'
  )
  process.exit(1)
}

// Une clé réelle crée des objets facturables et un endpoint qui recevra de
// vrais paiements. On l'exige explicitement plutôt que de la deviner.
if (cle.startsWith('sk_live_') && !enModeReel) {
  console.error(
    'Clé de production détectée, mais le drapeau --live est absent.\n\n' +
      'Configurez et testez d abord en mode test. Quand tout fonctionne :\n' +
      '  STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-setup.mjs --live\n'
  )
  process.exit(1)
}

if (!cle.startsWith('sk_live_') && enModeReel) {
  console.error('Le drapeau --live est passé avec une clé de test. Rien de fait.')
  process.exit(1)
}

// Stripe doit pouvoir joindre l'endpoint : ni localhost, ni HTTP en clair. On
// le vérifie ici plutôt que d'aller au bout et d'échouer après avoir créé les
// tarifs, comme lors du premier lancement.
const adresseInvalide =
  !siteUrl ||
  !siteUrl.startsWith('https://') ||
  /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(siteUrl)

if (adresseInvalide) {
  console.error(
    `Adresse du site inutilisable pour un webhook : ${siteUrl || '(vide)'}\n\n` +
      'Stripe doit pouvoir atteindre l endpoint : il lui faut une adresse\n' +
      'publique en HTTPS. Indiquez-la explicitement :\n\n' +
      '  node --env-file=.env.local scripts/stripe-setup.mjs --url=https://votre-domaine\n\n' +
      'Pour éprouver le webhook en local, passez plutôt par la CLI Stripe :\n' +
      '  stripe listen --forward-to localhost:3000/api/stripe/webhook\n'
  )
  process.exit(1)
}

const stripe = new Stripe(cle)
const mode = cle.startsWith('sk_live_') ? 'RÉEL' : 'test'

console.log(`\nMode ${mode} — ${siteUrl}\n`)

// ─── Produit ─────────────────────────────────────────────────────────────────
// Un seul produit portant les trois tarifs : c'est ce que verra le donateur sur
// la page de paiement, et cela garde le catalogue lisible.

async function trouverOuCreerProduit() {
  const existants = await stripe.products.list({ limit: 100, active: true })
  const trouve = existants.data.find((p) => p.metadata?.cle === CLE_PRODUIT)

  if (trouve) {
    console.log(`Produit existant           ${trouve.id}`)
    return trouve
  }

  const produit = await stripe.products.create({
    name: 'Don mensuel de soutien',
    description:
      "Soutien régulier à l'Association Afrique de l'Est et ses amis. " +
      'Résiliable à tout moment.',
    metadata: { cle: CLE_PRODUIT },
  })

  console.log(`Produit créé               ${produit.id}`)
  return produit
}

// ─── Tarifs ──────────────────────────────────────────────────────────────────

async function trouverOuCreerTarif(produitId, { montant, lookupKey }) {
  const existants = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 })

  if (existants.data.length > 0) {
    const tarif = existants.data[0]
    console.log(`Tarif ${String(montant).padStart(2)} € existant       ${tarif.id}`)
    return tarif
  }

  const tarif = await stripe.prices.create({
    product: produitId,
    currency: 'eur',
    unit_amount: montant * 100,
    recurring: { interval: 'month' },
    lookup_key: lookupKey,
    nickname: `Don mensuel ${montant} €`,
  })

  console.log(`Tarif ${String(montant).padStart(2)} € créé           ${tarif.id}`)
  return tarif
}

// ─── Endpoint webhook ────────────────────────────────────────────────────────

async function configurerWebhook() {
  const existants = await stripe.webhookEndpoints.list({ limit: 100 })
  const trouve = existants.data.find((e) => e.url === urlWebhook)

  if (trouve) {
    // Le secret de signature n'est retourné qu'à la création : Stripe ne le
    // redonne jamais. S'il est perdu, il faut supprimer l'endpoint dans le
    // tableau de bord et relancer ce script.
    const evenementsManquants = EVENEMENTS.filter(
      (e) => !trouve.enabled_events.includes(e)
    )

    if (evenementsManquants.length > 0) {
      await stripe.webhookEndpoints.update(trouve.id, { enabled_events: EVENEMENTS })
      console.log(`Webhook mis à jour         ${trouve.id}`)
      console.log(`  événements ajoutés :     ${evenementsManquants.join(', ')}`)
    } else {
      console.log(`Webhook existant           ${trouve.id}`)
    }

    return null
  }

  const endpoint = await stripe.webhookEndpoints.create({
    url: urlWebhook,
    enabled_events: EVENEMENTS,
    description: "Encaissements de l'Association Afrique de l'Est et ses amis",
  })

  console.log(`Webhook créé               ${endpoint.id}`)
  return endpoint.secret
}

// ─── Exécution ───────────────────────────────────────────────────────────────

const produit = await trouverOuCreerProduit()

const identifiants = {}
for (const tarif of TARIFS) {
  const cree = await trouverOuCreerTarif(produit.id, tarif)
  identifiants[tarif.variable] = cree.id
}

// Un échec sur le webhook ne doit pas emporter l'affichage des tarifs déjà
// créés : sans eux, il faudrait aller les rechercher dans le tableau de bord.
let secretWebhook = null
let echecWebhook = null

try {
  secretWebhook = await configurerWebhook()
} catch (erreur) {
  echecWebhook = erreur instanceof Error ? erreur.message : String(erreur)
  console.error(`\nWebhook non configuré : ${echecWebhook}`)
}

// ─── Ce qu'il reste à reporter ───────────────────────────────────────────────

console.log('\n' + '─'.repeat(72))
console.log('À reporter dans les variables Vercel — Production, Preview ET Development')
console.log('─'.repeat(72) + '\n')

for (const [variable, valeur] of Object.entries(identifiants)) {
  console.log(`${variable}=${valeur}`)
}

if (echecWebhook) {
  console.log(
    "\nSTRIPE_WEBHOOK_SECRET : non obtenu, l'endpoint n'a pas été créé.\n" +
      '  Les tarifs ci-dessus sont en place ; relancez le script une fois la\n' +
      "  cause corrigée, il ne les recréera pas.\n"
  )
} else if (secretWebhook) {
  console.log(`STRIPE_WEBHOOK_SECRET=${secretWebhook}`)
} else {
  console.log(
    '\nSTRIPE_WEBHOOK_SECRET : inchangé.\n' +
      "  L'endpoint existait déjà, et Stripe ne redonne jamais un secret de\n" +
      "  signature après sa création. Conservez celui que vous avez. S'il est\n" +
      "  perdu, supprimez l'endpoint dans le tableau de bord et relancez.\n"
  )
}

console.log(
  '\nAjoutez aussi vos deux clés API, visibles dans Développeurs > Clés API :\n' +
    '  STRIPE_SECRET_KEY\n' +
    '  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\n'
)

console.log(`Endpoint webhook : ${urlWebhook}`)
console.log(`Événements       : ${EVENEMENTS.join(', ')}\n`)
