import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      // Aligne l'alias `@/` sur celui de tsconfig.json pour que les tests
      // importent les modules exactement comme le fait l'application.
      '@': import.meta.dirname,
    },
  },
})
