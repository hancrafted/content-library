import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import eslintConfigPrettier from 'eslint-config-prettier';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import checkFile from 'eslint-plugin-check-file';
import { readFileSync } from 'node:fs';
import tseslint from 'typescript-eslint';

// Design tokens (FE-011): the legacy list is one file that ESLint and Archgate both read.
// Legacy files are exempt from E2 only; E1 (no phantom class) holds everywhere.
const LEGACY_FILES = JSON.parse(
  readFileSync(new URL('./src/design-system/legacy.json', import.meta.url), 'utf8'),
).globs;
const CSS_HOOK_CLASSES = [
  '^hero-glow(--accent)?$',
  '^deck-unsettled$',
  '^s2-arrows-active$',
  '^s2-arrow-group$',
  '^s2-flow-dash$',
  '^is-active$',
  '^dark$',
  // design-ADR-0012 §8: the hover vocabulary, BEM classes in globals.css `@layer components`.
  '^card-hover(--raise|--outline)?$',
  '^focus-group(--dim-others|__item)?$',
  '^hover-reveal(__detail)?$',
];
const HERO_TITLE_FILE = 'src/components/slide-master/slide-master.tsx';
const TAILWIND_ENTRY = 'src/app/globals.css';

// FE-006: the `.client` classifier. A file carrying 'use client' is named
// `*.client.tsx`, and a `*.client.tsx` file carries the directive, so the client
// bundle's entry points are glob-addressable.
const CLIENT_FILES = 'src/**/*.client.tsx';
const USE_CLIENT = "Program > ExpressionStatement[directive='use client']";
// `check-file` matches against the basename with the FINAL extension stripped,
// so the pattern reads `*.client`, never `*.client.tsx`. `+([a-z0-9-])` excludes
// `.`, which refuses a stacked suffix.
const OPTIONAL_CLIENT = '+([a-z0-9-])?(.client)';
// FE-002: inside an Episode, headings h1–h3 mirror the Episode's spine and
// come only from the container and the Slide layouts. A one-off slide may still
// write `<SlideTitle as="h3">`; h4 and below are free.
const EPISODE_FILES = 'src/components/episodes/**/*.{ts,tsx}';
// A `*.client.tsx` inside a Slide folder `episodes/<ep>/slides/<slide>/` is the
// only place an Episode may carry 'use client'; it keeps the spine rule but not
// the directive ban.
const EPISODE_CLIENT_FILES = ['src/components/episodes/*/slides/*/**/*.client.tsx'];
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
// FE-003 §2: an Episode never reads a raw Translation string; the kit's `template(key)`
// hands over a typed one. Shared by both Episode blocks, like the spine headings.
const NO_RAW_READ = {
  selector: "CallExpression > MemberExpression.callee[property.name='raw']",
  message:
    "An Episode never reads a raw Translation string: pass the kit's template('<key>') to the widget and fill it with fillTemplate (FE-003).",
};

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

// FE-011 design tokens. `no-restricted-classes` matches each class WITH its variants
// (`md:hover:text-lg`), so every pattern anchors on `(?:^|:)` and an optional `!`.
const UTIL = '(?:^|:)!?-?';
const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const COLOUR_UTILS =
  'text|bg|border|ring|ring-offset|outline|fill|stroke|from|via|to|shadow|divide|accent|caret|decoration|placeholder';
// A `color-mix()` over a `var(--token)` is a token reference, so it stays allowed.
const COLOUR_FN = '#|rgba?\\(|hsla?\\(|oklch\\(|oklab\\(|lab\\(|lch\\(|hwb\\(|color-mix\\((?![^\\]]*var\\()';
const ROLES = 'hero|heading|subheading|body|caption';
const E3_MESSAGE = 'text-hero is for HeroTitle only: render <HeroTitle> instead (FE-011).';
const E3 = { pattern: `${UTIL}text-hero$`, message: E3_MESSAGE };
/** E2: the token-only vocabulary; `allowedSize` is a lookahead for the one relative size a file may spell. */
const tokenRestrictions = (allowedSize = '') => [
  {
    pattern: `${UTIL}(?:${COLOUR_UTILS})-(?:(?:${PALETTE})-\\d|black|white)`,
    message: 'Palette colour: use a token utility (bg-primary, text-muted-foreground) or bg-(--slide-token) (FE-011).',
  },
  {
    pattern: `${UTIL}(?:${COLOUR_UTILS})-\\[(?:color:)?(?:${COLOUR_FN})`,
    message: 'Arbitrary colour: declare a Slide token in the CSS module, light and dark, and reference it (FE-011).',
  },
  {
    pattern: `${UTIL}text-(?:xs|sm|base|lg|[2-9]xl)$`,
    message: 'Size outside the roles: use text-heading, text-subheading, text-body or text-caption (FE-011).',
  },
  {
    pattern: `${UTIL}text-\\[${allowedSize}[\\d.]+(?:px|rem|em|vw|vh|%|ch|pt)\\]`,
    message: 'Arbitrary size: use a role (text-heading, text-subheading, text-body, text-caption) (FE-011).',
  },
  {
    pattern: `(?:^|:)(?:sm|md|lg|xl|2xl|min-[^:]+|max-[^:]+|@[^:]+):(?:[^:]+:)*!?text-(?:${ROLES})$`,
    message: 'A role scales fluidly with clamp(): drop the breakpoint prefix from a size (FE-011).',
  },
  {
    pattern: `${UTIL}font-(?:thin|extralight|light|bold|extrabold|black|\\[\\d.*)$`,
    message: 'Weights are font-normal, font-medium and font-semibold (FE-011).',
  },
];
const TOKEN_RULES = {
  'better-tailwindcss/no-restricted-classes': ['error', { restrict: [...tokenRestrictions(), E3] }],
};
/** A file's one allowed relative size, e.g. the citation marker `text-[0.7em]`. */
const allowSize = (size) => ({
  'better-tailwindcss/no-restricted-classes': [
    'error',
    { restrict: [...tokenRestrictions(`(?!${size.replace('.', '\\.')}em\\])`), E3] },
  ],
});
const CITATION_FILE = 'src/components/context-drawer/slide-notes.tsx';
const INLINE_CODE_FILE = 'src/components/slide-master/rich-tags.tsx';

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
      '.claude/worktrees/**',
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
    // FE-002 headings and FE-003 raw reads, for Episode files; the directive stays out of them.
    files: [EPISODE_FILES],
    ignores: EPISODE_CLIENT_FILES,
    rules: {
      'no-restricted-syntax': ['error', NO_USE_CLIENT, HISTORY_WRITE, NEW_OBSERVER, ...SPINE_HEADINGS, NO_RAW_READ],
    },
  },
  {
    // FE-002 headings, FE-003 raw reads and FE-006 directive, for an Episode's client widgets.
    files: EPISODE_CLIENT_FILES,
    rules: {
      'no-restricted-syntax': [
        'error',
        CLIENT_DIRECTIVE_MISSING,
        HISTORY_WRITE,
        NEW_OBSERVER,
        ...SPINE_HEADINGS,
        NO_RAW_READ,
      ],
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
    // The rule guards the Pages Router; an App Router root layout renders its own <head>,
    // which carries the pre-paint `js` class script (design-ADR-0012 §5).
    files: ['src/components/site-shell.tsx'],
    rules: { '@next/next/no-head-element': 'off' },
  },
  {
    // FE-002: a Slide's Scene is free-form markup, so its server entry `slide.tsx`
    // drops the per-function line cap; complexity and the file cap still hold.
    // Caps follow file kind: every other file in a Slide folder keeps every cap.
    files: ['src/components/episodes/*/slides/*/slide.tsx'],
    rules: { 'max-lines-per-function': 'off' },
  },
  {
    // FE-011 E1: a class Tailwind does not register is a phantom, legacy files included.
    // `ignore` is narrow: Tailwind sees only utilities, so the plain class hooks that
    // globals.css styles by name (keyframe hooks, a state marker) are listed one by one.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'better-tailwindcss': betterTailwind },
    settings: { 'better-tailwindcss': { entryPoint: TAILWIND_ENTRY } },
    rules: { 'better-tailwindcss/no-unknown-classes': ['error', { ignore: CSS_HOOK_CLASSES }], ...TOKEN_RULES },
  },
  {
    // FE-011 E2: the legacy list is exempt from the token vocabulary; E3 still holds.
    files: LEGACY_FILES,
    rules: { 'better-tailwindcss/no-restricted-classes': ['error', { restrict: [E3] }] },
  },
  { files: [CITATION_FILE], rules: allowSize('0.7') },
  { files: [INLINE_CODE_FILE], rules: allowSize('0.9') },
  {
    // FE-011 E3: the HeroTitle file alone may spell text-hero.
    files: [HERO_TITLE_FILE],
    rules: { 'better-tailwindcss/no-restricted-classes': ['error', { restrict: tokenRestrictions() }] },
  },
  eslintConfigPrettier,
);
