import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPayment } from '@/lib/helloasso/client'
import { verifyHelloAssoSignature } from '@/lib/helloasso/webhook-auth'

export const runtime = 'nodejs'

type HelloAssoNotification = {
  eventType?: string
  data?: {
    id?: number
    amount?: number
    state?: string
    installmentNumber?: number
    order?: { id?: number; formType?: string; formSlug?: string }
    payer?: { email?: string; firstName?: string; lastName?: string }
  }
}

/**
 * Repli lorsqu'aucune clé de signature n'est disponible : on redemande le
 * paiement à HelloAsso avec nos identifiants OAuth. Une notification forgée ne
 * survit pas à ce contrôle, le montant et l'état provenant alors de l'API.
 */
async function verifyAgainstApi(
  paymentId: number,
  claimedAmount: number,
  claimedState: string
): Promise<boolean> {
  try {
    const payment = await getPayment(paymentId)
    return payment?.amount === claimedAmount && payment?.state === claimedState
  } catch (error) {
    console.error('HelloAsso webhook: vérification API échouée', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  let payload: HelloAssoNotification
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const { eventType, data } = payload

  // Seules les notifications de paiement nous intéressent : « Order » arrive
  // avant l'encaissement effectif.
  if (eventType !== 'Payment' || !data?.id) {
    return NextResponse.json({ received: true, ignored: true })
  }

  const paymentId = data.id
  const state = data.state ?? ''
  const amountInCents = data.amount ?? 0

  // ─── Authentification de la notification ─────────────────────────────────
  const authenticated = process.env.HELLOASSO_SIGNATURE_KEY
    ? verifyHelloAssoSignature(
        rawBody,
        request.headers.get('x-ha-signature'),
        process.env.HELLOASSO_SIGNATURE_KEY
      )
    : await verifyAgainstApi(paymentId, amountInCents, state)

  if (!authenticated) {
    console.error('HelloAsso webhook: notification non authentifiée', { paymentId, state })
    return NextResponse.json({ error: 'Notification non authentifiée' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // ─── Remboursement ─────────────────────────────────────────────────────
    if (state === 'Refunded' || state === 'Refunding') {
      await supabase
        .from('donations')
        .update({ status: 'refunded' })
        .eq('helloasso_payment_id', String(paymentId))

      return NextResponse.json({ received: true })
    }

    // `Authorized` est le seul état confirmant un paiement accepté. Pending et
    // WaitingBankValidation donneront lieu à une notification ultérieure.
    if (state !== 'Authorized') {
      return NextResponse.json({ received: true, ignored: true })
    }

    // ─── Idempotence ───────────────────────────────────────────────────────
    // HelloAsso réémet la notification tant qu'il n'obtient pas de 200.
    const { data: existing } = await supabase
      .from('donations')
      .select('id')
      .eq('helloasso_payment_id', String(paymentId))
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    const amount = amountInCents / 100
    const orderId = data.order?.id ? String(data.order.id) : undefined
    const formType = data.order?.formType
    const payer = data.payer
    const donorName = [payer?.firstName, payer?.lastName].filter(Boolean).join(' ') || undefined

    // ─── Rattachement à un compte adhérent ─────────────────────────────────
    // Les formulaires HelloAsso ne transportent pas de métadonnées : le seul
    // lien possible est l'email du payeur. S'il diffère de celui du compte, le
    // don reste enregistré sans `user_id` et devra être rapproché à la main.
    let userId: string | undefined

    if (payer?.email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', payer.email)
        .maybeSingle()

      userId = profile?.id
    }

    // ─── Adhésion ──────────────────────────────────────────────────────────
    // `memberships.user_id` est NOT NULL : un paiement dont l'email ne
    // correspond à aucun compte ne peut donner lieu qu'à un don.
    let membershipId: string | undefined

    if (userId && formType === 'Membership') {
      const dateStart = new Date()
      const dateEnd = new Date(dateStart)
      dateEnd.setFullYear(dateEnd.getFullYear() + 1)

      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: userId,
          type: 'simple',
          status: 'active',
          amount,
          frequency: 'once',
          helloasso_ref: orderId,
          payment_method: 'helloasso',
          date_start: dateStart.toISOString().slice(0, 10),
          date_end: dateEnd.toISOString().slice(0, 10),
        })
        .select('id')
        .single()

      if (membershipError) throw membershipError
      membershipId = membership?.id
    }

    // ─── Don ───────────────────────────────────────────────────────────────
    // Une ligne par paiement encaissé : un donateur mensuel produit douze
    // lignes par an, dont la somme correspond réellement à son total annuel.
    const { error: donationError } = await supabase.from('donations').insert({
      user_id: userId,
      amount,
      frequency: 'once',
      status: 'succeeded',
      helloasso_payment_id: String(paymentId),
      helloasso_order_id: orderId,
      donor_name: donorName,
      donor_email: payer?.email,
      payment_method: 'helloasso',
      membership_id: membershipId,
    })

    if (donationError) throw donationError

    // Pas d'email de bienvenue ici : HelloAsso envoie déjà sa confirmation de
    // paiement et le reçu fiscal CERFA au payeur.

    return NextResponse.json({ received: true })
  } catch (error) {
    // Erreur volontairement remontée : HelloAsso réessaiera, et l'idempotence
    // ci-dessus évite le doublon.
    console.error('HelloAsso webhook handler error:', error)
    return NextResponse.json({ error: 'Traitement impossible' }, { status: 500 })
  }
}
