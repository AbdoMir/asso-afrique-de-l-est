import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

// Même exigence de validation que sur les routes publiques : un compte staff
// compromis ne doit pas pouvoir insérer des créneaux incohérents (capacité
// négative, dates inversées) que le reste de l'app tient pour valides.
const slotSchema = z
  .object({
    type: z.enum(['administratif', 'fle_atelier', 'autre']),
    start_at: z.string().datetime({ offset: true }),
    end_at: z.string().datetime({ offset: true }),
    capacity: z.number().int().min(1).max(100),
  })
  .refine((s) => new Date(s.end_at) > new Date(s.start_at), {
    message: 'La fin du créneau doit suivre son début.',
    path: ['end_at'],
  })

export async function GET(request: NextRequest) {
  const { error } = await requireStaff(request)
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
  const { error } = await requireStaff(request)
  if (error) return error

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

  const { error: insertError } = await supabase
    .from('appointment_slots')
    .insert(validated.data)

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
