// Validation des variables d'environnement critiques au démarrage du serveur.
// Sans ça, une variable manquante n'est détectée qu'au premier appel du code
// qui en a besoin (ex: au premier paiement), bien après la mise en ligne.
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
]

export function register() {
  // Ce hook tourne aussi dans le runtime Edge (middleware) ; la validation
  // ne concerne que le serveur Node.js (API routes, Server Components).
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name])

  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes au démarrage : ${missing.join(', ')}. Voir .env.example.`
    )
  }
}
