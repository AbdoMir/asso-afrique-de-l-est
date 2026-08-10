import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

const HIBP_RANGE_URL = 'https://api.pwnedpasswords.com/range'

/**
 * Relais vers l'API « Pwned Passwords » de HaveIBeenPwned.
 *
 * Pourquoi passer par notre serveur plutôt que d'appeler HIBP depuis le
 * navigateur :
 *   - l'adresse IP de l'adhérent n'est pas exposée à un service tiers ;
 *   - la politique de sécurité du contenu (CSP) reste limitée à `'self'`,
 *     sans ouvrir `connect-src` à un domaine externe.
 *
 * Ce que reçoit cette route : les **5 premiers caractères** de l'empreinte
 * SHA-1, calculée dans le navigateur. Ni le mot de passe ni son empreinte
 * complète ne transitent — un préfixe de 5 caractères correspond à des
 * centaines de milliers d'empreintes possibles.
 */
export async function GET(request: NextRequest) {
  if (await isRateLimited(`pwned:${getClientIp(request)}`, 30, 10 * 60 * 1000)) {
    return new NextResponse('Trop de requêtes', { status: 429 })
  }

  const prefix = request.nextUrl.searchParams.get('prefix')

  // Exactement 5 caractères hexadécimaux : tout le reste est soit une erreur,
  // soit une tentative de détourner la route en relais ouvert.
  if (!prefix || !/^[0-9A-Fa-f]{5}$/.test(prefix)) {
    return new NextResponse('Préfixe invalide', { status: 400 })
  }

  try {
    const response = await fetch(`${HIBP_RANGE_URL}/${prefix.toUpperCase()}`, {
      headers: { 'Add-Padding': 'true' },
      // La réponse d'un préfixe donné ne change qu'au rythme des nouvelles
      // fuites : un jour de cache évite d'interroger HIBP à chaque frappe.
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      console.error('HaveIBeenPwned a répondu', response.status)
      return new NextResponse('Service indisponible', { status: 502 })
    }

    return new NextResponse(await response.text(), {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Appel HaveIBeenPwned échoué:', error)
    return new NextResponse('Service indisponible', { status: 502 })
  }
}
