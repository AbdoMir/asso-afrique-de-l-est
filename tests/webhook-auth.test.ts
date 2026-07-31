import { describe, it, expect } from 'vitest'
import crypto from 'crypto'
import { verifyHelloAssoSignature } from '@/lib/helloasso/webhook-auth'

const KEY = 'cle-de-signature-de-test'

function sign(body: string, key = KEY): string {
  return crypto.createHmac('sha256', key).update(body).digest('hex')
}

describe('verifyHelloAssoSignature', () => {
  const body = JSON.stringify({ eventType: 'Payment', data: { id: 15222, amount: 1000 } })

  it('accepte une signature calculée avec la bonne clé', () => {
    expect(verifyHelloAssoSignature(body, sign(body), KEY)).toBe(true)
  })

  it('rejette une signature calculée avec une autre clé', () => {
    expect(verifyHelloAssoSignature(body, sign(body, 'mauvaise-cle'), KEY)).toBe(false)
  })

  it('rejette un corps modifié après signature', () => {
    // Cas concret : un attaquant intercepte une notification légitime et
    // gonfle le montant du don avant de la rejouer.
    const signature = sign(body)
    const falsifie = JSON.stringify({
      eventType: 'Payment',
      data: { id: 15222, amount: 999999 },
    })
    expect(verifyHelloAssoSignature(falsifie, signature, KEY)).toBe(false)
  })

  it('rejette une signature absente', () => {
    expect(verifyHelloAssoSignature(body, null, KEY)).toBe(false)
    expect(verifyHelloAssoSignature(body, undefined, KEY)).toBe(false)
    expect(verifyHelloAssoSignature(body, '', KEY)).toBe(false)
  })

  it('rejette quand aucune clé n\'est configurée', () => {
    // Sans clé, on ne doit jamais considérer une notification comme
    // authentifiée : la route bascule alors sur la vérification par API.
    expect(verifyHelloAssoSignature(body, sign(body), undefined)).toBe(false)
    expect(verifyHelloAssoSignature(body, sign(body), '')).toBe(false)
  })

  it('ne lève pas sur une signature de longueur différente', () => {
    // timingSafeEqual lève si les tampons n'ont pas la même taille : la
    // fonction doit renvoyer false, pas provoquer une 500.
    expect(() => verifyHelloAssoSignature(body, 'court', KEY)).not.toThrow()
    expect(verifyHelloAssoSignature(body, 'court', KEY)).toBe(false)
  })

  it('est sensible à la sérialisation exacte du corps', () => {
    // Le corps brut doit être signé tel quel : re-sérialiser un objet JSON
    // change les octets (espaces, ordre des clés) et invalide la signature.
    const signature = sign(body)
    const reserialise = JSON.stringify(JSON.parse(body), null, 2)
    expect(verifyHelloAssoSignature(reserialise, signature, KEY)).toBe(false)
  })
})
