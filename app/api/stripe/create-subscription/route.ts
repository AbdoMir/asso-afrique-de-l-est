import { NextRequest, NextResponse } from 'next/server'
import {
  getStripeClient,
  createStripeCustomer,
  getStripePriceId,
} from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(`create-subscription:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
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
    } = body

    // Validate formula
    if (!['monthly_5', 'monthly_10', 'monthly_20'].includes(formula)) {
      return NextResponse.json(
        { error: 'Formule invalide' },
        { status: 400 }
      )
    }

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
            city,
            postal_code: zip_code,
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
    const supabase = await createClient()
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
