import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe/client'
import { getUser } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: membership } = await supabase
    .from('memberships')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!membership?.stripe_customer_id) {
    return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 404 })
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/espace-adherent/gestion-don`
  const session = await createPortalSession(membership.stripe_customer_id, returnUrl)

  return NextResponse.json({ url: session.url })
}
