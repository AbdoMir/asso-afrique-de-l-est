import { describe, it, expect } from 'vitest'
import { montantEnLettres } from '@/lib/cerfa/nombre-en-lettres'

/**
 * Le montant en lettres figure sur un document fiscal opposable. Une faute
 * d'accord n'est pas qu'inélégante : elle affaiblit la pièce en cas de
 * contrôle. Les cas ci-dessous couvrent les règles que le français réserve
 * précisément aux nombres qu'on rencontre sur un reçu de don.
 */
describe('montantEnLettres', () => {
  it('écrit les montants courants des formules', () => {
    expect(montantEnLettres(5)).toBe('cinq euros')
    expect(montantEnLettres(10)).toBe('dix euros')
    expect(montantEnLettres(20)).toBe('vingt euros')
    expect(montantEnLettres(60)).toBe('soixante euros')
    expect(montantEnLettres(120)).toBe('cent vingt euros')
    expect(montantEnLettres(240)).toBe('deux cent quarante euros')
  })

  it('accorde euro au singulier', () => {
    expect(montantEnLettres(1)).toBe('un euro')
  })

  it('respecte le s de quatre-vingts et son absence dès qu un mot suit', () => {
    expect(montantEnLettres(80)).toBe('quatre-vingts euros')
    expect(montantEnLettres(81)).toBe('quatre-vingt-un euros')
    expect(montantEnLettres(90)).toBe('quatre-vingt-dix euros')
    expect(montantEnLettres(91)).toBe('quatre-vingt-onze euros')
  })

  it('respecte le s de cents et son absence dès qu un mot suit', () => {
    expect(montantEnLettres(100)).toBe('cent euros')
    expect(montantEnLettres(200)).toBe('deux cents euros')
    expect(montantEnLettres(201)).toBe('deux cent un euros')
  })

  it('emploie « et » devant un et onze, sauf après quatre-vingt', () => {
    expect(montantEnLettres(21)).toBe('vingt et un euros')
    expect(montantEnLettres(31)).toBe('trente et un euros')
    expect(montantEnLettres(71)).toBe('soixante et onze euros')
    // quatre-vingt-un est la seule dizaine sans liaison.
    expect(montantEnLettres(81)).toBe('quatre-vingt-un euros')
  })

  it('laisse mille invariable', () => {
    expect(montantEnLettres(1000)).toBe('mille euros')
    expect(montantEnLettres(2000)).toBe('deux mille euros')
    expect(montantEnLettres(1500)).toBe('mille cinq cents euros')
  })

  it('mentionne les centimes seulement quand il y en a', () => {
    expect(montantEnLettres(120)).toBe('cent vingt euros')
    expect(montantEnLettres(120.5)).toBe('cent vingt euros et cinquante centimes')
    expect(montantEnLettres(0.01)).toBe('zéro euro et un centime')
  })

  it('arrondit au centime sans dériver en virgule flottante', () => {
    // 0.1 + 0.2 vaut 0.30000000000000004 : sans arrondi préalable, la
    // décomposition produirait « vingt-neuf centimes ».
    expect(montantEnLettres(0.1 + 0.2)).toBe('zéro euro et trente centimes')
    // Douze échéances de 5 € : le cas réel d un donateur mensuel.
    expect(montantEnLettres(5 * 12)).toBe('soixante euros')
  })

  it('refuse un montant négatif ou non fini', () => {
    expect(() => montantEnLettres(-1)).toThrow()
    expect(() => montantEnLettres(Number.NaN)).toThrow()
  })
})
