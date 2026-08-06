import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNewsletterWelcome } from '@/lib/resend/emails'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

/**
 * Valide une inscription newsletter à partir du jeton envoyé par email.
 *
 * Route publique par nature : le jeton est un UUID v4 non devinable, c'est lui
 * qui prouve que le demandeur a bien accès à la boîte mail.
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Limite le balayage de jetons au hasard.
  if (await isRateLimited(`newsletter-confirm:${getClientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.redirect(`${baseUrl}/?newsletter=erreur`)
  }

  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/?newsletter=erreur`)
  }

  const supabase = createAdminClient()

  const { data: subscriber } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, first_name, confirmed')
    .eq('confirmation_token', token)
    .maybeSingle()

  if (!subscriber) {
    return NextResponse.redirect(`${baseUrl}/?newsletter=erreur`)
  }

  // Lien recliqué : l'inscription est déjà valide, on n'renvoie pas un second
  // email de bienvenue.
  if (subscriber.confirmed) {
    return NextResponse.redirect(`${baseUrl}/?newsletter=confirme`)
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ confirmed: true, confirmed_at: new Date().toISOString() })
    .eq('id', subscriber.id)

  if (error) {
    console.error('Newsletter confirm error:', error)
    return NextResponse.redirect(`${baseUrl}/?newsletter=erreur`)
  }

  // Le jeton sert ensuite de clé de désinscription : c'est lui qui alimente le
  // lien et les en-têtes List-Unsubscribe de tous les emails de newsletter.
  const { error: emailError } = await sendNewsletterWelcome({
    to: subscriber.email,
    firstName: subscriber.first_name ?? undefined,
    unsubscribeToken: token,
  })

  if (emailError) {
    console.error('Newsletter welcome email error:', emailError)
  }

  return NextResponse.redirect(`${baseUrl}/?newsletter=confirme`)
}
