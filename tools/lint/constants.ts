import { readFileSync } from 'node:fs';

// decision: GEN-005 §1
// decision: FE-011 §6
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
  // decision: docs/adr/0012-slide-header-and-play-once-motion.md
  '^card-hover(--raise|--outline)?$',
  '^focus-group(--dim-others|__item)?$',
  '^hover-reveal(__detail)?$',
];
export const HERO_TITLE_FILE = 'src/episodes/components/slide-master/slide-master.tsx';
export const TAILWIND_ENTRY = 'src/app/globals.css';

// decision: FE-006 §2
export const CLIENT_FILES = 'src/**/*.client.tsx';
export const USE_CLIENT = "Program > ExpressionStatement[directive='use client']";
export const OPTIONAL_CLIENT = '+([a-z0-9-])?(.client)';
// decision: FE-002 §4
export const EPISODE_FILES = 'src/episodes/**/*.{ts,tsx}';
export const EPISODE_CODE_FILES = ['src/episodes/{components,lib,hooks}/**'];
// decision: FE-006 §5
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
    selector:
      "JSXOpeningElement[name.name='SlideTitle'] > JSXAttribute[name.name='as'] :matches(Literal[value=/^h[12]$/], TemplateElement[value.raw=/^h[12]$/])",
    message: 'h1 is the Title slide and h2 a section slide, both rendered for you; a page slide title is h3 (FE-002).',
  },
];
// decision: FE-003 §3
export const NO_RAW_READ = {
  selector: "CallExpression > MemberExpression.callee[property.name='raw']",
  message:
    "An Episode never reads a raw Translation string: pass the kit's template('<key>') to the widget and fill it with fillTemplate (FE-003).",
};

// decision: FE-001 §2
// decision: FE-009 §5
export const URL_STATE_FILE = 'src/shared/lib/url-state.ts';
export const SLIDE_OBSERVER_FILE = 'src/episodes/components/episode-page/slide-observer.client.tsx';
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
// decision: docs/adr/0013-context-markers.md
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

// decision: FE-006 §3
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

// decision: FE-011 §4
export const UTIL = '(?:^|:)!?-?';
export const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
export const COLOUR_UTILS =
  'text|bg|border|ring|ring-offset|outline|fill|stroke|from|via|to|shadow|divide|accent|caret|decoration|placeholder';
export const COLOUR_FN = '#|rgba?\\(|hsla?\\(|oklch\\(|oklab\\(|lab\\(|lch\\(|hwb\\(|color-mix\\((?![^\\]]*var\\()';
export const ROLES = 'hero|heading|subheading|body|caption';
export const E3_MESSAGE = 'text-hero is for HeroTitle only: render <HeroTitle> instead (FE-011).';
export const E3 = { pattern: `${UTIL}text-hero$`, message: E3_MESSAGE };
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
