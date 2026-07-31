import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNewsletterConfirmation } from '@/lib/resend/emails'
import { z } from 'zod'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

const schema = z.object({
  email: z.string().email().max(254),
  first_name: z.string().max(100).optional(),
  consent: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    if (await isRateLimited(`newsletter:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
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

    const supabase = createAdminClient()

    // Double opt-in : l'inscription est créée non confirmée. Seul le clic sur
    // le lien envoyé à l'adresse la validera — c'est ce qui empêche d'abonner
    // quelqu'un d'autre à son insu.
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('confirmed, confirmation_token')
      .eq('email', email)
      .maybeSingle()

    // Déjà confirmé : on ne renvoie rien et on ne révèle pas non plus que
    // l'adresse est connue (l'API ne doit pas servir à tester des emails).
    if (existing?.confirmed) {
      return NextResponse.json({ success: true, pending: false })
    }

    const { data: subscriber, error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email, first_name, consent, confirmed: false },
        { onConflict: 'email' }
      )
      .select('confirmation_token')
      .single()

    if (error) throw error

    const token = subscriber?.confirmation_token
    if (!token) throw new Error('Jeton de confirmation manquant')

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // L'inscription est enregistrée : un échec d'envoi ne doit pas renvoyer
    // une erreur à l'internaute, qui réessaierait inutilement.
    const { error: emailError } = await sendNewsletterConfirmation({
      to: email,
      firstName: first_name,
      confirmUrl: `${baseUrl}/api/newsletter/confirm?token=${token}`,
    })

    if (emailError) {
      console.error('Newsletter confirmation email error:', emailError)
    }

    return NextResponse.json({ success: true, pending: true })
  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
