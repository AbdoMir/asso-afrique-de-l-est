import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendNewsletterWelcome } from '@/lib/resend/emails'
import { z } from 'zod'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

const schema = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  consent: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(`newsletter:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = schema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const { email, first_name, consent } = validated.data

    if (!consent) {
      return NextResponse.json(
        { error: 'Consentement requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase.from('newsletter_subscribers').upsert(
      { email, first_name, consent },
      { onConflict: 'email' }
    )

    if (error) throw error

    await sendNewsletterWelcome({ to: email, firstName: first_name })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
