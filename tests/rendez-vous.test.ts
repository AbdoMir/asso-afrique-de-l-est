import { describe, it, expect } from 'vitest'
import { reasonsForType, APPOINTMENT_REASON_LABELS } from '@/lib/rendez-vous'

describe('motifs proposés selon le type de rendez-vous', () => {
  it('ne propose pas « Cours de français » sur un créneau administratif', () => {
    // C'est l'incohérence que ce filtrage corrige : la personne se demandait
    // laquelle de ses deux réponses comptait.
    const motifs = reasonsForType('administratif').map((m) => m.id)
    expect(motifs).not.toContain('cours_francais')
    expect(motifs).toContain('aide_administrative')
  })

  it('ne pose aucune question sur un cours de FLE', () => {
    // Le type dit déjà tout : préciser le besoin reposerait la même question.
    expect(reasonsForType('fle_atelier')).toEqual([])
  })

  it('propose la liste complète sur un rendez-vous général', () => {
    const motifs = reasonsForType('autre').map((m) => m.id)
    expect(motifs).toHaveLength(Object.keys(APPOINTMENT_REASON_LABELS).length)
  })

  it('ne propose rien tant qu’aucun type n’est choisi', () => {
    expect(reasonsForType(null)).toEqual([])
  })

  it('renvoie des libellés lisibles, jamais des identifiants bruts', () => {
    const motifs = reasonsForType('administratif')
    expect(motifs.map((m) => m.label)).toContain('Aide administrative')
    expect(motifs.every((m) => m.label && m.label !== m.id)).toBe(true)
  })
})
