import { describe, it, expect } from 'vitest'
import { escapeHtml, formatCurrency, slugify, truncate, getInitials } from '@/lib/utils'

describe('escapeHtml', () => {
  // Tous les emails du site sont assemblés par concaténation de chaînes :
  // c'est la seule barrière contre l'injection de HTML dans un message reçu.
  it('neutralise les caractères qui ouvriraient du balisage', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    )
  })

  it('échappe guillemets et apostrophes (sortie en attribut)', () => {
    expect(escapeHtml('a"b\'c')).toBe('a&quot;b&#39;c')
  })

  it('échappe l\'esperluette sans double encodage en cascade', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('laisse intact un texte sans caractère spécial', () => {
    expect(escapeHtml('Adhésion annuelle 2026')).toBe('Adhésion annuelle 2026')
  })

  it('gère une chaîne vide', () => {
    expect(escapeHtml('')).toBe('')
  })
})

describe('formatCurrency', () => {
  it('formate en euros selon la convention française', () => {
    // L'espace avant € est une espace insécable (U+202F ou U+00A0 selon ICU).
    expect(formatCurrency(10)).toMatch(/^10\s?€$/u)
    expect(formatCurrency(0)).toMatch(/^0\s?€$/u)
  })
})

describe('slugify', () => {
  it('retire les accents et normalise les séparateurs', () => {
    expect(slugify('Adhésion Annuelle')).toBe('adhesion-annuelle')
    expect(slugify("Afrique de l'Est & ses amis")).toBe('afrique-de-l-est-ses-amis')
  })

  it('ne laisse pas de tiret en début ou fin', () => {
    expect(slugify('  !! Bonjour !!  ')).toBe('bonjour')
  })
})

describe('truncate', () => {
  it('ne touche pas à un texte plus court que la limite', () => {
    expect(truncate('Bonjour', 20)).toBe('Bonjour')
  })

  it('coupe et ajoute une ellipse au-delà de la limite', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcde…')
  })
})

describe('getInitials', () => {
  it('compose les initiales en majuscules', () => {
    expect(getInitials('amina', 'diallo')).toBe('AD')
  })

  it('tolère un nom manquant', () => {
    expect(getInitials('Amina', '')).toBe('A')
  })
})
