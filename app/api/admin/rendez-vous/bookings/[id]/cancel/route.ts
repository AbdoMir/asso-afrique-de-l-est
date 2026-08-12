import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/admin-guard'
import { logAccess } from '@/lib/audit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireStaff(request)
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  const { error: updateError } = await supabase
    .from('appointment_bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await logAccess({
    actorId: user?.id,
    actorEmail: user?.email,
    actorRole: 'staff',
    action: 'booking.cancel',
    resourceType: 'appointment_bookings',
    resourceId: id,
    request,
  })

  return NextResponse.json({ success: true })
}
