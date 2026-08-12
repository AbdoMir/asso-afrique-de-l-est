import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/admin-guard'
import { logAccess } from '@/lib/audit'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireStaff(request)
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  // On relit la ligne avant de la supprimer : sans cela, le journal ne pourrait
  // pas dire de quel adhérent relevait le rendez-vous effacé.
  const { data: appointment } = await supabase
    .from('external_appointments')
    .select('user_id, category')
    .eq('id', id)
    .maybeSingle()

  const { error: deleteError } = await supabase
    .from('external_appointments')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Suppression de rendez-vous extérieur impossible:', deleteError)
    return NextResponse.json({ error: 'Suppression impossible.' }, { status: 500 })
  }

  await logAccess({
    actorId: user?.id,
    actorEmail: user?.email,
    actorRole: 'staff',
    action: 'external_appointment.delete',
    resourceType: 'external_appointments',
    resourceId: id,
    metadata: {
      category: appointment?.category ?? null,
      pour_adherent: appointment?.user_id ?? null,
    },
    request,
  })

  return NextResponse.json({ success: true })
}
