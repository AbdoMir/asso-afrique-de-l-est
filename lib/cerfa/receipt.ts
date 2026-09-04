import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'
import {
  ASSOCIATION_ADDRESS,
  ASSOCIATION_LEGAL_FORM,
  ASSOCIATION_NAME,
  ASSOCIATION_PRESIDENT,
  ASSOCIATION_SIRET,
} from '@/lib/association'
import { montantEnLettres } from '@/lib/cerfa/nombre-en-lettres'

/**
 * Reçu fiscal CERFA 11580*03, « reçu au titre des dons à certains organismes
 * d'intérêt général ».
 *
 * Le PDF n'est jamais stocké : il est reconstruit à chaque téléchargement
 * depuis la ligne `tax_receipts`, qui fige l'identité du donateur au moment de
 * l'émission. C'est la conséquence directe de la décision d'août 2026 de ne
 * plus détenir aucun fichier (migration 014) — et le procédé reste exact,
 * puisque le rendu est déterministe : mêmes données, même document.
 *
 * Les polices employées sont les polices standard du format PDF, encodées en
 * WinAnsi : elles couvrent les accents français sans qu'aucun fichier de
 * police n'ait à être embarqué.
 */

export type DonneesRecu = {
  receiptNumber: string
  donorName: string
  donorAddress: string
  fiscalYear: number
  totalAmount: number
  issuedAt: Date
}

const A4 = { width: 595.28, height: 841.89 }
const MARGE = 56

const NOIR = rgb(0.1, 0.1, 0.1)
const GRIS = rgb(0.42, 0.42, 0.42)
const ORANGE = rgb(0.91, 0.44, 0.16)

/** Position courante du curseur vertical, en points depuis le bas de page. */
type Curseur = { y: number }

function ligne(
  page: PDFPage,
  curseur: Curseur,
  texte: string,
  options: { font: PDFFont; size?: number; color?: RGB; gap?: number }
) {
  const size = options.size ?? 10
  page.drawText(texte, {
    x: MARGE,
    y: curseur.y,
    size,
    font: options.font,
    color: options.color ?? NOIR,
  })
  curseur.y -= size + (options.gap ?? 6)
}

/**
 * Découpe un texte trop long pour la largeur utile.
 *
 * Une adresse saisie sur Stripe n'a aucune limite de longueur : sans coupure,
 * elle déborderait de la page et disparaîtrait du document imprimé.
 */
function couper(texte: string, font: PDFFont, size: number, largeur: number): string[] {
  const mots = texte.split(' ')
  const lignes: string[] = []
  let courante = ''

  for (const mot of mots) {
    const essai = courante ? `${courante} ${mot}` : mot
    if (font.widthOfTextAtSize(essai, size) > largeur && courante) {
      lignes.push(courante)
      courante = mot
    } else {
      courante = essai
    }
  }
  if (courante) lignes.push(courante)
  return lignes
}

export async function genererRecuCerfa(data: DonneesRecu): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`Reçu fiscal ${data.receiptNumber} - ${ASSOCIATION_NAME}`)
  pdf.setAuthor(ASSOCIATION_NAME)
  pdf.setSubject("Reçu au titre des dons à certains organismes d'intérêt général")

  const page = pdf.addPage([A4.width, A4.height])
  const normal = await pdf.embedFont(StandardFonts.Helvetica)
  const gras = await pdf.embedFont(StandardFonts.HelveticaBold)
  const italique = await pdf.embedFont(StandardFonts.HelveticaOblique)

  const largeurUtile = A4.width - MARGE * 2
  const curseur: Curseur = { y: A4.height - MARGE }

  // ─── En-tête ──────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: A4.height - 8, width: A4.width, height: 8, color: ORANGE })

  ligne(page, curseur, 'REÇU AU TITRE DES DONS', { font: gras, size: 16, gap: 2 })
  ligne(page, curseur, "à certains organismes d'intérêt général", {
    font: normal,
    size: 11,
    color: GRIS,
    gap: 4,
  })
  ligne(page, curseur, 'Formulaire CERFA n° 11580*03 - articles 200 et 238 bis du CGI', {
    font: normal,
    size: 9,
    color: GRIS,
    gap: 18,
  })

  ligne(page, curseur, `Reçu n° ${data.receiptNumber}`, { font: gras, size: 12, gap: 20 })

  // ─── Bénéficiaire ─────────────────────────────────────────────────────────
  ligne(page, curseur, 'BÉNÉFICIAIRE DU VERSEMENT', {
    font: gras,
    size: 10,
    color: ORANGE,
    gap: 10,
  })
  ligne(page, curseur, ASSOCIATION_NAME, { font: gras, size: 11 })

  for (const l of couper(ASSOCIATION_LEGAL_FORM, normal, 9, largeurUtile)) {
    ligne(page, curseur, l, { font: normal, size: 9, color: GRIS, gap: 2 })
  }

  curseur.y -= 6
  ligne(page, curseur, `Siège social : ${ASSOCIATION_ADDRESS}`, { font: normal })
  ligne(page, curseur, `SIRET : ${ASSOCIATION_SIRET}`, { font: normal, gap: 8 })

  ligne(page, curseur, "Objet : accompagnement des familles d'Afrique de l'Est en France", {
    font: normal,
    size: 9,
    color: GRIS,
  })
  ligne(page, curseur, "Organisme d'intérêt général à caractère social et humanitaire", {
    font: normal,
    size: 9,
    color: GRIS,
    gap: 22,
  })

  // ─── Donateur ─────────────────────────────────────────────────────────────
  ligne(page, curseur, 'DONATEUR', { font: gras, size: 10, color: ORANGE, gap: 10 })
  ligne(page, curseur, data.donorName, { font: gras, size: 11 })

  for (const l of couper(data.donorAddress, normal, 10, largeurUtile)) {
    ligne(page, curseur, l, { font: normal, gap: 2 })
  }

  curseur.y -= 22

  // ─── Versement ────────────────────────────────────────────────────────────
  ligne(page, curseur, 'VERSEMENT', { font: gras, size: 10, color: ORANGE, gap: 10 })

  const montantChiffres = data.totalAmount.toFixed(2).replace('.', ',')
  ligne(page, curseur, `Somme versée : ${montantChiffres} €`, { font: gras, size: 13, gap: 8 })

  // Le montant en lettres est la protection contre la falsification : un
  // chiffre se rallonge, un mot beaucoup moins.
  for (const l of couper(
    `Soit, en toutes lettres : ${montantEnLettres(data.totalAmount)}.`,
    italique,
    10,
    largeurUtile
  )) {
    ligne(page, curseur, l, { font: italique, gap: 2 })
  }

  curseur.y -= 10
  ligne(page, curseur, `Au titre de l'année ${data.fiscalYear}`, { font: normal, gap: 8 })
  ligne(page, curseur, 'Forme du don : versement en numéraire', { font: normal })
  ligne(page, curseur, 'Mode de versement : carte bancaire ou prélèvement SEPA', {
    font: normal,
    gap: 22,
  })

  // ─── Mention légale ───────────────────────────────────────────────────────
  // Les espaces avant « % » sont insécables (U+00A0) : la découpe en lignes
  // rejetterait sinon le pourcentage seul en tête de ligne, ce que la
  // typographie française n'admet pas.
  const mention =
    'Le bénéficiaire reconnaît avoir reçu, au titre des versements ouvrant droit à ' +
    "réduction d'impôt, la somme mentionnée ci-dessus. Ce reçu ouvre droit à une " +
    "réduction d'impôt sur le revenu égale à 66 % du montant versé, dans la limite " +
    'de 20 % du revenu imposable (article 200 du CGI).'

  for (const l of couper(mention, normal, 9, largeurUtile)) {
    ligne(page, curseur, l, { font: normal, size: 9, color: GRIS, gap: 3 })
  }

  curseur.y -= 24

  // ─── Signature ────────────────────────────────────────────────────────────
  const dateEmission = data.issuedAt.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  ligne(page, curseur, `Fait à Lingolsheim, le ${dateEmission}`, { font: normal, gap: 14 })
  ligne(page, curseur, ASSOCIATION_PRESIDENT, { font: gras, gap: 2 })
  ligne(page, curseur, "Président de l'association", { font: normal, size: 9, color: GRIS })

  // ─── Pied de page ─────────────────────────────────────────────────────────
  page.drawText(
    'Document à conserver. Il vous sera demandé en cas de contrôle de votre déclaration de revenus.',
    { x: MARGE, y: MARGE - 16, size: 8, font: italique, color: GRIS }
  )

  return pdf.save()
}
