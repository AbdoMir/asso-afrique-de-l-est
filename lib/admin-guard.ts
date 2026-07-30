import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

export async function requireStaff(request: NextRequest) {
  // Ces routes ne sont utilisables qu'apres authentification, mais un token
  // de session vole/compromis pourrait quand meme etre utilise pour marteler
  // l'API. Limite genereuse (usage admin normal : plusieurs creneaux ajoutes
  // a la suite) mais qui bloque un abus.
  if (await isRateLimited(`admin:${getClientIp(request)}`, 60, 5 * 60 * 1000)) {
    return { error: NextResponse.json({ error: 'Trop de requêtes. Veuillez réessayer plus tard.' }, { status: 429 }) }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_staff')
    .eq('id', user.id)
    .single()

  if (!profile?.is_staff) {
    return { error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) }
  }

  return { user }
}
