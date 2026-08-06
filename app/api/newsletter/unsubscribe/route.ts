import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

/**
 * Désinscription de la newsletter à partir du jeton envoyé par email.
 *
 * Route publique par nature : le jeton est un UUID v4 non devinable, c'est lui
 * qui prouve que le demandeur a accès à la boîte mail. Exiger une connexion
 * serait un obstacle au droit d'opposition (art. 21) — la plupart des inscrits
 * n'ont pas de compte.
 *
 * La ligne est supprimée, conformément à ce qu'annonce la politique de
 * confidentialité (« conservées jusqu'à votre désinscription »). Une
 * réinscription ultérieure repassera par le double opt-in.
 */
async function unsubscribeByToken(token: string): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('confirmation_token', token)

  if (error) {
    console.error('Newsletter unsubscribe error:', error)
    throw error
  }
}

/** Lien cliqué depuis un email. */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const token = request.nextUrl.searchParams.get('token')

  // Limite le balayage de jetons au hasard.
  if (await isRateLimited(`newsletter-unsubscribe:${getClientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.redirect(`${baseUrl}/newsletter/desinscription?statut=erreur`)
  }

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/newsletter/desinscription?statut=erreur`)
  }

  try {
    await unsubscribeByToken(token)
  } catch {
    return NextResponse.redirect(`${baseUrl}/newsletter/desinscription?statut=erreur`)
  }

  // Jeton inconnu ou déjà utilisé : même réponse qu'un succès. D'une part le
  // résultat attendu est atteint (l'adresse ne recevra rien), d'autre part
  // distinguer les deux cas transformerait la route en oracle permettant de
  // tester si une adresse est inscrite.
  return NextResponse.redirect(`${baseUrl}/newsletter/desinscription?statut=ok`)
}

/**
 * Désinscription en un clic (RFC 8058). Les messageries qui affichent leur
 * propre bouton « Se désabonner » appellent cette route en POST, sans ouvrir de
 * navigateur : la réponse doit donc être un simple 200, pas une redirection.
 */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (await isRateLimited(`newsletter-unsubscribe:${getClientIp(request)}`, 20, 10 * 60 * 1000)) {
    return new NextResponse('Trop de requêtes', { status: 429 })
  }

  if (!token) {
    return new NextResponse('Jeton manquant', { status: 400 })
  }

  try {
    await unsubscribeByToken(token)
  } catch {
    return new NextResponse('Erreur lors de la désinscription', { status: 500 })
  }

  return new NextResponse('Désinscription enregistrée', { status: 200 })
}
