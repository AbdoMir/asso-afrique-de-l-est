import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types'

// `process.env.NEXT_PUBLIC_*` doit rester un accès littéral ici (pas via
// requireEnv()) : Next.js n'inline les variables NEXT_PUBLIC_ dans le bundle
// navigateur que pour les accès statiques `process.env.NEXT_PUBLIC_X`, pas
// pour un accès dynamique `process.env[name]`.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      "Variable d'environnement manquante : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY. Voir .env.example."
    )
  }

  return createBrowserClient<Database>(url, anonKey)
}

/**
 * Le mode démo simule une session à partir du localStorage, sans aucune
 * vérification : n'importe quel identifiant est accepté. Il n'a de sens qu'en
 * développement, quand Supabase n'est pas encore configuré.
 *
 * En production, une configuration Supabase absente doit se traduire par un
 * service indisponible — surtout pas par une authentification factice qui
 * ouvrirait l'espace adhérent à tout le monde.
 */
export const DEMO_MODE_ALLOWED = process.env.NODE_ENV !== 'production'

/**
 * Variante non bloquante de `createClient()` : renvoie `null` au lieu de lever
 * lorsque la configuration manque, pour laisser l'appelant afficher un état
 * dégradé plutôt que de faire planter le rendu.
 */
export function createClientSafe() {
  try {
    return createClient()
  } catch (error) {
    console.error('Supabase init failed', error)
    return null
  }
}
