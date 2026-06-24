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

export async function createCheckoutSession(params: {
  formSlug: string
  amount?: number
  firstName?: string
  lastName?: string
  email?: string
  returnUrl: string
  errorUrl: string
  backUrl: string
}) {
  const orgSlug = requireEnv('NEXT_PUBLIC_HELLOASSO_ORG_SLUG')

  const body = {
    totalAmount: params.amount ? params.amount * 100 : undefined, // en centimes
    initialValues: {
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
    },
    redirectParameters: {
      returnUrl: params.returnUrl,
      errorUrl: params.errorUrl,
      backUrl: params.backUrl,
    },
    metadata: {
      source: 'asso-aes-website',
    },
  }

  return helloAssoFetch(`/organizations/${orgSlug}/checkout-intents`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getOrganizationStats() {
  const orgSlug = requireEnv('NEXT_PUBLIC_HELLOASSO_ORG_SLUG')
  return helloAssoFetch(`/organizations/${orgSlug}`)
}

export async function getFormOrders(formSlug: string) {
  const orgSlug = requireEnv('NEXT_PUBLIC_HELLOASSO_ORG_SLUG')
  return helloAssoFetch(`/organizations/${orgSlug}/forms/Donation/${formSlug}/orders`)
}
