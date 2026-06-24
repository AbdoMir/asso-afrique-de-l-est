import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface ReceiptData {
  cerfaNumber: string
  donorName: string
  donorAddress: string
  totalAmount: number
  year: number
  date: string
  associationName?: string
  associationAddress?: string
  associationSiret?: string
  associationRna?: string
}

// Helper to convert numbers to French words (simplified for receipt use)
function numberToFrenchWords(num: number): string {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']

  if (num === 0) return 'zéro'

  let words = ''

  if (num >= 100) {
    const hundreds = Math.floor(num / 100)
    words += (hundreds > 1 ? units[hundreds] + ' ' : '') + 'cent '
    num %= 100
  }

  if (num >= 20) {
    const tenVal = Math.floor(num / 10)
    const unitVal = num % 10
    if (tenVal === 7) {
      words += 'soixante-et-' + teens[unitVal]
    } else if (tenVal === 9) {
      words += 'quatre-vingt-' + teens[unitVal]
    } else {
      words += tens[tenVal] + (unitVal === 1 ? '-et-un' : unitVal > 1 ? '-' + units[unitVal] : '')
    }
  } else if (num >= 10) {
    words += teens[num - 10]
  } else if (num > 0) {
    words += units[num]
  }

  return words.trim() + ' euros'
}

export async function generateReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.276, 841.89]) // A4 Size in points (72 points = 1 inch)
  const { width, height } = page.getSize()

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Colors
  const black = rgb(0.1, 0.1, 0.1)
  const darkGray = rgb(0.3, 0.3, 0.3)
  const primaryColor = rgb(0.91, 0.44, 0.16) // #E8702A
  const lightBg = rgb(0.97, 0.96, 0.94) // Warm-50

  // 1. Header background box
  page.drawRectangle({
    x: 30,
    y: height - 120,
    width: width - 60,
    height: 90,
    color: lightBg,
    borderColor: rgb(0.9, 0.9, 0.9),
    borderWidth: 1,
  })

  // Title
  page.drawText('REÇU FISCAL POUR DON', {
    x: 45,
    y: height - 65,
    size: 18,
    font: helveticaBold,
    color: primaryColor,
  })

  page.drawText('Article 200 du Code Général des Impôts (CGI)', {
    x: 45,
    y: height - 80,
    size: 10,
    font: helveticaFont,
    color: darkGray,
  })

  // Cerfa indicator
  page.drawText('CERFA N° 11580*03', {
    x: width - 180,
    y: height - 65,
    size: 12,
    font: helveticaBold,
    color: black,
  })

  page.drawText(`Numéro d'ordre : ${data.cerfaNumber}`, {
    x: width - 180,
    y: height - 85,
    size: 10,
    font: helveticaFont,
    color: black,
  })

  // 2. Beneficiary Section (Left)
  let yPos = height - 160
  page.drawText('1. Bénéficiaire du don', {
    x: 30,
    y: yPos,
    size: 12,
    font: helveticaBold,
    color: primaryColor,
  })

  yPos -= 20
  page.drawText(`Nom : ${data.associationName || "Association Afrique de l'Est et ses amis"}`, {
    x: 30,
    y: yPos,
    size: 10,
    font: helveticaBold,
    color: black,
  })

  yPos -= 15
  page.drawText(`Adresse : ${data.associationAddress || "15 Rue de la Solidarité, 75019 Paris"}`, {
    x: 30,
    y: yPos,
    size: 10,
    font: helveticaFont,
    color: black,
  })

  yPos -= 15
  page.drawText(`Objet : Accompagnement des familles d'Afrique de l'Est dans leur intégration en France.`, {
    x: 30,
    y: yPos,
    size: 10,
    font: helveticaFont,
    color: black,
  })

  yPos -= 15
  page.drawText(`SIRET : ${data.associationSiret || "123 456 789 00010"}  •  RNA : ${data.associationRna || "W751234567"}`, {
    x: 30,
    y: yPos,
    size: 9,
    font: helveticaFont,
    color: darkGray,
  })

  // Divider
  yPos -= 20
  page.drawLine({
    start: { x: 30, y: yPos },
    end: { x: width - 30, y: yPos },
    color: rgb(0.9, 0.9, 0.9),
    thickness: 1,
  })

  // 3. Donor Section
  yPos -= 20
  page.drawText('2. Donateur', {
    x: 30,
    y: yPos,
    size: 12,
    font: helveticaBold,
    color: primaryColor,
  })

  yPos -= 20
  page.drawText(`Nom & Prénom : ${data.donorName}`, {
    x: 30,
    y: yPos,
    size: 10,
    font: helveticaBold,
    color: black,
  })

  yPos -= 15
  page.drawText(`Adresse : ${data.donorAddress}`, {
    x: 30,
    y: yPos,
    size: 10,
    font: helveticaFont,
    color: black,
  })

  // Divider
  yPos -= 20
  page.drawLine({
    start: { x: 30, y: yPos },
    end: { x: width - 30, y: yPos },
    color: rgb(0.9, 0.9, 0.9),
    thickness: 1,
  })

  // 4. Donation Details
  yPos -= 20
  page.drawText('3. Détails du versement', {
    x: 30,
    y: yPos,
    size: 12,
    font: helveticaBold,
    color: primaryColor,
  })

  yPos -= 25
  // Draw table-like box
  page.drawRectangle({
    x: 30,
    y: yPos - 60,
    width: width - 60,
    height: 75,
    color: lightBg,
    borderColor: rgb(0.9, 0.9, 0.9),
    borderWidth: 1,
  })

  page.drawText('Montant en chiffres :', {
    x: 45,
    y: yPos - 10,
    size: 10,
    font: helveticaBold,
    color: black,
  })

  page.drawText(`${data.totalAmount.toFixed(2)} EUR`, {
    x: 200,
    y: yPos - 10,
    size: 11,
    font: helveticaBold,
    color: primaryColor,
  })

  page.drawText('Montant en toutes lettres :', {
    x: 45,
    y: yPos - 28,
    size: 10,
    font: helveticaFont,
    color: black,
  })

  page.drawText(numberToFrenchWords(Math.floor(data.totalAmount)), {
    x: 200,
    y: yPos - 28,
    size: 10,
    font: helveticaBold,
    color: black,
  })

  page.drawText('Date du paiement :', {
    x: 45,
    y: yPos - 46,
    size: 10,
    font: helveticaFont,
    color: black,
  })

  page.drawText(data.date, {
    x: 200,
    y: yPos - 46,
    size: 10,
    font: helveticaFont,
    color: black,
  })

  page.drawText('Nature du versement :', {
    x: 45,
    y: yPos - 64,
    size: 10,
    font: helveticaFont,
    color: black,
  })

  page.drawText('Don de soutien régulier / Adhésion d\'intérêt général', {
    x: 200,
    y: yPos - 64,
    size: 10,
    font: helveticaFont,
    color: black,
  })

  // Explanations about CGI
  yPos -= 90
  page.drawText("L'organisme bénéficiaire certifie que les dons et versements qu'il reçoit ouvrent droit à la réduction d'impôt", {
    x: 30,
    y: yPos,
    size: 9,
    font: helveticaFont,
    color: darkGray,
  })
  yPos -= 12
  page.drawText("prévue à l'article 200 du Code Général des Impôts (CGI).", {
    x: 30,
    y: yPos,
    size: 9,
    font: helveticaFont,
    color: darkGray,
  })

  // 5. Signature Section
  yPos -= 70
  page.drawText('Fait à Paris, le ' + data.date, {
    x: 30,
    y: yPos,
    size: 10,
    font: helveticaFont,
    color: black,
  })

  page.drawText('Pour l\'Association,', {
    x: width - 200,
    y: yPos,
    size: 10,
    font: helveticaBold,
    color: black,
  })

  yPos -= 15
  page.drawText('Le Trésorier,', {
    x: width - 200,
    y: yPos,
    size: 10,
    font: helveticaFont,
    color: black,
  })

  // Mock signature design
  yPos -= 40
  page.drawText('Diallo A.', {
    x: width - 190,
    y: yPos,
    size: 16,
    font: helveticaFont,
    color: rgb(0.18, 0.49, 0.27), // Greenish color for signature
  })

  // Footer note
  page.drawText('Association Afrique de l\'Est et ses amis - Association loi 1901 - SIRET: ' + (data.associationSiret || "123 456 789 00010"), {
    x: 30,
    y: 35,
    size: 8,
    font: helveticaFont,
    color: darkGray,
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
