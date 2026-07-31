import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

// Next 16 a supprimé `next lint` : ESLint est désormais invoqué directement,
// en configuration « flat ». Sans ce fichier, `eslint .` ne trouvait aucune
// configuration et le lint du projet ne tournait pas du tout.
//
// eslint-config-next v16 exporte nativement du flat config : pas de
// FlatCompat ici, il échoue sur ces presets.
const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'supabase/**'],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Le code existant utilise `any` à quelques endroits assumés (payloads
      // externes, erreurs catch) : on signale sans bloquer la CI.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Règle du React Compiler : elle signale le chargement de données via
      // `useEffect`, motif utilisé dans tout l'espace adhérent et l'admin.
      // Le passer en erreur imposerait une refonte de ces pages ; on garde
      // l'avertissement pour ne pas perdre l'information.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default eslintConfig
