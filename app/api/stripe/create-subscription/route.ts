import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getStripeClient,
  createStripeCustomer,
  getStripePriceId,
} from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

const subscriptionSchema = z.object({
  formula: z.enum(['monthly_5', 'monthly_10', 'monthly_20']),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip_code: z.string().optional(),
  comment: z.string().optional(),
  newsletter_consent: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(`create-subscription:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = subscriptionSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const {
      formula,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      zip_code,
      comment,
      newsletter_consent,
    } = validated.data

    let priceId: string
    try {
      priceId = getStripePriceId(formula)
    } catch {
      return NextResponse.json(
        { error: 'Prix Stripe non configuré. Contactez-nous.' },
        { status: 500 }
      )
    }

    // Create or retrieve Stripe customer
    const customer = await createStripeCustomer({
      email,
      name: `${first_name} ${last_name}`,
      phone,
      address: address
        ? {
            line1: address,
            city: city || '',
            postal_code: zip_code || '',
            country: 'FR',
          }
        : undefined,
      metadata: {
        formula,
        comment: comment || '',
        newsletter_consent: newsletter_consent ? 'true' : 'false',
        source: 'asso-aes-website',
      },
    })

    // Create a SetupIntent — le donateur choisit CB ou prélèvement SEPA
    // sur la page de confirmation (Stripe Payment Element)
    const setupIntent = await getStripeClient().setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card', 'sepa_debit'],
      usage: 'off_session',
      metadata: {
        formula,
        price_id: priceId,
        donor_name: `${first_name} ${last_name}`,
        donor_email: email,
      },
    })

    // Store pending membership in Supabase
    const supabase = createAdminClient()
    const amounts: Record<string, number> = {
      monthly_5: 5,
      monthly_10: 10,
      monthly_20: 20,
    }

    // Newsletter subscription
    if (newsletter_consent) {
      await supabase.from('newsletter_subscribers').upsert(
        { email, first_name, consent: true },
        { onConflict: 'email' }
      )
    }

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId: customer.id,
      priceId,
      amount: amounts[formula],
    })
  } catch (error) {
    console.error('Stripe subscription error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'abonnement' },
      { status: 500 }
    )
  }
}
