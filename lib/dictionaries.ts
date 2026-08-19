import type { Locale } from '@/lib/i18n'
import { fr, type Dictionary } from '@/messages/fr'
import { en } from '@/messages/en'
import { ar } from '@/messages/ar'

/**
 * Résolution d'une langue vers son dictionnaire.
 *
 * Les trois fichiers sont importés directement plutôt que chargés à la
 * demande : le site est pré-rendu en statique, il n'y a donc aucun coût de
 * chargement à l'exécution, et le typage reste vérifiable d'un bout à l'autre.
 */
const DICTIONARIES: Record<Locale, Dictionary> = { fr, en, ar }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}

export type { Dictionary }
