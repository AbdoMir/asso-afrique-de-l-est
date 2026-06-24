import Stripe from 'stripe'
import { requireEnv } from '@/lib/env'

// Lecture paresseuse des variables Stripe : on ne veut pas faire planter le
// build entier si Stripe n'est pas encore configuré (les autres
// fonctionnalités du site doivent rester déployables indépendamment).
let _stripe: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  }
  return _stripe
}

const STRIPE_PRICE_ENV_KEYS = {
  monthly_5: 'STRIPE_PRICE_5_MONTHLY',
  monthly_10: 'STRIPE_PRICE_10_MONTHLY',
  monthly_20: 'STRIPE_PRICE_20_MONTHLY',
} as const

export function getStripePriceId(formula: keyof typeof STRIPE_PRICE_ENV_KEYS): string {
  return requireEnv(STRIPE_PRICE_ENV_KEYS[formula])
}

export async function createStripeCustomer(params: {
  email: string
  name: string
  phone?: string
  address?: {
    line1: string
    city: string
    postal_code: string
    country: string
  }
  metadata?: Record<string, string>
}) {
  return getStripeClient().customers.create({
    email: params.email,
    name: params.name,
    phone: params.phone,
    address: params.address
      ? {
          line1: params.address.line1,
          city: params.address.city,
          postal_code: params.address.postal_code,
          country: params.address.country || 'FR',
        }
      : undefined,
    metadata: params.metadata,
    preferred_locales: ['fr'],
  })
}

export async function cancelSubscription(subscriptionId: string) {
  return getStripeClient().subscriptions.cancel(subscriptionId)
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return getStripeClient().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return getStripeClient().webhooks.constructEvent(
    payload,
    signature,
    requireEnv('STRIPE_WEBHOOK_SECRET')
  )
}
