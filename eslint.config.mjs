import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import eslintConfigPrettier from 'eslint-config-prettier';
import checkFile from 'eslint-plugin-check-file';
import tseslint from 'typescript-eslint';

// FE-006: the `.client` classifier. A file carrying 'use client' is named
// `*.client.tsx`, and a `*.client.tsx` file carries the directive, so the client
// bundle's entry points are glob-addressable.
const CLIENT_FILES = 'src/**/*.client.tsx';
const USE_CLIENT = "Program > ExpressionStatement[directive='use client']";
// `check-file` matches against the basename with the FINAL extension stripped,
// so the pattern reads `*.client`, never `*.client.tsx`. `+([a-z0-9-])` excludes
// `.`, which refuses a stacked suffix.
const OPTIONAL_CLIENT = '+([a-z0-9-])?(.client)';

export default tseslint.config(
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '.archgate/**', '.next/**', 'out/**', 'next-env.d.ts'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic],
    rules: {
      complexity: ['error', 7],
      'max-lines-per-function': ['error', 30],
      'max-params': ['error', 3],
      'max-depth': ['error', 3],
      'max-lines': ['error', 250],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...nextPlugin.configs['core-web-vitals'],
  },
  {
    // FE-005: modules whose APIs need a request-time server, which
    // `output: 'export'` never has.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/headers',
              message: 'cookies(), headers() and draftMode() need a request; a static export has none (FE-005).',
            },
            {
              name: 'next/server',
              message: 'NextRequest, NextResponse and proxy need a runtime server; a static export has none (FE-005).',
            },
            {
              name: 'next/cache',
              message: 'Revalidation and data-cache APIs need ISR; a static export is built once (FE-005).',
            },
          ],
        },
      ],
    },
  },
  {
    // FE-006: `src/app/**` holds no classifier, so no `.client` file can sit there;
    // only `.tsx` may carry `.client`.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/app/**/*.{ts,tsx}': 'KEBAB_CASE',
          'src/{components,hooks}/**/*.tsx': OPTIONAL_CLIENT,
          'src/**/*.ts': '!(*.client)',
        },
        {
          errorMessage:
            '"{{ target }}" does not match "{{ pattern }}". A `.client` file is a `.tsx` leaf under src/components or src/hooks, never under src/app (FE-006).',
        },
      ],
    },
  },
  {
    // FE-006: the directive appears only in a `.client.tsx` file.
    files: ['src/**/*.{ts,tsx}'],
    ignores: [CLIENT_FILES],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: USE_CLIENT,
          message:
            "'use client' marks a client entry point; rename the file to *.client.tsx, or drop the directive (FE-006).",
        },
      ],
    },
  },
  {
    // FE-006: a `.client.tsx` file carries the directive.
    files: [CLIENT_FILES],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `Program:not(:has(> ExpressionStatement[directive='use client']))`,
          message: "A *.client.tsx file MUST open with 'use client'; add it, or drop the suffix (FE-006).",
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: { 'max-lines-per-function': 'off', 'max-lines': 'off' },
  },
  eslintConfigPrettier,
);
