import { NextRequest, NextResponse } from 'next/server'
import { isPayPalConfigured, verifyPayPalWebhookSignature } from '@/lib/paypal/client'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ error: 'PayPal non configuré' }, { status: 503 })
  }

  const body = await request.text()

  const isValid = await verifyPayPalWebhookSignature(request.headers, body)
  if (!isValid) {
    console.error('PayPal webhook signature verification failed')
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const event = JSON.parse(body)

  try {
    switch (event.event_type) {
      // La capture initiale est déjà enregistrée via /api/paypal/capture-order.
      // Ce webhook ne gère que les événements asynchrones (remboursements,
      // litiges) une fois le compte PayPal Business configuré.
      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'CUSTOMER.DISPUTE.CREATED':
        console.log(`PayPal event reçu : ${event.event_type}`, event.resource?.id)
        break

      default:
        console.log(`Unhandled PayPal webhook event type: ${event.event_type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
