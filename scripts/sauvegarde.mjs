/**
 * Sauvegarde complète des données de l'association.
 *
 * Pourquoi ce script existe : le plan gratuit Supabase ne fournit **aucune
 * sauvegarde automatique**. Sans lui, une migration ratée ou une suppression
 * accidentelle effacerait définitivement les adhérents, les reçus fiscaux — que
 * la loi impose de conserver 6 ans — et les documents déposés par les familles.
 * L'art. 32 du RGPD demande de pouvoir rétablir la disponibilité des données ;
 * c'est cette obligation que ce script honore.
 *
 * Ce qu'il sauvegarde :
 *   - toutes les tables applicatives, en JSON ;
 *   - les fichiers des deux buckets de stockage ;
 *   - la liste des comptes (sans les mots de passe, voir la limite ci-dessous).
 *
 * Ce qu'il ne sauvegarde pas :
 *   - le schéma (tables, policies RLS, triggers) : il vit dans
 *     supabase/migrations/, versionné dans git — c'est sa sauvegarde ;
 *   - les empreintes de mots de passe, que l'API d'administration ne renvoie
 *     jamais. Après une restauration, les adhérents devront donc passer par
 *     « mot de passe oublié ». C'est une limite assumée : la solution complète
 *     est `supabase db dump`, qui exige le mot de passe de la base.
 *
 * Usage : node scripts/sauvegarde.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Lecture de .env.local sans dépendance supplémentaire. */
function chargerEnv() {
  const contenu = readFileSync(join(racine, '.env.local'), 'utf8')
  const env = {}

  for (const ligne of contenu.split('\n')) {
    const correspondance = ligne.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!correspondance) continue
    env[correspondance[1]] = correspondance[2].trim().replace(/^["']|["']$/g, '')
  }

  return env
}

const TABLES = [
  'profiles',
  'memberships',
  'donations',
  'fiscal_receipts',
  'member_documents',
  'appointment_slots',
  'appointment_bookings',
  'contact_messages',
  'newsletter_subscribers',
]

const BUCKETS = ['member-documents', 'fiscal-receipts']

async function sauvegarderTables(supabase, dossier) {
  const compteurs = {}

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*')
    if (error) throw new Error(`Table ${table} : ${error.message}`)

    writeFileSync(join(dossier, `${table}.json`), JSON.stringify(data, null, 2), 'utf8')
    compteurs[table] = data.length
    console.log(`  ${table.padEnd(24)} ${data.length} ligne(s)`)
  }

  return compteurs
}

async function sauvegarderComptes(supabase, dossier) {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw new Error(`Comptes : ${error.message}`)

  // On ne conserve que ce qui sert à recréer un compte. Les jetons de session
  // et les métadonnées internes n'ont aucune valeur après restauration.
  const comptes = data.users.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    email_confirmed_at: u.email_confirmed_at,
    last_sign_in_at: u.last_sign_in_at,
    user_metadata: u.user_metadata,
  }))

  writeFileSync(join(dossier, 'auth_users.json'), JSON.stringify(comptes, null, 2), 'utf8')
  console.log(`  ${'auth.users'.padEnd(24)} ${comptes.length} compte(s)`)

  return comptes.length
}

async function sauvegarderFichiers(supabase, dossier) {
  let total = 0

  for (const bucket of BUCKETS) {
    // Les fichiers sont rangés dans un dossier par utilisateur : il faut donc
    // lister les dossiers avant de lister leur contenu.
    const { data: racines, error } = await supabase.storage.from(bucket).list()
    if (error) throw new Error(`Bucket ${bucket} : ${error.message}`)

    for (const entree of racines ?? []) {
      // Une entrée sans identifiant est un dossier, pas un fichier.
      const chemins = entree.id
        ? [entree.name]
        : ((await supabase.storage.from(bucket).list(entree.name)).data ?? []).map(
            (f) => `${entree.name}/${f.name}`
          )

      for (const chemin of chemins) {
        const { data: blob, error: erreurTelechargement } = await supabase.storage
          .from(bucket)
          .download(chemin)

        if (erreurTelechargement) {
          console.warn(`  ! ${bucket}/${chemin} : ${erreurTelechargement.message}`)
          continue
        }

        const destination = join(dossier, 'fichiers', bucket, chemin)
        mkdirSync(dirname(destination), { recursive: true })
        writeFileSync(destination, Buffer.from(await blob.arrayBuffer()))
        total++
      }
    }
  }

  console.log(`  ${'fichiers'.padEnd(24)} ${total} fichier(s)`)
  return total
}

async function main() {
  const env = chargerEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const cle = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !cle) {
    console.error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, cle, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const horodatage = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
  const dossier = join(racine, 'sauvegardes', horodatage)
  mkdirSync(dossier, { recursive: true })

  console.log(`Sauvegarde vers sauvegardes/${horodatage}\n`)

  const tables = await sauvegarderTables(supabase, dossier)
  const comptes = await sauvegarderComptes(supabase, dossier)
  const fichiers = await sauvegarderFichiers(supabase, dossier)

  // Le manifeste sert de référence : après une restauration, ces nombres
  // doivent être retrouvés à l'identique. Sans lui, « la restauration a
  // fonctionné » n'est qu'une impression.
  const manifeste = {
    genere_le: new Date().toISOString(),
    projet: url,
    tables,
    auth_users: comptes,
    fichiers,
    avertissement:
      'Contient des données personnelles, dont des documents relevant potentiellement de l\'article 9. À conserver chiffré et hors du dépôt git.',
  }

  writeFileSync(join(dossier, 'manifeste.json'), JSON.stringify(manifeste, null, 2), 'utf8')

  console.log(`\nTerminé. Vérifiez manifeste.json avant d'archiver le dossier.`)
}

main().catch((erreur) => {
  console.error('\nÉchec de la sauvegarde :', erreur.message)
  process.exit(1)
})
