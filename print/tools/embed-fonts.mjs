// Telecharge Inter + Outfit depuis Google Fonts et les embarque en base64 dans
// print/assets/fonts.css.
//
// Pourquoi en base64 plutot qu'en fichiers .woff2 references : Chrome applique
// une politique CORS aux @font-face meme depuis une page file://, et refuse
// silencieusement de charger une police voisine — le PDF sortirait alors en
// police systeme. Les data: URI contournent le probleme, et le rendu devient
// entierement hors ligne et reproductible.
//
//   node print/tools/embed-fonts.mjs

import { writeFile } from 'node:fs/promises'

const FAMILIES =
  'family=Inter:wght@400;500;600;700' +
  '&family=Outfit:wght@600;700;800;900' +
  // Les supports sont trilingues : ni Inter ni Outfit ne couvrent l'arabe.
  '&family=Noto+Sans+Arabic:wght@400;600;700'
const KEEP_SUBSETS = ['latin', 'latin-ext', 'arabic']
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const DEST = new URL('../assets/fonts.css', import.meta.url)

const css = await (
  await fetch(`https://fonts.googleapis.com/css2?${FAMILIES}&display=swap`, {
    headers: { 'User-Agent': UA },
  })
).text()

// Chaque bloc est precede d'un commentaire /* subset */ qui l'identifie.
const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)]
console.log(`${blocks.length} blocs @font-face recus`)

const out = [
  '/* Genere par print/tools/embed-fonts.mjs — ne pas editer a la main. */',
  `/* Inter + Outfit (Google Fonts, licence SIL OFL) — subsets : ${KEEP_SUBSETS.join(', ')}. */`,
  '',
]
let kept = 0
let bytes = 0

for (const [, subset, block] of blocks) {
  if (!KEEP_SUBSETS.includes(subset)) continue

  const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1]
  if (!url) continue

  const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer())
  bytes += buf.length

  const family = block.match(/font-family:\s*'([^']+)'/)[1]
  const weight = block.match(/font-weight:\s*(\d+)/)[1]
  console.log(`  ${family} ${weight} [${subset}] — ${(buf.length / 1024).toFixed(1)} ko`)

  out.push(
    block
      .replace(
        /url\(https:\/\/[^)]+\.woff2\)/,
        `url(data:font/woff2;base64,${buf.toString('base64')})`
      )
      // swap n'a pas de sens pour un rendu PDF : on veut la vraie police ou rien.
      .replace(/font-display:\s*swap;?/, 'font-display: block;')
  )
  out.push('')
  kept++
}

await writeFile(DEST, out.join('\n'), 'utf8')
console.log(
  `\n${kept} polices embarquees — ${(bytes / 1024).toFixed(0)} ko de woff2 -> ${DEST.pathname.split('/').pop()}`
)
