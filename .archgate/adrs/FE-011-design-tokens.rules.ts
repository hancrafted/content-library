/// <reference path="../rules.d.ts" />

const LEGACY_FILE = 'src/shared/design-system/legacy.json';
const GLOBALS = 'src/app/globals.css';
const SLIDE_MODULE_GLOBS = ['src/episodes/**/slides/**/*.module.css', 'src/episodes/slide-pool/**/*.module.css'];
// decision: FE-011 §2
const TOKEN_EDITOR_PANEL_FIXED_PALETTE_MODULE =
  'src/shared/components/design-system-token-editor/token-panel.module.css';
const CODE_GLOBS = ['src/**/*.ts', 'src/**/*.tsx'];
const CSS_GLOB = 'src/**/*.css';

const LITERAL_ASSERTING_TEST_FILE_RE = /\.(?:test|spec)\.tsx?$/;

// decision: FE-011 §3.5
const RELATIVE_SIZE_ALLOWED: Record<string, string> = {
  'src/shared/page-chrome/context-drawer/slide-notes.tsx': '0.7em',
  'src/episodes/components/slide-master/rich-tags.tsx': '0.9em',
};

const HEX = '#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])';
const COLOUR_FN = String.raw`\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(\s*[-+.\d]`;
const NAMED_COLOURS_EXCLUDING_TRANSPARENT_CURRENTCOLOR_AND_INHERIT = [
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
const NAMED = NAMED_COLOURS_EXCLUDING_TRANSPARENT_CURRENTCOLOR_AND_INHERIT.join('|');
const COLOUR_PROP = String.raw`(?:color|fill|stroke|background(?:Color)?|floodColor|stopColor|border(?:Color)?|outline(?:Color)?|boxShadow|textShadow)`;

const BARE_HEX_OR_COLOUR_FUNCTION_IN_CSS_VALUE_RE = new RegExp(`${HEX}|${COLOUR_FN}`);
const NAMED_COLOUR_TOKEN_NOT_IDENTIFIER_FUNCTION_STRING_OR_URL_RE = new RegExp(
  String.raw`(?<![\w#.-])(?:${NAMED})(?![\w-]|\s*\()`,
  'i',
);

function cssValueHasColour(value: string): boolean {
  if (BARE_HEX_OR_COLOUR_FUNCTION_IN_CSS_VALUE_RE.test(value)) return true;
  const bare = value
    .replace(/(['"])(?:(?!\1).)*\1/g, '""')
    .replace(/url\([^)]*\)/gi, 'url()')
    .replace(/var\(\s*--[\w-]+/gi, 'var(');
  return NAMED_COLOUR_TOKEN_NOT_IDENTIFIER_FUNCTION_STRING_OR_URL_RE.test(bare);
}
const CODE_COLOUR_RES = [
  new RegExp(`(['"\`])${HEX}\\1`),
  new RegExp(String.raw`[(,]\s*${HEX}`),
  new RegExp(String.raw`\[${HEX}\]`),
  new RegExp(COLOUR_FN),
  new RegExp(String.raw`\b${COLOUR_PROP}['"]?\s*[:=]\s*\{?\s*['"\`][^'"\`]*${HEX}`),
  new RegExp(String.raw`\b${COLOUR_PROP}['"]?\s*[:=]\s*\{?\s*['"](?:${NAMED})['"]`, 'i'),
  new RegExp(String.raw`\b(?:color-mix|[a-z-]*gradient)\([^)]*(?<![\w#.-])(?:${NAMED})(?![\w-])`, 'i'),
];
const CODE_FONT_RE = /\b(?:fontSize|fontWeight|fontFamily)\s*[:=]|\bfont-(?:size|weight|family)\s*:/;
const CSS_FONT_RE = /(?:^|[;{\s])font-(?:size|weight|family)\s*:/;

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

// decision: FE-011 §6
async function legacyFiles(ctx: RuleContext): Promise<Set<string>> {
  const entry = (await ctx.readJSON(LEGACY_FILE)) as { globs: string[] };
  const matched = await Promise.all(entry.globs.map((glob) => ctx.glob(glob)));
  return new Set(matched.flat());
}

async function governed(ctx: RuleContext, globs: string[]): Promise<string[]> {
  const legacy = await legacyFiles(ctx);
  const all = (await Promise.all(globs.map((glob) => ctx.glob(glob)))).flat();
  return all.filter((file) => !legacy.has(file) && !LITERAL_ASSERTING_TEST_FILE_RE.test(file));
}

async function slideModules(ctx: RuleContext, extra: string[] = []): Promise<string[]> {
  const legacy = await legacyFiles(ctx);
  const present = new Set(await ctx.glob('src/**/*.module.css'));
  const globbed = (await Promise.all(SLIDE_MODULE_GLOBS.map((glob) => ctx.glob(glob)))).flat();
  const files = [...new Set(globbed), ...extra.filter((file) => present.has(file))];
  return files.filter((file) => !legacy.has(file));
}

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
    // decision: FE-011 §2.1
    'no-raw-colour-in-css': {
      description:
        'A raw colour (hex, rgb(), hsl(), oklch()) in CSS appears only under :root / .dark in globals.css and in a Slide token file (a CSS module in an Episode Slide folder), plus the token editor panel module. Named colours (black, chocolate, …) count; transparent, currentColor and inherit do not. Legacy files are exempt.',
      severity: 'error',
      async check(ctx) {
        const globbed = (await Promise.all(SLIDE_MODULE_GLOBS.map((glob) => ctx.glob(glob)))).flat();
        const slides = new Set([...globbed, TOKEN_EDITOR_PANEL_FIXED_PALETTE_MODULE]);
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

    // decision: FE-011 §4.1
    // decision: FE-011 §4.2
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

    // decision: FE-011 §2.2
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

    // decision: FE-011 §2.3
    'slide-token-dark-counterpart': {
      description:
        'Every raw colour a Slide token file (or the token editor panel module) declares MUST have a dark counterpart: the same property on the same selector under :global(.dark). Legacy files are exempt.',
      severity: 'error',
      async check(ctx) {
        for (const file of await slideModules(ctx, [TOKEN_EDITOR_PANEL_FIXED_PALETTE_MODULE])) {
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

    // decision: FE-011 §5.1
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

    // decision: FE-011 §6.2
    'no-dead-legacy-entry': {
      description:
        'Every glob in src/shared/design-system/legacy.json MUST match at least one file. A migrated or deleted file takes its entry with it.',
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
