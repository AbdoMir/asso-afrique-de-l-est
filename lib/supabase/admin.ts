import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types'
import { requireEnv } from '@/lib/env'

// Client privilégié (service_role) pour les écritures serveur sur les tables
// dont les politiques RLS n'autorisent que `auth.role() = 'service_role'`
// (contact_messages, newsletter_subscribers, donations, memberships, fiscal_receipts).
// Ne jamais exposer ce client au navigateur.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
