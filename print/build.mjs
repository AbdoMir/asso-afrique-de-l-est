// Rend les maquettes HTML de print/src/ en PDF vectoriels via Chrome headless,
// et en PNG pour relecture rapide.
//
//   node print/build.mjs              tout rendre
//   node print/build.mjs piste-a      ne rendre que les fichiers correspondants
//
// Pourquoi Chrome plutot qu'une bibliotheque PDF : le texte et le QR restent
// vectoriels, la mise en page se debogue dans un navigateur, et rien n'est
// ajoute aux dependances du projet.

import { execFile } from 'node:child_process'
import { mkdir, readdir, readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const run = promisify(execFile)

const RACINE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(RACINE, 'src')
const OUT = path.join(RACINE, 'out')
const APERCUS = path.join(OUT, 'apercus')

const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]

// Dimensions physiques -> pixels CSS (1 px = 1/96 pouce, 1 pouce = 25,4 mm).
const mmEnPx = (mm) => Math.round((mm * 96) / 25.4)

// Chaque maquette declare son format ; l'apercu PNG est rendu a cette taille.
const FORMATS = { a4: [210, 297], a5: [148, 210] }
const formatDe = (nom) => (/-a5\b|flyer/.test(nom) ? FORMATS.a5 : FORMATS.a4)

function trouverChrome() {
  const trouve = CHROMES.find((p) => existsSync(p))
  if (!trouve) {
    console.error('Chrome introuvable. Chemins testes :\n  ' + CHROMES.join('\n  '))
    process.exit(1)
  }
  return trouve
}

const COMMUN = [
  '--headless',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--hide-scrollbars',
  // Les maquettes chargent leurs polices et images depuis des fichiers voisins.
  '--allow-file-access-from-files',
  // Laisse le temps aux polices embarquees de s'appliquer avant la capture.
  '--virtual-time-budget=4000',
  '--run-all-compositor-stages-before-draw',
]

async function rendre(chrome, fichier) {
  const nom = path.basename(fichier, '.html')
  const url = pathToFileURL(fichier).href
  const [largeur, hauteur] = formatDe(nom)

  // Chrome ne capture que la fenetre : pour un document multi-pages (un flyer
  // recto-verso), il faut une fenetre aussi haute que la pile de pages, sinon
  // le verso est hors champ.
  const pages = ((await readFile(fichier, 'utf8')).match(/class="page[\s"]/g) || ['']).length

  const pdf = path.join(OUT, `${nom}.pdf`)
  // Chrome sort en code 0 meme quand l'ecriture du PDF echoue — typiquement
  // quand le fichier est ouvert dans un lecteur qui le verrouille (Acrobat sous
  // Windows). Sans ce garde-fou, le build annonce « OK » en laissant en place
  // un PDF perime, et la verification suivante controle l'ancien fichier.
  const avant = await stat(pdf).then((s) => s.mtimeMs, () => 0)
  await run(chrome, [...COMMUN, '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, url])
  const apres = await stat(pdf).then((s) => s.mtimeMs, () => 0)

  if (apres === avant) {
    throw new Error(
      `${nom}.pdf n'a pas ete reecrit.\n` +
        `  Le fichier est probablement ouvert dans un lecteur PDF qui le verrouille.\n` +
        `  Fermer out/${nom}.pdf, puis relancer.`
    )
  }

  const png = path.join(APERCUS, `${nom}.png`)
  await run(chrome, [
    ...COMMUN,
    `--window-size=${mmEnPx(largeur)},${mmEnPx(hauteur * pages)}`,
    '--force-device-scale-factor=2', // apercu net, relisible a l'ecran
    `--screenshot=${png}`,
    url,
  ])

  const { size } = await stat(pdf)
  const detail = pages > 1 ? `${largeur}x${hauteur} mm x${pages}` : `${largeur}x${hauteur} mm`
  console.log(
    `  ${nom.padEnd(16)} ${detail.padEnd(18)} ->  out/${nom}.pdf (${(size / 1024).toFixed(0)} ko) + apercu`
  )
}

const filtre = process.argv[2]
const chrome = trouverChrome()
console.log(`Chrome : ${chrome}\n`)

await mkdir(APERCUS, { recursive: true })

const fichiers = (await readdir(SRC))
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !filtre || f.includes(filtre))
  .map((f) => path.join(SRC, f))

if (!fichiers.length) {
  console.error(filtre ? `Aucune maquette ne correspond a « ${filtre} ».` : 'Aucune maquette dans print/src/.')
  process.exit(1)
}

for (const f of fichiers) {
  try {
    await rendre(chrome, f)
  } catch (e) {
    console.error(`\nECHEC : ${e.message}`)
    process.exit(1)
  }
}

console.log(`\n${fichiers.length} document(s) rendu(s) dans print/out/`)
