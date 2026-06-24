// Client PayPal REST (Orders API v2). Les identifiants ne sont pas encore
// fournis : toutes les fonctions lisent les variables d'environnement à
// l'appel (pas au chargement du module) pour ne jamais faire planter l'app,
// et `isPayPalConfigured()` permet aux routes de répondre 503 proprement.

const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

export function isPayPalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('PayPal non configuré (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET manquants)')
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error('Impossible de récupérer le jeton d\'accès PayPal')
  }

  const data = await response.json()
  return data.access_token as string
}

export async function createPayPalOrder(params: {
  amount: number
  returnUrl: string
  cancelUrl: string
  donorEmail?: string
}) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'EUR', value: params.amount.toFixed(2) },
          description: 'Don à l\'Association Afrique de l\'Est et ses amis',
        },
      ],
      payer: params.donorEmail ? { email_address: params.donorEmail } : undefined,
      application_context: {
        brand_name: "Afrique de l'Est et ses amis",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        user_action: 'PAY_NOW',
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Erreur création commande PayPal : ${await response.text()}`)
  }

  return response.json()
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken()

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Erreur capture commande PayPal : ${await response.text()}`)
  }

  return response.json()
}

// Vérifie la signature d'un événement webhook PayPal via l'API de
// vérification officielle (à activer une fois PAYPAL_WEBHOOK_ID configuré).
export async function verifyPayPalWebhookSignature(
  headers: Headers,
  body: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) return false

  const accessToken = await getAccessToken()

  const response = await fetch(
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transmission_id: headers.get('paypal-transmission-id'),
        transmission_time: headers.get('paypal-transmission-time'),
        cert_url: headers.get('paypal-cert-url'),
        auth_algo: headers.get('paypal-auth-algo'),
        transmission_sig: headers.get('paypal-transmission-sig'),
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    }
  )

  if (!response.ok) return false
  const result = await response.json()
  return result.verification_status === 'SUCCESS'
}
