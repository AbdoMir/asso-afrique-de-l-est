// Detoure le logo « Afrique -> cathedrale de Strasbourg » : le fond creme opaque
// devient transparent, pour que le logo soit reutilisable sur n'importe quel aplat.
//
// Provenance : le logo n'existait que sous forme d'image embarquee dans
// « Affiche Association Afrique Est Ses Amis.pdf » (2358x1037 px). Il en a ete
// extrait avec PyMuPDF (page.get_images -> doc.extract_image), puis detoure ici.
//
//   node print/tools/detour-logo.mjs <source.png> <destination.png>

import sharp from 'sharp'

const SRC = process.argv[2]
const DEST = process.argv[3]

if (!SRC || !DEST) {
  console.error('usage: node print/tools/detour-logo.mjs <source.png> <destination.png>')
  process.exit(1)
}

const img = sharp(SRC).ensureAlpha()
const { width, height } = await img.metadata()
const { data } = await img.raw().toBuffer({ resolveWithObject: true })

const at = (x, y) => {
  const i = (y * width + x) * 4
  return [data[i], data[i + 1], data[i + 2]]
}
const corners = [at(0, 0), at(width - 1, 0), at(0, height - 1), at(width - 1, height - 1)]
console.log('coins :', corners.map((c) => `rgb(${c.join(',')})`).join('  '))

// Le fond est clair et desature ; le logo est sature (orange / bleu) ou sombre.
// alpha = 0 quand le pixel est clair ET desature, 255 des qu'il s'en ecarte, avec
// une rampe intermediaire pour preserver l'antialiasing des contours.
// Les seuils sont derives du fond reellement mesure dans les coins : le PDF
// source utilise un creme rgb(251,249,246), pas du blanc pur.
const BG = Math.min(...corners.map((c) => Math.min(...c)))
const LIGHT_FULL = BG - 2 // au-dessus : totalement transparent
const LIGHT_NONE = BG - 28 // en dessous : totalement opaque
const SAT_KEEP = 26 // saturation au-dela de laquelle le pixel appartient au logo
console.log(`fond detecte = ${BG} -> transparent >= ${LIGHT_FULL}, opaque <= ${LIGHT_NONE}`)

let cleared = 0
for (let i = 0; i < data.length; i += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  if (Math.max(r, g, b) - Math.min(r, g, b) > SAT_KEEP) continue // pixel colore : logo

  const min = Math.min(r, g, b)
  let a = 255
  if (min >= LIGHT_FULL) a = 0
  else if (min > LIGHT_NONE) a = Math.round((255 * (LIGHT_FULL - min)) / (LIGHT_FULL - LIGHT_NONE))

  if (a < 255) {
    data[i + 3] = a
    if (a === 0) cleared++
  }
}

const total = width * height
console.log(`pixels transparents : ${cleared} / ${total} (${((100 * cleared) / total).toFixed(1)} %)`)

await sharp(data, { raw: { width, height, channels: 4 } })
  .trim({ threshold: 1 }) // retire la marge transparente residuelle
  .png({ compressionLevel: 9 })
  .toFile(DEST)

const out = await sharp(DEST).metadata()
console.log(`ecrit ${DEST} — ${out.width}x${out.height}, alpha=${out.hasAlpha}`)

// Variante monochrome : la silhouette du logo remplie d'un aplat uni, pour les
// impressions economiques en deux couleurs. On reutilise le canal alpha du logo
// detoure comme masque, ce qui preserve les decoupes internes (frontieres des
// pays, vitraux de la cathedrale).
const MONO = DEST.replace(/\.png$/, '-mono.png')
const MONO_RGB = { r: 0xe8, g: 0x70, b: 0x2a } // primary-500 du site

const alpha = await sharp(DEST).extractChannel('alpha').raw().toBuffer({ resolveWithObject: true })
await sharp({
  create: {
    width: alpha.info.width,
    height: alpha.info.height,
    channels: 3,
    background: MONO_RGB,
  },
})
  .joinChannel(alpha.data, {
    raw: { width: alpha.info.width, height: alpha.info.height, channels: 1 },
  })
  .png({ compressionLevel: 9 })
  .toFile(MONO)

console.log(`ecrit ${MONO} — silhouette unie rgb(${Object.values(MONO_RGB).join(',')})`)
