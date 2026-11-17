import { defineConfig } from 'oxlint';
import * as C from './tools/lint/constants.ts';
import { NATIVE_RULES, type RuleMap } from './tools/lint/native-rules.ts';

/*
 * The lint config (GEN-005). It is code so that the design-token legacy list (`src/shared/design-system/legacy.json`,
 * read by Archgate too) and the ADR-citing selectors each live in one place. Overrides apply in order, so a later
 * block replaces an earlier one's option for the same rule: every `no-restricted-syntax` list below repeats the
 * selectors it must keep (FE-001 compliance): the FE-006 directive pair, the FE-001 history selector and the FE-009
 * observer selector.
 */

const SRC = ['src/**/*.{ts,tsx}'];
const RESTRICTED_SYNTAX = 'eslint-js/no-restricted-syntax';
const restrict = (...selectors: { selector: string; message: string }[]): ['error', ...typeof selectors] => [
  'error',
  ...selectors,
  ...C.UNIT_SUFFIXES,
];
const classes = (patterns: { pattern: string; message: string }[]): RuleMap => ({
  'better-tailwindcss/no-restricted-classes': ['error', { restrict: patterns }],
});
/** A file's one allowed relative size, e.g. the citation marker `text-[0.7em]`. */
const allowSize = (size: string) => classes([...C.tokenRestrictions(`(?!${size.replace('.', '\\.')}em\\])`), C.E3]);

const noNextRuntime = {
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
};

export default defineConfig({
  plugins: ['typescript', 'nextjs'],
  categories: { correctness: 'off' },
  env: { builtin: true },
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'coverage/**',
    '.archgate/**',
    '.next/**',
    'out/**',
    'next-env.d.ts',
    '.worktrees/**',
    '.claude/worktrees/**',
    // An Episode's throwaway prototype, kept byte for byte for the retro (as in `.oxfmtrc.jsonc`): never product code.
    'docs/episodes/*/prototype/**',
  ],
  jsPlugins: [
    { name: 'eslint-js', specifier: 'oxlint-plugin-eslint' },
    'eslint-plugin-check-file',
    'eslint-plugin-better-tailwindcss',
  ],
  settings: { 'better-tailwindcss': { entryPoint: C.TAILWIND_ENTRY } },
  overrides: [
    { files: ['**/*.{ts,tsx}'], plugins: ['typescript'], rules: NATIVE_RULES },
    { files: C.NAMING_FILES, rules: { [RESTRICTED_SYNTAX]: restrict() } },
    {
      files: SRC,
      rules: {
        'nextjs/google-font-display': 'warn',
        'nextjs/google-font-preconnect': 'warn',
        'nextjs/next-script-for-ga': 'warn',
        'nextjs/no-async-client-component': 'warn',
        'nextjs/no-before-interactive-script-outside-document': 'warn',
        'nextjs/no-css-tags': 'warn',
        'nextjs/no-head-element': 'warn',
        'nextjs/no-html-link-for-pages': 'error',
        'nextjs/no-img-element': 'warn',
        'nextjs/no-page-custom-font': 'warn',
        'nextjs/no-styled-jsx-in-document': 'warn',
        'nextjs/no-sync-scripts': 'error',
        'nextjs/no-title-in-document-head': 'warn',
        'nextjs/no-typos': 'warn',
        'nextjs/no-unwanted-polyfillio': 'warn',
        'nextjs/inline-script-id': 'error',
        'nextjs/no-assign-module-variable': 'error',
        'nextjs/no-document-import-in-page': 'error',
        'nextjs/no-duplicate-head': 'error',
        'nextjs/no-head-import-in-document': 'error',
        'nextjs/no-script-component-in-head': 'error',
      },
    },
    {
      // FE-005: modules whose APIs need a request-time server, which `output: 'export'` never has.
      // FE-006: `src/app/**` holds no classifier, so no `.client` file can sit there; only `.tsx` may carry `.client`.
      files: SRC,
      rules: {
        'no-restricted-imports': ['error', noNextRuntime],
        'check-file/filename-naming-convention': [
          'error',
          {
            'src/app/**/*.{ts,tsx}': 'KEBAB_CASE',
            'src/{page-assembly,episodes,events,explorables,pipeline,shared}/**/*.tsx': C.OPTIONAL_CLIENT,
            'src/**/*.ts': '!(*.client)',
          },
          {
            errorMessage:
              '"{{ target }}" does not match "{{ pattern }}". A `.client` file is a `.tsx` leaf under src/page-assembly, src/episodes, src/events, src/explorables, src/pipeline or src/shared, never under src/app (FE-006).',
          },
        ],
      },
    },
    {
      // FE-001: history writes have one owner.
      files: SRC,
      excludeFiles: [C.URL_STATE_FILE],
      rules: {
        'no-restricted-properties': [
          'error',
          ...['pushState', 'replaceState'].map((property) => ({
            object: 'history',
            property,
            message: C.HISTORY_WRITE.message,
          })),
        ],
      },
    },
    {
      // FE-006: the directive appears only in a `.client.tsx` file.
      files: SRC,
      excludeFiles: [C.CLIENT_FILES],
      rules: { [RESTRICTED_SYNTAX]: restrict(C.NO_STATIC_MARKER, C.NO_USE_CLIENT, C.HISTORY_WRITE, C.NEW_OBSERVER) },
    },
    {
      // FE-006: a `.client.tsx` file carries the directive.
      files: [C.CLIENT_FILES],
      rules: {
        [RESTRICTED_SYNTAX]: restrict(C.NO_STATIC_MARKER, C.CLIENT_DIRECTIVE_MISSING, C.HISTORY_WRITE, C.NEW_OBSERVER),
      },
    },
    {
      // FE-002 headings and FE-003 raw reads, for Episode files; the directive stays out of them.
      files: [C.EPISODE_FILES],
      excludeFiles: [...C.EPISODE_CLIENT_FILES, ...C.EPISODE_CODE_FILES],
      rules: {
        [RESTRICTED_SYNTAX]: restrict(
          C.NO_STATIC_MARKER,
          C.NO_USE_CLIENT,
          C.HISTORY_WRITE,
          C.NEW_OBSERVER,
          ...C.SPINE_HEADINGS,
          C.NO_RAW_READ,
        ),
      },
    },
    {
      // FE-002 headings, FE-003 raw reads and FE-006 directive, for an Episode's client widgets.
      files: C.EPISODE_CLIENT_FILES,
      rules: {
        [RESTRICTED_SYNTAX]: restrict(
          C.NO_STATIC_MARKER,
          C.CLIENT_DIRECTIVE_MISSING,
          C.HISTORY_WRITE,
          C.NEW_OBSERVER,
          ...C.SPINE_HEADINGS,
          C.NO_RAW_READ,
        ),
      },
    },
    {
      // FE-006: a pure view carries no hook, handler or directive; it keeps the selectors every block repeats.
      files: C.PURE_VIEW_FILES,
      rules: {
        [RESTRICTED_SYNTAX]: restrict(C.NO_USE_CLIENT, C.HISTORY_WRITE, C.NEW_OBSERVER, ...C.PURE_VIEW),
      },
    },
    {
      // The owners: each is exempt from its own selector only.
      files: [C.URL_STATE_FILE],
      rules: { [RESTRICTED_SYNTAX]: restrict(C.NO_STATIC_MARKER, C.NO_USE_CLIENT, C.NEW_OBSERVER) },
    },
    {
      files: [C.SLIDE_OBSERVER_FILE],
      rules: { [RESTRICTED_SYNTAX]: restrict(C.NO_STATIC_MARKER, C.CLIENT_DIRECTIVE_MISSING, C.HISTORY_WRITE) },
    },
    {
      files: [C.REVEAL_OBSERVER_FILE],
      rules: { [RESTRICTED_SYNTAX]: restrict(C.NO_STATIC_MARKER, C.NO_USE_CLIENT, C.HISTORY_WRITE) },
    },
    { files: ['**/*.test.ts'], rules: { 'max-lines-per-function': 'off', 'max-lines': 'off' } },
    {
      // The rule guards the Pages Router; an App Router root layout renders its own <head>, which carries the
      // pre-paint `js` class script (design-ADR-0012 §5).
      files: ['src/shared/page-chrome/site-shell.tsx'],
      rules: { 'nextjs/no-head-element': 'off' },
    },
    {
      // FE-002: a Slide's Scene is free-form markup, so its server entry `slide.tsx` drops the per-function line cap;
      // complexity and the file cap still hold. Every other file in a Slide folder keeps every cap.
      files: [
        'src/episodes/*/slides/*/slide.tsx',
        'src/episodes/{by-event/*,templates,explorable-pages,guides}/*/slides/*/slide.tsx',
        'src/episodes/slide-pool/*/slide.tsx',
      ],
      rules: { 'max-lines-per-function': 'off' },
    },
    {
      // FE-011 E1: a class Tailwind does not register is a phantom, legacy files included. `ignore` is narrow:
      // Tailwind sees only utilities, so the plain class hooks globals.css styles by name are listed one by one.
      files: SRC,
      rules: {
        'better-tailwindcss/no-unknown-classes': ['error', { ignore: C.CSS_HOOK_CLASSES }],
        ...classes([...C.tokenRestrictions(), C.E3]),
      },
    },
    // FE-011 E2: the legacy list is exempt from the token vocabulary; E3 still holds.
    { files: C.LEGACY_FILES, rules: classes([C.E3]) },
    { files: [C.CITATION_FILE], rules: allowSize('0.7') },
    { files: [C.INLINE_CODE_FILE], rules: allowSize('0.9') },
    // FE-011 E3: the HeroTitle file alone may spell text-hero.
    { files: [C.HERO_TITLE_FILE], rules: classes(C.tokenRestrictions()) },
  ],
});
