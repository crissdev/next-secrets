import { FlatCompat } from '@eslint/eslintrc';
import { type Linter } from 'eslint';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig: Linter.Config[] = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.swc/**',
      'next-env.d.ts',
      'coverage/**',
      'tests/.temp/**',
      'test-results/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  ...compat.config({
    plugins: ['simple-import-sort', 'no-only-tests'],
    rules: {
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
  }),
];

export default eslintConfig;
