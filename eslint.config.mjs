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
// FE-002: inside an Episode, headings h1–h3 mirror the manuscript's spine and
// come only from the container and the Slide layouts. A one-off slide may still
// write `<SlideTitle as="h3">`; h4 and below are free.
const EPISODE_FILES = 'src/components/episodes/**/*.{ts,tsx}';
// A one-Episode widget under `episodes/<ep>/client/` is the only place an Episode
// may carry 'use client'; it keeps the spine rule but not the directive ban.
const EPISODE_CLIENT_FILES = 'src/components/episodes/*/client/**/*.client.tsx';
const SPINE_HEADINGS = [
  {
    selector: 'JSXOpeningElement[name.name=/^h[1-3]$/]',
    message:
      'Headings h1–h3 come from EpisodePageContainer and the Slide layouts; write <SlideTitle as="h3"> for a one-off page slide (FE-002).',
  },
  {
    // Matches `as="h1"`, `as={'h1'}` and `as={`h1`}`; a variable level is left to the post-build test.
    selector:
      "JSXOpeningElement[name.name='SlideTitle'] > JSXAttribute[name.name='as'] :matches(Literal[value=/^h[12]$/], TemplateElement[value.raw=/^h[12]$/])",
    message: 'h1 is the Title slide and h2 a section slide, both rendered for you; a page slide title is h3 (FE-002).',
  },
];

// FE-001: the URL-state service alone writes history; FE-009: the Slide observer
// alone creates an IntersectionObserver. `no-restricted-properties` catches a bare
// `history.replaceState(...)`; the selector catches `window.history.*` and
// `globalThis.history.*`, which `object: 'history'` does not match.
const URL_STATE_FILE = 'src/lib/url-state.ts';
const SLIDE_OBSERVER_FILE = 'src/components/episode-page/slide-observer.client.tsx';
/** FE-009 §5.1: the one-shot reveal hook, the only other file allowed an IntersectionObserver. */
const REVEAL_OBSERVER_FILE = 'src/hooks/use-revealed-on-view.ts';
const HISTORY_WRITE = {
  selector:
    "CallExpression > MemberExpression[object.property.name='history'][property.name=/^(pushState|replaceState)$/]",
  message: 'Only src/lib/url-state.ts writes browser history; call urlState.navigateTo(id) instead (FE-001).',
};
const NEW_OBSERVER = {
  selector: "NewExpression[callee.name='IntersectionObserver']",
  message: 'The Slide observer is the only IntersectionObserver; read the active Slide with useActiveSlide() (FE-009).',
};
const CLIENT_DIRECTIVE_MISSING = {
  selector: `Program:not(:has(> ExpressionStatement[directive='use client']))`,
  message: "A *.client.tsx file MUST open with 'use client'; add it, or drop the suffix (FE-006).",
};
const NO_USE_CLIENT = {
  selector: USE_CLIENT,
  message: "'use client' marks a client entry point; rename the file to *.client.tsx, or drop the directive (FE-006).",
};

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '.archgate/**',
      '.next/**',
      'out/**',
      'next-env.d.ts',
      '.worktrees/**',
    ],
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
    // FE-001 and FE-009: history writes and viewport observers have one owner each.
    files: ['src/**/*.{ts,tsx}'],
    ignores: [URL_STATE_FILE],
    rules: {
      'no-restricted-properties': [
        'error',
        ...['pushState', 'replaceState'].map((property) => ({
          object: 'history',
          property,
          message: HISTORY_WRITE.message,
        })),
      ],
    },
  },
  // Flat config replaces a rule's options per block, so every `no-restricted-syntax`
  // list below repeats the selectors it must keep (FE-001 compliance): the FE-006
  // directive pair, the FE-001 history selector, the FE-009 observer selector.
  {
    // FE-006: the directive appears only in a `.client.tsx` file.
    files: ['src/**/*.{ts,tsx}'],
    ignores: [CLIENT_FILES],
    rules: { 'no-restricted-syntax': ['error', NO_USE_CLIENT, HISTORY_WRITE, NEW_OBSERVER] },
  },
  {
    // FE-006: a `.client.tsx` file carries the directive.
    files: [CLIENT_FILES],
    rules: { 'no-restricted-syntax': ['error', CLIENT_DIRECTIVE_MISSING, HISTORY_WRITE, NEW_OBSERVER] },
  },
  {
    // FE-002 headings, for Episode files; the directive stays out of them.
    files: [EPISODE_FILES],
    ignores: [EPISODE_CLIENT_FILES],
    rules: { 'no-restricted-syntax': ['error', NO_USE_CLIENT, HISTORY_WRITE, NEW_OBSERVER, ...SPINE_HEADINGS] },
  },
  {
    // FE-002 headings and FE-006 directive, for an Episode's client widgets.
    files: [EPISODE_CLIENT_FILES],
    rules: {
      'no-restricted-syntax': ['error', CLIENT_DIRECTIVE_MISSING, HISTORY_WRITE, NEW_OBSERVER, ...SPINE_HEADINGS],
    },
  },
  {
    // The owners: each is exempt from its own selector only.
    files: [URL_STATE_FILE],
    rules: { 'no-restricted-syntax': ['error', NO_USE_CLIENT, NEW_OBSERVER] },
  },
  {
    files: [SLIDE_OBSERVER_FILE],
    rules: { 'no-restricted-syntax': ['error', CLIENT_DIRECTIVE_MISSING, HISTORY_WRITE] },
  },
  {
    files: [REVEAL_OBSERVER_FILE],
    rules: { 'no-restricted-syntax': ['error', NO_USE_CLIENT, HISTORY_WRITE] },
  },
  {
    files: ['**/*.test.ts'],
    rules: { 'max-lines-per-function': 'off', 'max-lines': 'off' },
  },
  {
    // FE-002: a Slide's Canvas is free-form markup, so its server files drop the
    // per-function line cap; complexity and the file cap still hold, and
    // `client/` keeps every cap.
    files: ['src/components/episodes/*/{slides,canvas}/**/*.{ts,tsx}'],
    rules: { 'max-lines-per-function': 'off' },
  },
  eslintConfigPrettier,
);
