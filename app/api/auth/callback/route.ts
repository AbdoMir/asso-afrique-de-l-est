import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeRedirectPath } from '@/lib/safe-redirect'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')

  // N'accepter que des chemins relatifs internes, jamais une URL absolue.
  const redirect = safeRedirectPath(searchParams.get('redirect'))

  // Supabase renvoie ses propres erreurs OAuth dans l'URL (lien expiré,
  // annulation côté fournisseur...) : sans code, rien à échanger.
  const oauthError = searchParams.get('error_description') || searchParams.get('error')

  if (oauthError) {
    console.error('Auth callback: erreur renvoyée par le fournisseur', oauthError)
    return NextResponse.redirect(`${origin}/login?error=auth_callback`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  // Sans ce contrôle, un échange raté renvoyait l'utilisateur vers l'espace
  // adhérent sans session : le middleware le rebasculait aussitôt vers /login,
  // sans la moindre explication.
  if (error) {
    console.error('Auth callback: échange du code impossible', error)
    return NextResponse.redirect(`${origin}/login?error=auth_callback`)
  }

  return NextResponse.redirect(`${origin}${redirect}`)
}
