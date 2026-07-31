import { requireEnv } from '@/lib/env'

const HELLOASSO_BASE_URL = 'https://api.helloasso.com/v5'
const HELLOASSO_AUTH_URL = 'https://api.helloasso.com/oauth2/token'

let accessToken: string | null = null
let tokenExpiry: number = 0

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  const response = await fetch(HELLOASSO_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: requireEnv('HELLOASSO_CLIENT_ID'),
      client_secret: requireEnv('HELLOASSO_CLIENT_SECRET'),
    }),
  })

  if (!response.ok) {
    throw new Error(`HelloAsso auth failed: ${response.statusText}`)
  }

  const data = await response.json()
  accessToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000

  return accessToken!
}

async function helloAssoFetch(endpoint: string, options?: RequestInit) {
  const token = await getAccessToken()
  const response = await fetch(`${HELLOASSO_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HelloAsso API error: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Récupère un paiement auprès de l'API HelloAsso.
 *
 * Sert de vérification faisant autorité lorsqu'une notification webhook
 * arrive sans signature HMAC : la clé de signature n'est délivrée qu'aux
 * comptes partenaires, l'API reste donc le seul recours pour les autres.
 */
export async function getPayment(paymentId: number | string) {
  return helloAssoFetch(`/payments/${paymentId}`)
}
