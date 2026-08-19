import { ImageResponse } from 'next/og'
import { ASSOCIATION_NAME } from '@/lib/association'

/**
 * Les métadonnées référençaient `/og-image.jpg`, un fichier absent du dépôt :
 * chaque partage sur les réseaux ou messageries affichait donc un lien nu,
 * sans vignette. L'image est désormais générée au build à partir des couleurs
 * de la charte — rien à téléverser, rien à maintenir en parallèle du texte.
 *
 * La convention de fichier vaut pour toutes les routes : les pages qui ne
 * déclarent pas leur propre image héritent de celle-ci.
 */
export const alt = "Association Afrique de l'Est et ses amis — intégration des familles à Strasbourg"
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
            Association de droit local — Alsace
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
            Cours de français (FLE), soutien scolaire, emploi et traduction
            pour les familles d&apos;Afrique de l&apos;Est.
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
