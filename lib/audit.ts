import type { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp } from '@/lib/rate-limit'

/**
 * Journal des accès aux données personnelles.
 *
 * Sans journal, une association ne peut ni identifier l'origine d'une fuite, ni
 * démontrer que les accès à ses données étaient légitimes. Le RGPD attend les
 * deux : l'art. 32 pour la sécurité, l'art. 5.2 pour la capacité à en rendre
 * compte.
 *
 * Ce qui est consigné : qui, quoi, quand, depuis quelle adresse. Jamais le
 * contenu consulté — un journal qui recopierait les messages qu'il surveille
 * doublerait l'exposition au lieu de la réduire.
 */

export type AuditActorRole = 'staff' | 'member' | 'system'

interface AuditEntry {
  actorId?: string | null
  actorEmail?: string | null
  actorRole: AuditActorRole
  /** Verbe au format `ressource.action`, ex. `booking.cancel`. */
  action: string
  resourceType?: string
  resourceId?: string
  /** Contexte utile à une enquête. Ne jamais y placer de données sensibles. */
  metadata?: Record<string, unknown>
  request?: NextRequest
}

/**
 * Écrit une entrée dans le journal.
 *
 * N'échoue jamais bruyamment : un journal indisponible ne doit pas empêcher
 * une adhérente de télécharger son document ni un bénévole de faire son
 * travail. L'échec est signalé dans les logs serveur, où il sera vu.
 */
export async function logAccess(entry: AuditEntry): Promise<void> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from('audit_log').insert({
      actor_id: entry.actorId ?? null,
      actor_email: entry.actorEmail ?? null,
      actor_role: entry.actorRole,
      action: entry.action,
      resource_type: entry.resourceType ?? null,
      resource_id: entry.resourceId ?? null,
      metadata: entry.metadata ?? null,
      ip: entry.request ? getClientIp(entry.request) : null,
    })

    if (error) {
      console.error('Journalisation impossible:', error.message, entry.action)
    }
  } catch (error) {
    console.error('Journalisation impossible:', error)
  }
}
