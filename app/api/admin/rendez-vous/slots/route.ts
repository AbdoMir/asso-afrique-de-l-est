import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { error } = await requireStaff()
  if (error) return error

  const includePast = request.nextUrl.searchParams.get('includePast') === 'true'
  const supabase = createAdminClient()

  let query = supabase.from('appointment_slots').select('*').order('start_at', { ascending: true })
  if (!includePast) {
    query = query.gt('start_at', new Date().toISOString())
  }

  const { data: slots, error: slotsError } = await query
  if (slotsError) return NextResponse.json({ error: slotsError.message }, { status: 500 })

  const { data: bookings, error: bookingsError } = await supabase
    .from('appointment_bookings')
    .select('slot_id')
    .eq('status', 'confirmed')

  if (bookingsError) return NextResponse.json({ error: bookingsError.message }, { status: 500 })

  const bookedCounts = new Map<string, number>()
  for (const b of bookings || []) {
    bookedCounts.set(b.slot_id, (bookedCounts.get(b.slot_id) || 0) + 1)
  }

  return NextResponse.json({
    slots: slots.map((s) => ({ ...s, booked: bookedCounts.get(s.id) || 0 })),
  })
}

export async function POST(request: NextRequest) {
  const { error } = await requireStaff()
  if (error) return error

  const { type, start_at, end_at, capacity } = await request.json()
  const supabase = createAdminClient()

  const { error: insertError } = await supabase
    .from('appointment_slots')
    .insert({ type, start_at, end_at, capacity })

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
