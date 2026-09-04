import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe/client'

export const runtime = 'nodejs'

/**
 * Notifications de paiement Stripe — seule source de vérité.
 *
 * La page de retour ne peut pas jouer ce rôle : le donateur ferme souvent son
 * onglet avant qu'elle ne charge, et rien de ce qu'elle affiche ne prouve
 * qu'un paiement a réussi. Seul ce webhook, signé par Stripe, fait foi.
 *
 * Deux événements écrivent en base, et ils ne se recouvrent pas :
 *
 *   — `checkout.session.completed` en mode `payment`, pour l'adhésion et le
 *     don ponctuel ;
 *   — `invoice.paid` pour les dons mensuels, à chaque échéance, y compris la
 *     première.
 *
 * Une session d'abonnement déclenche pourtant les *deux*. On l'ignore donc
 * explicitement dans le premier cas, sans quoi la première mensualité serait
 * enregistrée deux fois.
 */

type IdentiteDonateur = {
  name?: string
  email?: string
  address?: string
  city?: string
  zip?: string
}

function aplatirAdresse(address: Stripe.Address | null | undefined): {
  address?: string
  city?: string
  zip?: string
} {
  if (!address) return {}
  const rue = [address.line1, address.line2].filter(Boolean).join(', ')
  return {
    address: rue || undefined,
    city: address.city ?? undefined,
    zip: address.postal_code ?? undefined,
  }
}

/**
 * Enregistre un versement encaissé.
 *
 * L'idempotence repose sur l'index unique `donations.stripe_payment_intent_id`
 * présent depuis la migration 001 : Stripe réémet ses notifications tant qu'il
 * n'obtient pas de 200, et un simple retard réseau créerait sinon des dons en
 * double.
 */
async function enregistrerDon(params: {
  paymentIntentId: string
  amount: number
  userId?: string
  donateur: IdentiteDonateur
  subscriptionId?: string
  membershipId?: string
  frequency: 'once' | 'monthly'
}) {
  const supabase = createAdminClient()

  const { data: existant } = await supabase
    .from('donations')
    .select('id')
    .eq('stripe_payment_intent_id', params.paymentIntentId)
    .maybeSingle()

  if (existant) return { duplicate: true }

  // Les champs absents sont omis plutôt que mis à `null` : Supabase laisse
  // alors la colonne à NULL, et le type d'insertion les déclare optionnels.
  const { error } = await supabase.from('donations').insert({
    user_id: params.userId,
    amount: params.amount,
    frequency: params.frequency,
    status: 'succeeded',
    stripe_payment_intent_id: params.paymentIntentId,
    stripe_subscription_id: params.subscriptionId,
    donor_name: params.donateur.name,
    donor_email: params.donateur.email,
    donor_address: params.donateur.address,
    donor_city: params.donateur.city,
    donor_zip_code: params.donateur.zip,
    payment_method: 'card',
    membership_id: params.membershipId,
  })

  if (error) throw error
  return { duplicate: false }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !secret) {
    console.error('Webhook Stripe : signature ou secret absent')
    return NextResponse.json({ error: 'Notification non authentifiée' }, { status: 401 })
  }

  // Le corps brut est indispensable : la signature porte sur les octets reçus,
  // qu'un JSON.parse suivi d'une re-sérialisation ne restituerait pas.
  const rawBody = await request.text()

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch (error) {
    console.error('Webhook Stripe : signature invalide', error)
    return NextResponse.json({ error: 'Notification non authentifiée' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      // ─── Adhésion et don ponctuel ─────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object

        // Les abonnements passent par `invoice.paid` : traiter aussi cette
        // session enregistrerait la première mensualité deux fois.
        if (session.mode === 'subscription') {
          return NextResponse.json({ received: true, ignored: 'abonnement' })
        }

        if (session.payment_status !== 'paid' || !session.payment_intent) {
          return NextResponse.json({ received: true, ignored: 'non payé' })
        }

        const userId = session.metadata?.user_id || undefined
        const formula = session.metadata?.formula
        const montant = (session.amount_total ?? 0) / 100

        const donateur: IdentiteDonateur = {
          name: session.customer_details?.name ?? undefined,
          email: session.customer_details?.email ?? undefined,
          ...aplatirAdresse(session.customer_details?.address),
        }

        // L'adhésion crée une ligne d'adhésion en plus du versement.
        // `memberships.user_id` est NOT NULL : un paiement sans compte associé
        // ne peut donner lieu qu'à un don.
        let membershipId: string | undefined

        if (userId && formula === 'simple') {
          const debut = new Date()
          const fin = new Date(debut)
          fin.setFullYear(fin.getFullYear() + 1)

          const { data: adhesion, error: adhesionError } = await supabase
            .from('memberships')
            .insert({
              user_id: userId,
              type: 'simple',
              status: 'active',
              amount: montant,
              frequency: 'once',
              payment_method: 'card',
              stripe_customer_id:
                typeof session.customer === 'string' ? session.customer : undefined,
              date_start: debut.toISOString().slice(0, 10),
              date_end: fin.toISOString().slice(0, 10),
            })
            .select('id')
            .single()

          if (adhesionError) throw adhesionError
          membershipId = adhesion?.id
        }

        await enregistrerDon({
          paymentIntentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent.id,
          amount: montant,
          userId,
          donateur,
          membershipId,
          frequency: 'once',
        })

        return NextResponse.json({ received: true })
      }

      // ─── Échéances des dons mensuels ──────────────────────────────────────
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null
          payment_intent?: string | Stripe.PaymentIntent | null
        }

        if (!invoice.subscription || !invoice.payment_intent) {
          return NextResponse.json({ received: true, ignored: 'hors abonnement' })
        }

        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription.id

        // Les métadonnées vivent sur l'abonnement, pas sur la facture : c'est
        // le seul endroit où retrouver l'adhérent d'une échéance mensuelle.
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata?.user_id || undefined

        const donateur: IdentiteDonateur = {
          name: invoice.customer_name ?? undefined,
          email: invoice.customer_email ?? undefined,
          ...aplatirAdresse(invoice.customer_address),
        }

        await enregistrerDon({
          paymentIntentId:
            typeof invoice.payment_intent === 'string'
              ? invoice.payment_intent
              : invoice.payment_intent.id,
          amount: (invoice.amount_paid ?? 0) / 100,
          userId,
          donateur,
          subscriptionId,
          frequency: 'monthly',
        })

        return NextResponse.json({ received: true })
      }

      // ─── Remboursement ────────────────────────────────────────────────────
      case 'charge.refunded': {
        const charge = event.data.object
        const paymentIntentId =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id

        if (paymentIntentId) {
          await supabase
            .from('donations')
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent_id', paymentIntentId)
        }

        return NextResponse.json({ received: true })
      }

      // ─── Fin d'un don mensuel ─────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object

        await supabase
          .from('memberships')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id)

        return NextResponse.json({ received: true })
      }

      default:
        return NextResponse.json({ received: true, ignored: event.type })
    }
  } catch (error) {
    // Erreur volontairement remontée en 500 : Stripe réessaiera, et
    // l'idempotence ci-dessus évite le doublon lors de la reprise.
    console.error('Webhook Stripe : traitement impossible', error)
    return NextResponse.json({ error: 'Traitement impossible' }, { status: 500 })
  }
}
