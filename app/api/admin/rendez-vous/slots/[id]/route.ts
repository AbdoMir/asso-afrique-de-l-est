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
