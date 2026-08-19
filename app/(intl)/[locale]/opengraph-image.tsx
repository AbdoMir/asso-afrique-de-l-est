import { ImageResponse } from 'next/og'
import { ASSOCIATION_NAME } from '@/lib/association'

/**
 * Vignette de partage des versions traduites.
 *
 * Le texte est en anglais pour /en **comme** pour /ar : rendre de l'arabe ici
 * supposerait d'embarquer une police couvrant l'écriture arabe, que la police
 * par défaut de `next/og` ne contient pas — à défaut, les glyphes sortiraient
 * en carrés. Une vignette lisible en anglais vaut mieux qu'une vignette
 * illisible en arabe ; corriger cela demande d'ajouter un fichier de police au
 * dépôt et de le charger ici.
 *
 * Les fichiers de convention ne traversent pas les groupes de routes : celui-ci
 * double app/(fr)/opengraph-image.tsx, sans quoi /en et /ar se partageraient
 * sans aucune image.
 */
export const alt = 'East Africa & Friends Association — supporting families in Strasbourg'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #FEFAF5 0%, #F5F0E8 100%)',
          padding: '72px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #E8702A 0%, #F4A935 100%)',
            }}
          />
          <div style={{ fontSize: 30, color: '#8A6F4E', letterSpacing: -0.5 }}>
            Local-law association — Alsace
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: '#2A2118',
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            {ASSOCIATION_NAME}
          </div>
          <div style={{ fontSize: 36, color: '#6B5842', lineHeight: 1.35 }}>
            French classes, school support, employment guidance and translation
            for East African families.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 120, height: 8, borderRadius: 4, background: '#E8702A' }} />
          <div style={{ width: 60, height: 8, borderRadius: 4, background: '#2D7D46' }} />
          <div style={{ width: 30, height: 8, borderRadius: 4, background: '#F4A935' }} />
          <div style={{ fontSize: 28, color: '#8A6F4E', marginLeft: 12 }}>
            Strasbourg — Eurométropole
          </div>
        </div>
      </div>
    ),
    size,
  )
}
