import { readFileSync } from 'node:fs';

/*
 * The lint config's constants (GEN-005): file globs, the original ADR-citing `no-restricted-syntax` selectors and the
 * design-token class patterns, moved here unchanged from the ESLint config. `oxlint.config.mts` assembles them.
 */

// Design tokens (FE-011): the legacy list is one file that lint and Archgate both read. Legacy files are exempt from
// E2 only; E1 (no phantom class) holds everywhere.
export const LEGACY_FILES: string[] = (
  JSON.parse(readFileSync(new URL('../../src/shared/design-system/legacy.json', import.meta.url), 'utf8')) as {
    globs: string[];
  }
).globs;
export const CSS_HOOK_CLASSES = [
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
export const HERO_TITLE_FILE = 'src/episodes/components/slide-master/slide-master.tsx';
export const TAILWIND_ENTRY = 'src/app/globals.css';

// FE-006: the `.client` classifier. A file carrying 'use client' is named
// `*.client.tsx`, and a `*.client.tsx` file carries the directive, so the client
// bundle's entry points are glob-addressable.
export const CLIENT_FILES = 'src/**/*.client.tsx';
export const USE_CLIENT = "Program > ExpressionStatement[directive='use client']";
// `check-file` matches against the basename with the FINAL extension stripped,
// so the pattern reads `*.client`, never `*.client.tsx`. `+([a-z0-9-])` excludes
// `.`, which refuses a stacked suffix.
export const OPTIONAL_CLIENT = '+([a-z0-9-])?(.client)';
// FE-002: inside an Episode, headings h1–h3 mirror the Episode's spine and
// come only from the container and the Slide layouts. A one-off slide may still
// write `<SlideTitle as="h3">`; h4 and below are free.
// Episode files are the Episodes area's content: its Episodes, Event copies, Slide pool and Templates, never
// its code folders `components/`, `lib/` and `hooks/`.
export const EPISODE_FILES = 'src/episodes/**/*.{ts,tsx}';
export const EPISODE_CODE_FILES = ['src/episodes/{components,lib,hooks}/**'];
// A `*.client.tsx` inside a Slide folder `episodes/<ep>/slides/<slide>/`, an Event's
// copy's under `episodes/by-event/<event>/`, a Template's, an Explorable page's or a Guide's under `episodes/templates/`, `episodes/explorable-pages/` or `episodes/guides/`
// or a pool Slide's `episodes/slide-pool/<slide>/`, is the only place an Episode may carry
// 'use client'; it keeps the spine rule but not the directive ban.
export const EPISODE_CLIENT_FILES = [
  'src/episodes/*/slides/*/**/*.client.tsx',
  'src/episodes/{by-event/*,templates,explorable-pages,guides}/*/slides/*/**/*.client.tsx',
  'src/episodes/slide-pool/*/**/*.client.tsx',
];
export const SPINE_HEADINGS = [
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
export const NO_RAW_READ = {
  selector: "CallExpression > MemberExpression.callee[property.name='raw']",
  message:
    "An Episode never reads a raw Translation string: pass the kit's template('<key>') to the widget and fill it with fillTemplate (FE-003).",
};

// FE-001: the URL-state service alone writes history; FE-009: the Slide observer
// alone creates an IntersectionObserver. `no-restricted-properties` catches a bare
// `history.replaceState(...)`; the selector catches `window.history.*` and
// `globalThis.history.*`, which `object: 'history'` does not match.
export const URL_STATE_FILE = 'src/shared/lib/url-state.ts';
export const SLIDE_OBSERVER_FILE = 'src/episodes/components/episode-page/slide-observer.client.tsx';
/** FE-009 §5.1: the one-shot reveal hook, the only other file allowed an IntersectionObserver. */
export const REVEAL_OBSERVER_FILE = 'src/shared/hooks/use-revealed-on-view.ts';
export const HISTORY_WRITE = {
  selector:
    "CallExpression > MemberExpression[object.property.name='history'][property.name=/^(pushState|replaceState)$/]",
  message: 'Only src/shared/lib/url-state.ts writes browser history; call urlState.navigateTo(id) instead (FE-001).',
};
export const NEW_OBSERVER = {
  selector: "NewExpression[callee.name='IntersectionObserver']",
  message: 'The Slide observer is the only IntersectionObserver; read the active Slide with useActiveSlide() (FE-009).',
};
// design-ADR-0013: a Context marker owns its hit area. A `static` class from a call site would unposition the
// button and stretch the invisible hit area over the nearest positioned ancestor, the whole Slide; use
// `placement="beside"` for a marker in the flow of a label.
export const NO_STATIC_MARKER = {
  selector:
    "JSXOpeningElement[name.name=/^(Marker|ContextMarker)$/] > JSXAttribute[name.name='className'] :matches(Literal[value=/(^|\\s|:|!)static(\\s|$)/], TemplateElement[value.raw=/(^|\\s|:|!)static(\\s|$)/])",
  message:
    'A Context marker keeps its own hit area: a `static` class would stretch it over the whole Slide. Use placement="beside" for a marker in the flow of a label (design-ADR-0013).',
};
export const CLIENT_DIRECTIVE_MISSING = {
  selector: `Program:not(:has(> ExpressionStatement[directive='use client']))`,
  message: "A *.client.tsx file MUST open with 'use client'; add it, or drop the suffix (FE-006).",
};
export const NO_USE_CLIENT = {
  selector: USE_CLIENT,
  message: "'use client' marks a client entry point; rename the file to *.client.tsx, or drop the directive (FE-006).",
};

// FE-006: a `*-view.tsx` is a pure view, drawn from props alone, so a Server Component can render it as static HTML.
export const PURE_VIEW_FILES = ['src/**/*-view.tsx'];
export const PURE_VIEW = [
  {
    selector: 'CallExpression[callee.name=/^use[A-Z]/], CallExpression[callee.property.name=/^use[A-Z]/]',
    message: 'A *-view.tsx file is a pure view: no hooks. Move state to the interactive part that uses it (FE-006).',
  },
  {
    selector: 'JSXAttribute[name.name=/^on[A-Z]/]',
    message: 'A *-view.tsx file is a pure view: no event handlers. Attach them in the interactive part (FE-006).',
  },
  {
    selector: 'ImportDeclaration[source.value=/(^@\\/[a-z-]+\\/hooks\\/|\\.client$)/]',
    message: 'A *-view.tsx file imports no hook and no client leaf: it must render on the server (FE-006).',
  },
];

// FE-011 design tokens. `no-restricted-classes` matches each class WITH its variants
// (`md:hover:text-lg`), so every pattern anchors on `(?:^|:)` and an optional `!`.
export const UTIL = '(?:^|:)!?-?';
export const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
export const COLOUR_UTILS =
  'text|bg|border|ring|ring-offset|outline|fill|stroke|from|via|to|shadow|divide|accent|caret|decoration|placeholder';
// A `color-mix()` over a `var(--token)` is a token reference, so it stays allowed.
export const COLOUR_FN = '#|rgba?\\(|hsla?\\(|oklch\\(|oklab\\(|lab\\(|lch\\(|hwb\\(|color-mix\\((?![^\\]]*var\\()';
export const ROLES = 'hero|heading|subheading|body|caption';
export const E3_MESSAGE = 'text-hero is for HeroTitle only: render <HeroTitle> instead (FE-011).';
export const E3 = { pattern: `${UTIL}text-hero$`, message: E3_MESSAGE };
/** E2: the token-only vocabulary; `allowedSize` is a lookahead for the one relative size a file may spell. */
export const tokenRestrictions = (allowedSize = ''): { pattern: string; message: string }[] => [
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
export const CITATION_FILE = 'src/shared/page-chrome/context-drawer/slide-notes.tsx';
export const INLINE_CODE_FILE = 'src/episodes/components/slide-master/rich-tags.tsx';

export const NAMING_FILES = ['{src,tests,tools}/**/*.{ts,tsx,mts,js,mjs}', 'skills/*/scripts/**/*.{ts,mts,js,mjs}'];
export const UNIT_SUFFIX_DENYLIST = {
  Ms: 'Milliseconds',
  Sec: 'Seconds',
  Min: 'Minutes',
  Px: 'Pixels',
  Pct: 'Percent',
  Deg: 'Degrees',
  Hz: 'Hertz',
  Fps: 'FramesPerSecond',
} as const;
const DECLARED_IDENTIFIERS = [
  'VariableDeclarator > Identifier.id',
  ':function > Identifier.id',
  ':function > Identifier.params',
  'AssignmentPattern > Identifier.left',
  'ObjectPattern > Property > Identifier.value',
  'ArrayPattern > Identifier',
  'RestElement > Identifier.argument',
  'ObjectExpression > Property[shorthand=false] > Identifier.key',
  'PropertyDefinition > Identifier.key',
  'MethodDefinition > Identifier.key',
  'ClassDeclaration > Identifier.id',
  'TSPropertySignature > Identifier.key',
  'TSMethodSignature > Identifier.key',
  'TSInterfaceDeclaration > Identifier.id',
  'TSTypeAliasDeclaration > Identifier.id',
  'TSEnumMember > Identifier.id',
];
const suffixPattern = (abbreviation: string) => {
  const upper = abbreviation.toUpperCase();
  const lower = abbreviation.toLowerCase();
  return `/(?:[a-z0-9](?:${abbreviation}|${upper})|_(?:${lower}|${upper}|${abbreviation}))$/`;
};
export const UNIT_SUFFIXES = Object.entries(UNIT_SUFFIX_DENYLIST).map(([abbreviation, fullWord]) => ({
  selector: DECLARED_IDENTIFIERS.map((position) => `${position}[name=${suffixPattern(abbreviation)}]`).join(', '),
  message: `"${abbreviation}" abbreviates a unit: spell the unit in full as ${fullWord}, or name what the value is if it is not a unit (GEN-007).`,
}));
