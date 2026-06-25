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
