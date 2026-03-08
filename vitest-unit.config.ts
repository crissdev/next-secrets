import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/ui/**/*.{spec,test}.{ts,tsx}'],
    setupFiles: ['./vitest-unit.setup.ts'],
    coverage: {
      exclude: ['src/components/ui/**', 'src/hooks/use-mobile.ts', 'src/**/*.d.ts'],
    },
    clearMocks: true,
    restoreMocks: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
