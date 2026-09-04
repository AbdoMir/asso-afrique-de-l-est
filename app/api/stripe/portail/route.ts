import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'

export const runtime = 'nodejs'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asso.afrique.est-sa.org'

/**
 * Portail de gestion des dons mensuels.
 *
 * Le site promet « résiliation en un clic ». Du temps de HelloAsso, ce clic
 * envoyait le donateur sur un site tiers où il devait retrouver son compte.
 * Stripe fournit un portail dédié : le donateur y modifie son montant, met à
 * jour sa carte ou résilie, sans que nous ayons à écrire — ni à héberger — un
 * seul écran de gestion d'abonnement.
 */
export async function POST(_request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // L'identifiant client Stripe est posé par le webhook lors du premier
  // paiement rattaché au compte.
  const { data: adhesion } = await supabase
    .from('memberships')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const customerId = adhesion?.stripe_customer_id

  if (!customerId) {
    return NextResponse.json(
      {
        error:
          "Aucun paiement récurrent n'est rattaché à ce compte. Si vous pensez qu'il s'agit d'une erreur, contactez-nous.",
      },
      { status: 404 }
    )
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/espace-adherent`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portail Stripe : création impossible', error)
    return NextResponse.json(
      { error: 'Le portail est momentanément indisponible. Merci de réessayer.' },
      { status: 500 }
    )
  }
}
