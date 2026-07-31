import crypto from 'crypto'

/**
 * Vérifie la signature HMAC-SHA256 d'une notification HelloAsso.
 *
 * HelloAsso place dans l'en-tête `x-ha-signature` le HMAC-SHA256 hexadécimal
 * du corps brut de la requête, calculé avec la `signatureKey` associée à
 * l'URL de notification.
 * https://dev.helloasso.com/docs/secure-webhook
 *
 * Isolé de la route pour être testable : c'est le seul rempart contre une
 * notification de paiement forgée quand la clé est disponible.
 *
 * @param rawBody corps de la requête tel que reçu, avant tout parsing JSON —
 *                re-sérialiser l'objet changerait les octets et invaliderait
 *                la signature.
 */
export function verifyHelloAssoSignature(
  rawBody: string,
  signature: string | null | undefined,
  signatureKey: string | undefined
): boolean {
  if (!signatureKey || !signature) return false

  const expected = crypto.createHmac('sha256', signatureKey).update(rawBody).digest('hex')

  const received = Buffer.from(signature, 'utf8')
  const computed = Buffer.from(expected, 'utf8')

  // timingSafeEqual exige des longueurs égales : on compare d'abord, sinon il
  // lève au lieu de renvoyer false.
  if (received.length !== computed.length) return false

  return crypto.timingSafeEqual(received, computed)
}
