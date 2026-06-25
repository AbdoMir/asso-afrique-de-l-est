import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendContactConfirmation } from '@/lib/resend/emails'
import { z } from 'zod'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(3),
  message: z.string().min(10),
})

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(`contact:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = contactSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, phone, subject, message } = validated.data
    const supabase = createAdminClient()

    const { error } = await supabase.from('contact_messages').insert({
      name,
      email,
      phone,
      subject,
      message,
    })

    if (error) throw error

    await sendContactConfirmation({ to: email, name, subject })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi' },
      { status: 500 }
    )
  }
}
