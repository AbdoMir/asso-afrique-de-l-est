const isDev = process.env.NODE_ENV === 'development'

// ─── Content Security Policy ────────────────────────────────────────────────
// Limite les origines depuis lesquelles le navigateur accepte de charger des
// ressources. Sans elle, un script injecté peut appeler n'importe quel domaine.
//
// `'unsafe-inline'` sur les scripts est un compromis assumé : la plupart des
// pages sont pré-rendues en statique, elles ne peuvent donc pas porter un nonce
// calculé par requête. La CSP conserve malgré tout l'essentiel de son intérêt —
// elle interdit le chargement de scripts depuis un domaine tiers, l'inclusion
// du site dans une iframe, la réécriture de <base> et les plugins.
//
// `'unsafe-eval'` n'est présent qu'en développement, pour le rafraîchissement
// à chaud de React.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  // Le paiement s'effectue par redirection vers HelloAsso.
  "form-action 'self' https://www.helloasso.com",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com`,
  // Tailwind et Framer Motion posent des styles en ligne.
  "style-src 'self' 'unsafe-inline'",
  // blob: sert aux aperçus de documents, data: aux images encodées.
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
  // next/font héberge les polices avec le site : aucune origine externe.
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: csp,
  },
  {
    // Redondant avec frame-ancestors, mais couvre les navigateurs anciens :
    // sans lui, le site peut être encadré et servir à du détournement de clic.
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Empêche le navigateur de « deviner » un type MIME : un fichier téléversé
    // et servi comme image ne pourra pas être réinterprété en script.
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Ne transmet l'URL complète qu'aux pages du même site. Les URL de
    // l'espace adhérent ne fuitent donc pas vers les sites tiers visités
    // ensuite.
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Le site n'a besoin d'aucune de ces interfaces.
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()',
  },
  {
    // Vercel le pose déjà ; on le déclare pour que la valeur soit lisible dans
    // le dépôt et ne dépende pas d'un réglage de plateforme.
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  serverExternalPackages: ['pdf-lib'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
