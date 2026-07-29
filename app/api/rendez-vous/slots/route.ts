import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'
import type { AppointmentType } from '@/types'

// La disponibilité des créneaux change à chaque réservation : ne jamais mettre
// cette route en cache statique (sinon Vercel sert une liste de créneaux périmée).
export const dynamic = 'force-dynamic'

const VALID_TYPES: AppointmentType[] = ['administratif', 'fle_atelier', 'autre']

export async function GET(request: NextRequest) {
  if (await isRateLimited(`rendezvous-slots:${getClientIp(request)}`, 20, 60 * 1000)) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
      { status: 429 }
    )
  }

  const typeParam = request.nextUrl.searchParams.get('type')
  const type = VALID_TYPES.includes(typeParam as AppointmentType) ? (typeParam as AppointmentType) : null

  const supabase = createAdminClient()

  let query = supabase
    .from('appointment_slots')
    .select('*')
    .gt('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })

  if (type) {
    query = query.eq('type', type)
  }

  const { data: slots, error } = await query

  if (error) {
    console.error('Slots fetch error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des créneaux.' }, { status: 500 })
  }

  if (!slots || slots.length === 0) {
    return NextResponse.json({ slots: [] })
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from('appointment_bookings')
    .select('slot_id')
    .eq('status', 'confirmed')
    .in('slot_id', slots.map((s) => s.id))

  if (bookingsError) {
    console.error('Bookings count error:', bookingsError)
    return NextResponse.json({ error: 'Erreur lors de la récupération des créneaux.' }, { status: 500 })
  }

  const bookedCounts = new Map<string, number>()
  for (const b of bookings || []) {
    bookedCounts.set(b.slot_id, (bookedCounts.get(b.slot_id) || 0) + 1)
  }

  const available = slots
    .map((slot) => ({
      ...slot,
      remaining: slot.capacity - (bookedCounts.get(slot.id) || 0),
    }))
    .filter((slot) => slot.remaining > 0)

  return NextResponse.json({ slots: available })
}
