import { describe, it, expect } from 'vitest'
import {
  PASSWORD_MIN_LENGTH,
  validatePasswordStrength,
  sha1Hex,
  suffixIsPwned,
  isPasswordPwned,
} from '@/lib/password-policy'

describe('validatePasswordStrength', () => {
  it('refuse un mot de passe trop court', () => {
    const error = validatePasswordStrength('a'.repeat(PASSWORD_MIN_LENGTH - 1))
    expect(error).toContain(String(PASSWORD_MIN_LENGTH))
  })

  it('refuse un mot de passe assez long mais trop répétitif', () => {
    // Atteint la longueur requise sans rien valoir : 2 caractères distincts.
    expect(validatePasswordStrength('ababababababab')).toContain('répétitif')
  })

  it('refuse une phrase de passe sans chiffre', () => {
    // Supabase exige « Letters and digits » : sans ce contrôle local, il
    // renverrait une erreur brute en anglais après coup.
    expect(validatePasswordStrength('le chat dort sur le toit')).toContain('chiffre')
  })

  it('refuse un mot de passe sans lettre', () => {
    expect(validatePasswordStrength('194037258164')).toContain('lettre')
  })

  it('accepte une phrase de passe comportant un chiffre', () => {
    expect(validatePasswordStrength('le chat dort sur 2 toits')).toBeNull()
  })

  it('accepte un mot de passe pile à la longueur minimale', () => {
    const motDePasse = 'Corail7xBleu'
    expect(motDePasse).toHaveLength(PASSWORD_MIN_LENGTH)
    expect(validatePasswordStrength(motDePasse)).toBeNull()
  })
})

describe('sha1Hex', () => {
  // Vecteur de référence : c'est l'empreinte que HaveIBeenPwned attend pour
  // « password », et le préfixe 5BAA6 sert d'exemple dans sa documentation.
  it('produit une empreinte SHA-1 en majuscules', async () => {
    expect(await sha1Hex('password')).toBe('5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8')
  })
})

describe('suffixIsPwned', () => {
  const reponse = [
    '1E4C9B93F3F0682250B6CF8331B7EE68FD8:9659365',
    '0018A45C4D1DEF81644B54AB7F969B88D65:1',
  ].join('\r\n')

  it('reconnaît un suffixe présent', () => {
    expect(suffixIsPwned('1E4C9B93F3F0682250B6CF8331B7EE68FD8', reponse)).toBe(true)
  })

  it('ignore un suffixe absent', () => {
    expect(suffixIsPwned('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', reponse)).toBe(false)
  })
})

describe('isPasswordPwned', () => {
  it("n'envoie que les 5 premiers caractères de l'empreinte", async () => {
    let prefixeRecu = ''
    await isPasswordPwned('password', async (prefix) => {
      prefixeRecu = prefix
      return ''
    })

    expect(prefixeRecu).toBe('5BAA6')
    expect(prefixeRecu).toHaveLength(5)
  })

  it('détecte un mot de passe présent dans une fuite', async () => {
    const pwned = await isPasswordPwned('password', async () =>
      '1E4C9B93F3F0682250B6CF8331B7EE68FD8:9659365'
    )
    expect(pwned).toBe(true)
  })

  it('laisse passer si le service est injoignable', async () => {
    // Un tiers en panne ne doit pas empêcher la création d'un compte.
    const pwned = await isPasswordPwned('password', async () => {
      throw new Error('réseau indisponible')
    })
    expect(pwned).toBe(false)
  })
})
