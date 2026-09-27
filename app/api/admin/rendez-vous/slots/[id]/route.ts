import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/admin-guard'
import { logAccess } from '@/lib/audit'
import { slotSchema } from '../route'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireStaff(request)
  if (error) return error

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const validated = slotSchema.safeParse(body)
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: validated.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Abaisser la capacite sous le nombre de personnes deja inscrites les
  // laisserait reservees sur un creneau complet. Le garde-fou de la migration
  // 009 ne verifie la capacite qu'a la reservation, jamais a la modification
  // du creneau : le controle doit donc etre fait ici.
  const { count, error: countError } = await supabase
    .from('appointment_bookings')
    .select('id', { count: 'exact', head: true })
    .eq('slot_id', id)
    .eq('status', 'confirmed')

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

  if ((count ?? 0) > validated.data.capacity) {
    return NextResponse.json(
      {
        error: `Ce créneau compte déjà ${count} réservation(s) confirmée(s) : la capacité ne peut pas descendre en dessous.`,
      },
      { status: 409 }
    )
  }

  const { data: updated, error: updateError } = await supabase
    .from('appointment_slots')
    .update(validated.data)
    .eq('id', id)
    .select()
    .maybeSingle()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  if (!updated) return NextResponse.json({ error: 'Créneau introuvable' }, { status: 404 })

  // Deplacer un creneau deja reserve change l'heure du rendez-vous de
  // quelqu'un : la modification doit rester tracable.
  await logAccess({
    actorId: user?.id,
    actorEmail: user?.email,
    actorRole: 'staff',
    action: 'slot.update',
    resourceType: 'appointment_slots',
    resourceId: id,
    metadata: { reservations_confirmees: count ?? 0 },
    request,
  })

  return NextResponse.json({ success: true, slot: updated })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireStaff(request)
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  const { error: deleteError } = await supabase.from('appointment_slots').delete().eq('id', id)
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  // La suppression d'un creneau efface en cascade les reservations qui s'y
  // rattachent : c'est une destruction de donnees personnelles.
  await logAccess({
    actorId: user?.id,
    actorEmail: user?.email,
    actorRole: 'staff',
    action: 'slot.delete',
    resourceType: 'appointment_slots',
    resourceId: id,
    request,
  })

  return NextResponse.json({ success: true })
}
