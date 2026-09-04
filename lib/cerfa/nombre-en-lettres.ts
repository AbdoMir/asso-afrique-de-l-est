/**
 * Conversion d'un montant en toutes lettres, pour le reçu fiscal CERFA.
 *
 * Le formulaire 11580*03 exige le montant écrit en lettres à côté du montant
 * en chiffres. C'est une protection contre la falsification : un « 1 » se
 * rallonge en « 100 », pas « cent » en « dix mille ».
 *
 * Les règles d'accord du français sont l'essentiel de la difficulté :
 *   — « quatre-vingts » prend un s seul, « quatre-vingt-un » n'en prend pas ;
 *   — « deux cents » de même, mais « deux cent un » ;
 *   — « mille » est invariable, « millions » s'accorde.
 */

const UNITES = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit',
  'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
]

const DIZAINES: Record<number, string> = {
  10: 'dix',
  20: 'vingt',
  30: 'trente',
  40: 'quarante',
  50: 'cinquante',
  60: 'soixante',
  80: 'quatre-vingt',
}

/** 0 à 99. */
function souscent(n: number): string {
  if (n < 17) return UNITES[n]

  // 70-79 et 90-99 se construisent sur 60 et 80 : « soixante-dix »,
  // « quatre-vingt-dix ». Le français compte encore par vingtaines ici.
  const base = n < 20 ? 10 : n < 70 ? Math.floor(n / 10) * 10 : n < 80 ? 60 : 80
  const reste = n - base

  if (reste === 0) {
    // « quatre-vingts » seul prend un s ; « quatre-vingt-trois » non.
    return base === 80 ? 'quatre-vingts' : DIZAINES[base]
  }

  // « et » n'apparaît que devant un et onze, et jamais après quatre-vingt :
  // vingt et un, soixante et onze, mais quatre-vingt-un.
  const liaison = (reste === 1 || reste === 11) && base !== 80 ? ' et ' : '-'

  return `${DIZAINES[base]}${liaison}${souscent(reste)}`
}

/** 0 à 999. */
function souscentaine(n: number): string {
  if (n < 100) return souscent(n)

  const centaines = Math.floor(n / 100)
  const reste = n % 100

  if (reste === 0) {
    // « deux cents » prend un s si rien ne suit ; « cent » seul est invariable.
    return centaines === 1 ? 'cent' : `${souscent(centaines)} cents`
  }

  const tete = centaines === 1 ? 'cent' : `${souscent(centaines)} cent`
  return `${tete} ${souscentaine(reste)}`
}

/** Partie entière, jusqu'aux millions. Au-delà, une association n'en a pas l'usage. */
function entierEnLettres(n: number): string {
  if (n === 0) return 'zéro'

  const millions = Math.floor(n / 1_000_000)
  const milliers = Math.floor((n % 1_000_000) / 1000)
  const reste = n % 1000

  const morceaux: string[] = []

  if (millions > 0) {
    morceaux.push(
      millions === 1 ? 'un million' : `${souscentaine(millions)} millions`
    )
  }

  if (milliers > 0) {
    // « mille » est invariable : jamais « deux milles ».
    morceaux.push(milliers === 1 ? 'mille' : `${souscentaine(milliers)} mille`)
  }

  if (reste > 0) morceaux.push(souscentaine(reste))

  return morceaux.join(' ')
}

/**
 * Montant en euros vers sa forme littérale.
 *
 * Les centimes ne sont mentionnés que s'il y en a : un reçu de 120 € se lit
 * « cent vingt euros », pas « cent vingt euros et zéro centime ».
 */
export function montantEnLettres(euros: number): string {
  if (!Number.isFinite(euros) || euros < 0) {
    throw new Error(`Montant invalide pour un reçu fiscal : ${euros}`)
  }

  // Arrondi au centime avant décomposition : 0.1 + 0.2 vaut 0.30000000000000004
  // en virgule flottante, et « trente centimes » deviendrait faux.
  const centimesTotal = Math.round(euros * 100)
  const partieEntiere = Math.floor(centimesTotal / 100)
  const centimes = centimesTotal % 100

  // Zéro et un prennent le singulier : « zéro euro », « un euro ». C'est la
  // règle du français, où seul deux ouvre le pluriel.
  const lettresEuros = `${entierEnLettres(partieEntiere)} ${
    partieEntiere < 2 ? 'euro' : 'euros'
  }`

  if (centimes === 0) return lettresEuros

  return `${lettresEuros} et ${entierEnLettres(centimes)} ${
    centimes === 1 ? 'centime' : 'centimes'
  }`
}
