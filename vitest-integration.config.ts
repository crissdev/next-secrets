import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.spec.ts'],
    setupFiles: ['./vitest-integration.setup.ts'],
    coverage: {
      exclude: ['src/**/*.d.ts'],
    },
    clearMocks: true,
    reporters: ['tree'],
    env: loadEnv('test', process.cwd(), 'TEST_'),
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
