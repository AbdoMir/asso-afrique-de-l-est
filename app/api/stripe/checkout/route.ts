import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'
import {
  FORMULA_AMOUNTS,
  MONTHLY_PRICE_IDS,
  getStripe,
  isFormula,
  isMonthlyFormula,
} from '@/lib/stripe/client'
import { LOCALES, pathFor, type Locale } from '@/lib/i18n'

export const runtime = 'nodejs'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asso.afrique.est-sa.org'

const schema = z.object({
  formula: z.string().refine(isFormula, 'Formule inconnue'),
  // Acceptation des statuts : condition d'adhésion, recueillie chez nous et
  // non chez Stripe, qui n'en a pas connaissance.
  acceptStatutes: z.literal(true),
  newsletterConsent: z.boolean().optional().default(false),
  locale: z.enum(LOCALES).optional().default('fr'),
})

/**
 * Langue de la page de paiement Stripe.
 *
 * Stripe Checkout ne propose pas l'arabe. Plutôt que d'imposer le français à
 * un lecteur arabophone, on laisse `auto` : Stripe retient alors la langue du
 * navigateur parmi celles qu'il gère, ce qui donne au moins un résultat
 * compréhensible.
 */
function stripeLocale(locale: Locale): Stripe.Checkout.SessionCreateParams.Locale {
  if (locale === 'fr') return 'fr'
  if (locale === 'en') return 'en'
  return 'auto'
}

export async function POST(request: NextRequest) {
  try {
    if (await isRateLimited(`checkout:${getClientIp(request)}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    }

    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const { formula, newsletterConsent, locale } = parsed.data

    // Le montant n'est jamais lu depuis la requête : le navigateur n'envoie
    // qu'un identifiant de formule. Sans cela, n'importe qui adhérerait pour
    // un centime en modifiant le corps de l'appel.
    const amount = FORMULA_AMOUNTS[formula]

    // Rattachement au compte quand la personne est connectée. C'est un net
    // progrès sur HelloAsso, qui ne transportait aucune métadonnée : le don ne
    // se raccrochait qu'à l'email du payeur, au petit bonheur.
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const stripe = getStripe()
    const monthly = isMonthlyFormula(formula)

    let lineItem: Stripe.Checkout.SessionCreateParams.LineItem

    if (monthly) {
      const priceId = MONTHLY_PRICE_IDS[formula]
      if (!priceId) {
        // Message explicite plutôt qu'une erreur Stripe opaque : c'est une
        // erreur de configuration, pas une erreur du donateur.
        console.error(`Tarif Stripe manquant pour la formule ${formula}`)
        return NextResponse.json(
          { error: 'Cette formule est momentanément indisponible.' },
          { status: 503 }
        )
      }
      lineItem = { price: priceId, quantity: 1 }
    } else {
      lineItem = {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: amount * 100,
          product_data: {
            name: "Adhésion à l'Association Afrique de l'Est et ses amis",
            description: 'Adhésion annuelle',
          },
        },
      }
    }

    const metadata = {
      formula,
      user_id: user?.id ?? '',
      newsletter_consent: String(newsletterConsent),
    }

    const session = await stripe.checkout.sessions.create({
      mode: monthly ? 'subscription' : 'payment',
      line_items: [lineItem],
      locale: stripeLocale(locale),

      // Le reçu fiscal CERFA exige l'adresse du donateur, qu'aucune table ne
      // détenait du temps de HelloAsso. La collecter ici évite de la
      // redemander dans notre propre formulaire.
      billing_address_collection: 'required',
      customer_email: user?.email ?? undefined,

      // Ces métadonnées sont ce que le webhook relira pour écrire en base.
      // `subscription_data` les duplique volontairement : une échéance
      // mensuelle arrive par `invoice.paid`, qui ne voit pas la session
      // d'origine et n'aurait donc aucun moyen de retrouver l'adhérent.
      metadata,
      ...(monthly ? { subscription_data: { metadata } } : {}),

      success_url: `${siteUrl}/adherer-soutenir/merci`,
      cancel_url: `${siteUrl}${pathFor('support', locale)}#don-mensuel`,
    })

    if (!session.url) {
      throw new Error("Stripe n'a pas renvoyé d'URL de paiement")
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Le paiement est momentanément indisponible. Merci de réessayer.' },
      { status: 500 }
    )
  }
}
