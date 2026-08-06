import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

/**
 * Export des données personnelles de l'adhérent connecté (art. 15 et 20).
 *
 * Le format retenu est du JSON : la portabilité exige un format « structuré,
 * couramment utilisé et lisible par machine », ce qu'un PDF ne serait pas.
 *
 * Les lectures passent par le client de session, pas par le client admin : les
 * politiques RLS restreignent déjà chaque table à son propriétaire, et s'y
 * appuyer évite qu'un défaut de filtrage ici expose les données d'autrui.
 */
export async function GET(request: NextRequest) {
  if (await isRateLimited(`compte-export:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
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

  const [profile, memberships, donations, receipts, documents, bookings] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('memberships').select('*').eq('user_id', user.id),
    supabase.from('donations').select('*').eq('user_id', user.id),
    supabase.from('fiscal_receipts').select('*').eq('user_id', user.id),
    supabase.from('member_documents').select('*').eq('user_id', user.id),
    supabase
      .from('appointment_bookings')
      .select('*, appointment_slots(type, start_at, end_at)')
      .eq('user_id', user.id),
  ])

  // La newsletter n'est pas rattachée au compte mais à l'adresse email, et sa
  // table n'est lisible que par le service_role.
  let newsletter = null
  if (user.email) {
    const { data } = await createAdminClient()
      .from('newsletter_subscribers')
      .select('email, first_name, consent, confirmed, confirmed_at, created_at')
      .eq('email', user.email)
      .maybeSingle()
    newsletter = data
  }

  const exportData = {
    export: {
      genere_le: new Date().toISOString(),
      responsable_de_traitement: "Association Afrique de l'Est et ses amis",
      base_legale: 'Articles 15 et 20 du RGPD',
      note: "Les documents que vous avez déposés ne figurent pas dans ce fichier : ils restent téléchargeables un par un depuis l'onglet Documents de votre espace adhérent.",
    },
    compte: {
      id: user.id,
      email: user.email,
      cree_le: user.created_at,
      derniere_connexion: user.last_sign_in_at,
    },
    profil: profile.data,
    adhesions: memberships.data ?? [],
    dons: donations.data ?? [],
    recus_fiscaux: receipts.data ?? [],
    documents: documents.data ?? [],
    rendez_vous: bookings.data ?? [],
    newsletter,
  }

  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="mes-donnees-${date}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
