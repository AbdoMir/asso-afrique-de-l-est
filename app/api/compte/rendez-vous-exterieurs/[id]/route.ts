import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAccess } from '@/lib/audit'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

/**
 * Suppression d'un rendez-vous extérieur par l'adhérent lui-même.
 *
 * La policy RLS autoriserait une suppression directe depuis le navigateur, mais
 * elle ne laisserait aucune trace. Sur des données de l'art. 9, savoir ce qui a
 * disparu et quand relève de la même exigence que savoir qui les a consultées.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (await isRateLimited(`rdv-exterieur-suppression:${getClientIp(request)}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
      { status: 429 }
    )
  }

  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // RLS restreint déjà la suppression aux rendez-vous de la personne connectée :
  // `.select()` renvoie une liste vide si la ligne appartient à quelqu'un
  // d'autre, ce qui distingue « supprimé » de « pas le vôtre ».
  const { data: supprimes, error: deleteError } = await supabase
    .from('external_appointments')
    .delete()
    .eq('id', id)
    .select('id, category')

  if (deleteError) {
    console.error('Suppression de rendez-vous impossible:', deleteError)
    return NextResponse.json({ error: 'Suppression impossible.' }, { status: 500 })
  }

  if (!supprimes || supprimes.length === 0) {
    return NextResponse.json({ error: 'Rendez-vous introuvable.' }, { status: 404 })
  }

  await logAccess({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: 'member',
    action: 'external_appointment.delete',
    resourceType: 'external_appointments',
    resourceId: id,
    metadata: { category: supprimes[0].category },
    request,
  })

  return NextResponse.json({ success: true })
}
