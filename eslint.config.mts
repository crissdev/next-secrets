import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import sortImports from 'eslint-plugin-simple-import-sort';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    'node_modules/**',
    '.next/**',
    '.swc/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'tests/.temp/**',
    'next-env.d.ts',
    '.*/**',
    'src/lib/db/prisma-client/**',
  ]),
  prettierConfig,
  {
    plugins: {
      'simple-import-sort': sortImports,
      'no-only-tests': noOnlyTests,
    },
    rules: {
      // @next
      '@next/next/no-img-element': 'off',

      // @typescript-eslint
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // simple-import-sort
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // no-only-tests
      'no-only-tests/no-only-tests': 'error',
    },
  },
]);

export default eslintConfig;
