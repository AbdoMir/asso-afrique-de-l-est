import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/admin-guard'
import { logAccess } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { error, user } = await requireStaff(request)
  if (error) return error

  const includeCancelled = request.nextUrl.searchParams.get('includeCancelled') === 'true'
  const supabase = createAdminClient()

  let query = supabase
    .from('appointment_bookings')
    .select('*, appointment_slots(*), profiles(first_name, last_name, email, phone)')
    .order('created_at', { ascending: false })

  if (!includeCancelled) {
    query = query.eq('status', 'confirmed')
  }

  const { data: bookings, error: bookingsError } = await query
  if (bookingsError) return NextResponse.json({ error: bookingsError.message }, { status: 500 })

  // Cette liste expose l'identite, l'email, le telephone et les precisions
  // libres de chaque personne : sa consultation est un acces a des donnees
  // personnelles, pas une simple lecture technique.
  await logAccess({
    actorId: user?.id,
    actorEmail: user?.email,
    actorRole: 'staff',
    action: 'booking.list',
    resourceType: 'appointment_bookings',
    metadata: { nombre: bookings?.length ?? 0, avec_annulees: includeCancelled },
    request,
  })

  return NextResponse.json({ bookings })
}
