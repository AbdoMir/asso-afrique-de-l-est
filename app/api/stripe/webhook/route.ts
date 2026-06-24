import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripeClient, constructWebhookEvent } from '@/lib/stripe/client'
import { sendWelcomeEmail } from '@/lib/resend/emails'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      // SetupIntent succeeded → create subscription
      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as Stripe.SetupIntent
        const { formula, price_id, donor_name, donor_email } = setupIntent.metadata || {}

        if (!setupIntent.payment_method || !price_id) break

        // Le donateur a choisi CB ou SEPA sur la page de confirmation —
        // on le détermine à partir du moyen de paiement réellement attaché.
        const paymentMethod = await getStripeClient().paymentMethods.retrieve(
          setupIntent.payment_method as string
        )
        const paymentMethodType = paymentMethod.type === 'card' ? 'card' : 'sepa_debit'

        // Create the actual subscription
        const subscription = await getStripeClient().subscriptions.create({
          customer: setupIntent.customer as string,
          items: [{ price: price_id }],
          default_payment_method: setupIntent.payment_method as string,
          payment_settings: {
            payment_method_types: [paymentMethodType],
            save_default_payment_method: 'on_subscription',
          },
          metadata: { ...setupIntent.metadata, payment_method: paymentMethodType },
        })

        // Save to Supabase
        const amounts: Record<string, number> = { monthly_5: 5, monthly_10: 10, monthly_20: 20 }
        await supabase.from('donations').insert({
          amount: amounts[formula] || 0,
          frequency: 'monthly',
          status: 'pending',
          stripe_subscription_id: subscription.id,
          donor_name,
          donor_email,
          payment_method: paymentMethodType,
        })

        break
      }

      // Invoice paid → record donation + send welcome email
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (!subscriptionId) break

        // Get subscription details
        const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId)
        const { formula, donor_name, donor_email, payment_method } = subscription.metadata

        const amounts: Record<string, number> = { monthly_5: 5, monthly_10: 10, monthly_20: 20 }
        const amount = amounts[formula] || (invoice.amount_paid / 100)

        // Update donation status
        const { data: existingDonation } = await supabase
          .from('donations')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (existingDonation) {
          await supabase
            .from('donations')
            .update({ status: 'succeeded' })
            .eq('id', existingDonation.id)
        } else {
          await supabase.from('donations').insert({
            amount,
            frequency: 'monthly',
            status: 'succeeded',
            stripe_subscription_id: subscriptionId,
            stripe_payment_intent_id: invoice.payment_intent as string,
            donor_name,
            donor_email,
            payment_method: payment_method as 'card' | 'sepa_debit' | undefined,
          })
        }

        // Update membership status
        await supabase
          .from('memberships')
          .update({ status: 'active' })
          .eq('stripe_subscription_id', subscriptionId)

        // Send welcome email on first invoice
        if (invoice.billing_reason === 'subscription_create' && donor_email) {
          const formulaLabels: Record<string, string> = {
            monthly_5: 'Don solidaire',
            monthly_10: 'Don engagé',
            monthly_20: 'Don soutien',
          }
          await sendWelcomeEmail({
            to: donor_email,
            firstName: donor_name?.split(' ')[0] || 'Adhérent',
            formulaLabel: formulaLabels[formula] || formula,
            amount,
            frequency: 'monthly',
          })
        }

        break
      }

      // Invoice failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          await supabase
            .from('donations')
            .update({ status: 'failed' })
            .eq('stripe_subscription_id', subscriptionId)

          await supabase
            .from('memberships')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscriptionId)
        }
        break
      }

      // Subscription cancelled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from('memberships')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
