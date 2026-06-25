import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { capturePayPalOrder, isPayPalConfigured } from '@/lib/paypal/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

const captureSchema = z.object({
  orderId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: 'Le paiement PayPal n\'est pas encore disponible.' },
      { status: 503 }
    )
  }

  try {
    if (await isRateLimited(`paypal-capture-order:${getClientIp(request)}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = captureSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const capture = await capturePayPalOrder(validated.data.orderId)

    if (capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Paiement non finalisé' }, { status: 400 })
    }

    const purchaseUnit = capture.purchase_units?.[0]
    const amount = Number(purchaseUnit?.payments?.captures?.[0]?.amount?.value || 0)
    const donorEmail = capture.payer?.email_address as string | undefined
    const donorName = [capture.payer?.name?.given_name, capture.payer?.name?.surname]
      .filter(Boolean)
      .join(' ')

    const supabase = createAdminClient()
    const { error } = await supabase.from('donations').insert({
      amount,
      frequency: 'once',
      status: 'succeeded',
      payment_method: 'paypal',
      donor_name: donorName || undefined,
      donor_email: donorEmail,
    })

    if (error) {
      // Le paiement PayPal a déjà été capturé : on ne fait pas échouer la
      // requête côté donateur, mais on journalise pour ne pas perdre le don.
      console.error('PayPal donation insert failed (payment already captured):', error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PayPal capture order error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la finalisation du paiement PayPal.' },
      { status: 500 }
    )
  }
}
