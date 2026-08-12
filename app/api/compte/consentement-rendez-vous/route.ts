import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAccess } from '@/lib/audit'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

/**
 * Consentement au suivi des rendez-vous extérieurs.
 *
 * Le suivi porte sur des données de l'art. 9 : il ne peut reposer que sur un
 * consentement explicite (art. 9.2.a), donné par la personne elle-même et
 * retirable aussi facilement qu'il a été donné (art. 7.3).
 *
 * L'horodatage n'est pas décoratif : l'art. 7.1 exige de pouvoir **démontrer**
 * que la personne a consenti. Chaque bascule est en outre journalisée.
 */

const schema = z.object({ consent: z.boolean() })

export async function PATCH(request: NextRequest) {
  if (await isRateLimited(`consentement-rdv:${getClientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
      { status: 429 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const validated = schema.safeParse(body)

  if (!validated.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const { consent } = validated.data

  // Le client admin est nécessaire : les policies de `profiles` n'autorisent
  // l'adhérent qu'à modifier ses coordonnées, pas ce champ.
  const { error: updateError } = await createAdminClient()
    .from('profiles')
    .update({
      external_appointments_consent: consent,
      external_appointments_consent_at: consent ? new Date().toISOString() : null,
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Mise à jour du consentement impossible:', updateError)
    return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 })
  }

  await logAccess({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: 'member',
    action: consent ? 'consent.external_appointments.grant' : 'consent.external_appointments.withdraw',
    resourceType: 'profiles',
    resourceId: user.id,
    request,
  })

  return NextResponse.json({ success: true, consent })
}
