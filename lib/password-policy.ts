/**
 * Politique de mot de passe de l'association.
 *
 * Supabase sait refuser les mots de passe présents dans les fuites connues,
 * mais réserve la fonction à ses offres payantes. On la réimplémente ici : le
 * service HaveIBeenPwned est public et gratuit, l'offre Pro ne fait que
 * l'appeler à votre place.
 *
 * Le parti pris sur la robustesse suit les recommandations actuelles (NIST
 * SP 800-63B) : la longueur et le rejet des mots de passe déjà fuités
 * protègent bien mieux que les règles de composition, qui poussent surtout les
 * gens à transformer « motdepasse » en « Motdepasse1! » — présent dans les
 * fuites lui aussi.
 */

/**
 * Ces deux règles doivent rester identiques au tableau de bord Supabase
 * (Authentication → Sign In / Providers → Email) : « Minimum password length »
 * et « Password requirements ». Sans cela, un mot de passe accepté ici serait
 * refusé par Supabase, et l'adhérent recevrait un message d'erreur brut en
 * anglais au lieu d'une explication claire.
 */
export const PASSWORD_MIN_LENGTH = 12
const REQUIRE_LETTERS_AND_DIGITS = true

export const PASSWORD_HINT =
  `Au moins ${PASSWORD_MIN_LENGTH} caractères, dont une lettre et un chiffre. ` +
  'Une phrase facile à retenir fait un excellent mot de passe.'

/**
 * Contrôle hors ligne. Renvoie un message d'erreur, ou null si le mot de passe
 * est acceptable.
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`
  }

  // Un mot de passe fait d'un seul caractère répété atteint n'importe quelle
  // longueur sans rien valoir.
  if (new Set(password).size < 4) {
    return 'Le mot de passe est trop répétitif. Variez les caractères.'
  }

  if (REQUIRE_LETTERS_AND_DIGITS && !(/\p{L}/u.test(password) && /\d/.test(password))) {
    return 'Le mot de passe doit contenir au moins une lettre et un chiffre.'
  }

  return null
}

/** SHA-1 hexadécimal majuscule — le format attendu par l'API HaveIBeenPwned. */
export async function sha1Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await globalThis.crypto.subtle.digest('SHA-1', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

/**
 * Cherche le suffixe d'empreinte dans la réponse de HaveIBeenPwned.
 *
 * Le corps renvoyé est une liste de lignes « SUFFIXE:NOMBRE ». On ne compare
 * que le suffixe : le préfixe est commun à toutes les lignes par construction.
 */
export function suffixIsPwned(suffix: string, hibpResponse: string): boolean {
  return hibpResponse
    .split('\n')
    .some((line) => line.split(':')[0]?.trim().toUpperCase() === suffix)
}

/**
 * Indique si le mot de passe figure dans une fuite connue.
 *
 * `fetchRange` reçoit les **5 premiers caractères** de l'empreinte, jamais le
 * mot de passe ni son empreinte complète : c'est le principe de k-anonymat.
 * Le service interrogé ne peut donc pas savoir quel mot de passe est testé —
 * un préfixe correspond à des centaines de milliers d'empreintes.
 *
 * En cas d'indisponibilité du service, la fonction renvoie `false` : mieux vaut
 * accepter un mot de passe non vérifié que d'empêcher quelqu'un de créer son
 * compte parce qu'un tiers est en panne.
 */
export async function isPasswordPwned(
  password: string,
  fetchRange: (prefix: string) => Promise<string>
): Promise<boolean> {
  try {
    const hash = await sha1Hex(password)
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)

    return suffixIsPwned(suffix, await fetchRange(prefix))
  } catch (error) {
    console.error('Vérification HaveIBeenPwned indisponible:', error)
    return false
  }
}

/** Récupère la plage d'empreintes via notre propre serveur. */
export function fetchPwnedRange(prefix: string): Promise<string> {
  return fetch(`/api/auth/pwned?prefix=${prefix}`).then((response) => {
    if (!response.ok) throw new Error(`Réponse inattendue : ${response.status}`)
    return response.text()
  })
}

/**
 * Contrôle complet : robustesse puis présence dans les fuites connues.
 * Renvoie un message d'erreur, ou null si le mot de passe est acceptable.
 */
export async function checkPassword(password: string): Promise<string | null> {
  const strengthError = validatePasswordStrength(password)
  if (strengthError) return strengthError

  if (await isPasswordPwned(password, fetchPwnedRange)) {
    return 'Ce mot de passe figure dans une fuite de données connue. Choisissez-en un autre.'
  }

  return null
}
