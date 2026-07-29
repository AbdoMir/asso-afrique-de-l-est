import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendAppointmentConfirmation } from '@/lib/resend/emails'
import { z } from 'zod'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

const bookingSchema = z.object({
  slotId: z.string().uuid(),
  type: z.enum(['administratif', 'fle_atelier', 'autre']),
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
  try {
    if (await isRateLimited(`rendezvous:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = bookingSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { slotId, type, name, email, phone, notes } = validated.data

    const sessionSupabase = await createClient()
    const { data: { user } } = await sessionSupabase.auth.getUser()

    const supabase = createAdminClient()

    const { data: slot, error: slotError } = await supabase
      .from('appointment_slots')
      .select('*')
      .eq('id', slotId)
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Créneau introuvable.' }, { status: 404 })
    }

    if (slot.type !== type || new Date(slot.start_at) <= new Date()) {
      return NextResponse.json({ error: 'Ce créneau n\'est plus disponible.' }, { status: 409 })
    }

    const { count, error: countError } = await supabase
      .from('appointment_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('slot_id', slotId)
      .eq('status', 'confirmed')

    if (countError) throw countError

    if ((count || 0) >= slot.capacity) {
      return NextResponse.json({ error: 'Ce créneau est complet.' }, { status: 409 })
    }

    const { error: insertError } = await supabase.from('appointment_bookings').insert({
      slot_id: slotId,
      user_id: user?.id,
      guest_name: user ? undefined : name,
      guest_email: user ? undefined : email,
      guest_phone: user ? undefined : phone,
      notes,
    })

    if (insertError) throw insertError

    // La réservation reste valable même si l'email échoue (ex: restriction
    // sandbox Resend tant qu'aucun domaine n'est vérifié) — on logue l'échec
    // au lieu de le faire échouer silencieusement.
    const { error: emailError } = await sendAppointmentConfirmation({
      to: email,
      name,
      type,
      startAt: slot.start_at,
    })

    if (emailError) {
      console.error('Appointment confirmation email error:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Appointment booking API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réservation' },
      { status: 500 }
    )
  }
}
