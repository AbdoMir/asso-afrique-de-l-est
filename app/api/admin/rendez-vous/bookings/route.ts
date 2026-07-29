import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { error } = await requireStaff()
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

  return NextResponse.json({ bookings })
}
