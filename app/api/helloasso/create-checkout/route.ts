import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/helloasso/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

// Seule formule prise en charge par HelloAsso pour le moment : l'adhésion
// simple à montant fixe. Le montant n'est jamais accepté depuis le client.
const FORM_SLUGS_AND_AMOUNTS: Record<string, { formSlug: string; amount: number }> = {
  simple: { formSlug: 'adhesion-annuelle', amount: 10 },
}

const checkoutSchema = z.object({
  formula: z.enum(Object.keys(FORM_SLUGS_AND_AMOUNTS) as [string, ...string[]]),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: z.string().email(),
  newsletter_consent: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    if (await isRateLimited(`create-checkout:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = checkoutSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { formula, first_name, last_name, email, newsletter_consent } = validated.data
    const { formSlug, amount } = FORM_SLUGS_AND_AMOUNTS[formula]

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await createCheckoutSession({
      formSlug,
      amount,
      firstName: first_name,
      lastName: last_name,
      email,
      returnUrl: `${baseUrl}/adherer-soutenir/merci?source=helloasso`,
      errorUrl: `${baseUrl}/adherer-soutenir?error=helloasso`,
      backUrl: `${baseUrl}/adherer-soutenir`,
    })

    // Newsletter subscription
    if (newsletter_consent && email) {
      const supabase = createAdminClient()
      await supabase.from('newsletter_subscribers').upsert(
        { email, first_name, consent: true },
        { onConflict: 'email' }
      )
    }

    return NextResponse.json({
      redirectUrl: session.redirectUrl || session.checkoutUrl,
    })
  } catch (error) {
    console.error('HelloAsso checkout error:', error)
    return NextResponse.json(
      { error: 'Erreur HelloAsso. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
