import Stripe from 'stripe'
import { requireEnv } from '@/lib/env'

export const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const STRIPE_PRICE_IDS = {
  monthly_5: requireEnv('STRIPE_PRICE_5_MONTHLY'),
  monthly_10: requireEnv('STRIPE_PRICE_10_MONTHLY'),
  monthly_20: requireEnv('STRIPE_PRICE_20_MONTHLY'),
} as const

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
  return stripe.customers.create({
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
  return stripe.subscriptions.cancel(subscriptionId)
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    requireEnv('STRIPE_WEBHOOK_SECRET')
  )
}
