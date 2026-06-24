import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createPayPalOrder, isPayPalConfigured } from '@/lib/paypal/client'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

const createOrderSchema = z.object({
  amount: z.number().min(1).max(10000),
  donor_email: z.string().email().optional(),
})

export async function POST(request: NextRequest) {
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: 'Le paiement PayPal n\'est pas encore disponible. Merci de choisir un autre moyen de paiement.' },
      { status: 503 }
    )
  }

  try {
    if (isRateLimited(`paypal-create-order:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = createOrderSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const order = await createPayPalOrder({
      amount: validated.data.amount,
      donorEmail: validated.data.donor_email,
      returnUrl: `${baseUrl}/adherer-soutenir/merci?source=paypal`,
      cancelUrl: `${baseUrl}/adherer-soutenir?error=paypal`,
    })

    const approveLink = order.links?.find((l: { rel: string; href: string }) => l.rel === 'approve')

    return NextResponse.json({
      orderId: order.id,
      redirectUrl: approveLink?.href,
    })
  } catch (error) {
    console.error('PayPal create order error:', error)
    return NextResponse.json(
      { error: 'Erreur PayPal. Veuillez réessayer ou nous contacter.' },
      { status: 500 }
    )
  }
}
