/// <reference path="../rules.d.ts" />

// FE-011 — Design Tokens: the checks ESLint's class-string lint cannot see. Raw values in CSS, in style objects and
// SVG attributes, a Slide token file that shadows a global token or lacks a dark value, an Episode selector in the
// global stylesheet, and a dead entry on the legacy list. Each check is one rule, A1..A6 in the ticket.
// Self-contained by design: archgate forbids imports between rules files.

const LEGACY_FILE = 'src/design-system/legacy.json';
const GLOBALS = 'src/app/globals.css';
// Every Slide token file, an Event's copy's under `episodes/by-event/<event>/<ep>/` too.
const SLIDE_MODULE_GLOB = 'src/components/episodes/**/slides/**/*.module.css';
// The one token file outside a Slide folder: the token editor's panel keeps a fixed palette so it survives edits to the
// site tokens it edits. It may hold raw colours (A1) and must pair them with :global(.dark) values (A4); unlike a Slide
// token file it redeclares global names on purpose (so A3 does not apply). Adding a file here needs an ADR amendment.
const EDITOR_PANEL_MODULE = 'src/components/design-system-token-editor/token-panel.module.css';
const CODE_GLOBS = ['src/**/*.ts', 'src/**/*.tsx'];
const CSS_GLOB = 'src/**/*.css';

// Tests assert on literal values (a contrast table, a fixture); they are not shipped styling.
const TEST_FILE_RE = /\.(?:test|spec)\.tsx?$/;

// FE-011 §3.5: two relative sizes stay allowed, one file each.
const RELATIVE_SIZE_ALLOWED: Record<string, string> = {
  'src/components/context-drawer/slide-notes.tsx': '0.7em',
  'src/components/slide-master/rich-tags.tsx': '0.9em',
};

// A hex colour has 3, 4, 6 or 8 digits. "Invoice #0042" has four, so a bare hex is never enough: it must sit where a
// colour sits (alone in a string, in a function or list argument, or after a colour-ish property) — see CODE_COLOUR_RE.
const HEX = '#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])';
const COLOUR_FN = String.raw`\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(\s*[-+.\d]`;
// The full CSS named-colour list (`transparent`, `currentColor` and `inherit` are not colours and stay allowed).
const NAMED_COLOURS = [
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
];
const NAMED = NAMED_COLOURS.join('|');
const COLOUR_PROP = String.raw`(?:color|fill|stroke|background(?:Color)?|floodColor|stopColor|border(?:Color)?|outline(?:Color)?|boxShadow|textShadow)`;

// In a CSS value, a `#` can only be a colour, so the bare hex is enough there.
const CSS_COLOUR_RE = new RegExp(`${HEX}|${COLOUR_FN}`);
// A named colour is a value token: not part of an identifier (`red-pulse`, `.white`, `--black`), not a function name
// (`tan(`), not inside a string or `url()`. Custom-property names after `var(` are blanked first.
const NAMED_RE = new RegExp(String.raw`(?<![\w#.-])(?:${NAMED})(?![\w-]|\s*\()`, 'i');

/** True when a CSS value holds a raw colour: hex, colour function, or a CSS named colour at any depth (color-mix too). */
function cssValueHasColour(value: string): boolean {
  if (CSS_COLOUR_RE.test(value)) return true;
  const bare = value
    .replace(/(['"])(?:(?!\1).)*\1/g, '""')
    .replace(/url\([^)]*\)/gi, 'url()')
    .replace(/var\(\s*--[\w-]+/gi, 'var(');
  return NAMED_RE.test(bare);
}
const CODE_COLOUR_RES = [
  new RegExp(`(['"\`])${HEX}\\1`), // fill="#0af"
  new RegExp(String.raw`[(,]\s*${HEX}`), // linear-gradient(#fff, #000)
  new RegExp(String.raw`\[${HEX}\]`), // text-[#ff0000]
  new RegExp(COLOUR_FN), // rgba(10, 14, 26, 0.12)
  new RegExp(String.raw`\b${COLOUR_PROP}['"]?\s*[:=]\s*\{?\s*['"\`][^'"\`]*${HEX}`), // color: 'x #fff'
  new RegExp(String.raw`\b${COLOUR_PROP}['"]?\s*[:=]\s*\{?\s*['"](?:${NAMED})['"]`, 'i'), // color: 'red', fill="white"
  new RegExp(String.raw`\b(?:color-mix|[a-z-]*gradient)\([^)]*(?<![\w#.-])(?:${NAMED})(?![\w-])`, 'i'), // 'color-mix(in oklab, black 80%, white)'
];
const CODE_FONT_RE = /\b(?:fontSize|fontWeight|fontFamily)\s*[:=]|\bfont-(?:size|weight|family)\s*:/;
const CSS_FONT_RE = /(?:^|[;{\s])font-(?:size|weight|family)\s*:/;

/** Blank out comments, keeping every newline and offset so a match maps back to its line. */
function stripComments(source: string, kind: 'css' | 'code'): string {
  const blank = (match: string) => match.replace(/[^\n]/g, ' ');
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, blank);
  return kind === 'css' ? stripped : stripped.replace(/(^|\s)\/\/.*$/gm, blank);
}

function lineAt(text: string, offset: number): number {
  return text.slice(0, offset).split('\n').length;
}

interface Declaration {
  selector: string;
  property: string;
  value: string;
  line: number;
}

/** Every `property: value` of a stylesheet with the selector of the innermost rule that holds it. */
function declarations(css: string): Declaration[] {
  const found: Declaration[] = [];
  for (const rule of css.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    const bodyStart = (rule.index ?? 0) + rule[1].length + 1;
    for (const decl of rule[2].matchAll(/([\w-]+)\s*:\s*([^;]+)/g)) {
      found.push({
        selector: rule[1].trim().replace(/\s+/g, ' '),
        property: decl[1],
        value: decl[2].trim(),
        line: lineAt(css, bodyStart + (decl.index ?? 0)),
      });
    }
  }
  return found;
}

const isRootOrDark = (selector: string) => /^(?::root|\.dark)$/.test(selector);
const isDarkSelector = (selector: string) => selector.includes(':global(.dark)');
const lightForm = (selector: string) => selector.replace(/:global\(\.dark\)\s*/g, '').trim();

/** Paths matched by the legacy list, which FE-011 §6 exempts from §2–§4. */
async function legacyFiles(ctx: RuleContext): Promise<Set<string>> {
  const entry = (await ctx.readJSON(LEGACY_FILE)) as { globs: string[] };
  const matched = await Promise.all(entry.globs.map((glob) => ctx.glob(glob)));
  return new Set(matched.flat());
}

async function governed(ctx: RuleContext, globs: string[]): Promise<string[]> {
  const legacy = await legacyFiles(ctx);
  const all = (await Promise.all(globs.map((glob) => ctx.glob(glob)))).flat();
  return all.filter((file) => !legacy.has(file) && !TEST_FILE_RE.test(file));
}

async function slideModules(ctx: RuleContext, extra: string[] = []): Promise<string[]> {
  const legacy = await legacyFiles(ctx);
  const present = new Set(await ctx.glob('src/**/*.module.css'));
  const files = [...(await ctx.glob(SLIDE_MODULE_GLOB)), ...extra.filter((file) => present.has(file))];
  return files.filter((file) => !legacy.has(file));
}

/** Names declared on the global palette and theme: `--primary`, `--color-primary`, … */
async function globalTokenNames(ctx: RuleContext): Promise<Set<string>> {
  const css = stripComments(await ctx.readFile(GLOBALS), 'css');
  return new Set(
    declarations(css)
      .map((decl) => decl.property)
      .filter((name) => name.startsWith('--')),
  );
}

function allowedRelativeSize(file: string, line: string): boolean {
  const allowed = RELATIVE_SIZE_ALLOWED[file];
  return allowed !== undefined && new RegExp(String.raw`font-?size['"]?\s*[:=]\s*['"]?${allowed}\b`, 'i').test(line);
}

export default {
  rules: {
    // A1 — §2.1. A raw colour belongs in the global :root/.dark blocks or a Slide token file, nowhere else.
    'no-raw-colour-in-css': {
      description:
        'A raw colour (hex, rgb(), hsl(), oklch()) in CSS appears only under :root / .dark in globals.css and in a Slide token file (a CSS module in an Episode Slide folder), plus the token editor panel module. Named colours (black, chocolate, …) count; transparent, currentColor and inherit do not. Legacy files are exempt.',
      severity: 'error',
      async check(ctx) {
        const slides = new Set([...(await ctx.glob(SLIDE_MODULE_GLOB)), EDITOR_PANEL_MODULE]);
        for (const file of await governed(ctx, [CSS_GLOB])) {
          if (slides.has(file)) continue;
          const css = stripComments(await ctx.readFile(file), 'css');
          for (const decl of declarations(css)) {
            if (file === GLOBALS && isRootOrDark(decl.selector)) continue;
            if (!cssValueHasColour(decl.value)) continue;
            ctx.report.violation({
              message: `Raw colour \`${decl.value}\` in \`${decl.selector}\` — use a token utility or var(--…); raw colours live in globals.css :root/.dark or a Slide token file (FE-011 [no-raw-colour-in-css]).`,
              file,
              line: decl.line,
            });
          }
        }
      },
    },

    // A2 — §4.1, §4.2. Colour, font size, weight and family are never written in code or in a CSS module.
    'no-raw-value-in-code': {
      description:
        'No raw colour, font-size, font-weight or font-family in .ts/.tsx (style objects, SVG attributes, .pure.ts tables) and no font-size, font-weight or font-family in a CSS module. Two relative sizes stay allowed, one file each: the citation marker at 0.7em and inline code at 0.9em. Legacy files and tests are exempt.',
      severity: 'error',
      async check(ctx) {
        for (const file of await governed(ctx, CODE_GLOBS)) {
          const code = stripComments(await ctx.readFile(file), 'code');
          code.split('\n').forEach((text, index) => {
            const colour = CODE_COLOUR_RES.some((re) => re.test(text));
            const font = CODE_FONT_RE.test(text) && !allowedRelativeSize(file, text);
            if (!colour && !font) return;
            ctx.report.violation({
              message: `Raw ${colour ? 'colour' : 'font value'} in code — reference a token (\`var(--…)\`, a token utility, a type role) instead (FE-011 [no-raw-value-in-code]).`,
              file,
              line: index + 1,
            });
          });
        }
        for (const file of await governed(ctx, ['src/**/*.module.css'])) {
          const css = stripComments(await ctx.readFile(file), 'css');
          css.split('\n').forEach((text, index) => {
            if (!CSS_FONT_RE.test(text) || allowedRelativeSize(file, text)) return;
            ctx.report.violation({
              message: `Font property in a CSS module — size, weight and family come from the type roles and --font-* tokens (FE-011 [no-raw-value-in-code]).`,
              file,
              line: index + 1,
            });
          });
        }
      },
    },

    // A3 — §2.2. A Slide token file adds Slide-local names; it never redeclares a global one.
    'slide-token-no-global-name': {
      description:
        'A Slide token file (a CSS module in an Episode Slide folder) MUST NOT declare a custom property that globals.css already declares (--primary, --machine, …). Legacy files are exempt.',
      severity: 'error',
      async check(ctx) {
        const globalNames = await globalTokenNames(ctx);
        for (const file of await slideModules(ctx)) {
          const css = stripComments(await ctx.readFile(file), 'css');
          for (const decl of declarations(css)) {
            if (!globalNames.has(decl.property)) continue;
            ctx.report.violation({
              message: `Slide token file redeclares the global token \`${decl.property}\` — pick a Slide-local name (FE-011 [slide-token-no-global-name]).`,
              file,
              line: decl.line,
            });
          }
        }
      },
    },

    // A4 — §2.3. Every raw colour in a Slide token file has a value under :global(.dark) for the same selector and property.
    'slide-token-dark-counterpart': {
      description:
        'Every raw colour a Slide token file (or the token editor panel module) declares MUST have a dark counterpart: the same property on the same selector under :global(.dark). Legacy files are exempt.',
      severity: 'error',
      async check(ctx) {
        for (const file of await slideModules(ctx, [EDITOR_PANEL_MODULE])) {
          const decls = declarations(stripComments(await ctx.readFile(file), 'css'));
          const dark = new Set(
            decls.filter((d) => isDarkSelector(d.selector)).map((d) => `${lightForm(d.selector)}|${d.property}`),
          );
          for (const decl of decls) {
            if (isDarkSelector(decl.selector) || !cssValueHasColour(decl.value)) continue;
            if (dark.has(`${lightForm(decl.selector)}|${decl.property}`)) continue;
            ctx.report.violation({
              message: `Raw colour \`${decl.value}\` on \`${decl.selector}\` has no dark value — add \`:global(.dark) ${decl.selector} { ${decl.property}: … }\` (FE-011 [slide-token-dark-counterpart]).`,
              file,
              line: decl.line,
            });
          }
        }
      },
    },

    // A5 — §5.1. globals.css holds tokens, not Episode styling.
    'no-episode-selector-in-globals': {
      description:
        'globals.css MUST NOT hold an Episode selector ([data-episode=…]); Episode styling lives with the Episode.',
      severity: 'error',
      async check(ctx) {
        const css = stripComments(await ctx.readFile(GLOBALS), 'css');
        css.split('\n').forEach((text, index) => {
          if (!/\[data-episode\s*[=~|^$*]?=/.test(text)) return;
          ctx.report.violation({
            message: `Episode selector in the global stylesheet — move it to the Episode's own CSS module (FE-011 [no-episode-selector-in-globals]).`,
            file: GLOBALS,
            line: index + 1,
          });
        });
      },
    },

    // A6 — §6.2. The legacy list only shrinks; an entry that matches no file is dead.
    'no-dead-legacy-entry': {
      description:
        'Every glob in src/design-system/legacy.json MUST match at least one file. A migrated or deleted file takes its entry with it.',
      severity: 'error',
      async check(ctx) {
        const entry = (await ctx.readJSON(LEGACY_FILE)) as { globs: string[] };
        for (const glob of entry.globs) {
          if ((await ctx.glob(glob)).length > 0) continue;
          ctx.report.violation({
            message: `Legacy entry \`${glob}\` matches no file — delete it from the list (FE-011 [no-dead-legacy-entry]).`,
            file: LEGACY_FILE,
          });
        }
      },
    },
  },
} satisfies RuleSet;
