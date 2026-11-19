/// <reference path="../rules.d.ts" />

const CODE_GLOBS = ['src/episodes/**/*.ts', 'src/episodes/**/*.tsx'];
const ALL_GLOBS = [...CODE_GLOBS, 'src/episodes/**/*.css'];
const TEST_FILE_RE = /\.(?:test|spec)\.tsx?$/;
const PRESENTATION_OPEN_RE = /(?:\bpresentation\s*[:=]|\bSlidePresentation\s*=)\s*\{/g;
const TONE_KEY_RE = /(?:^|[\s,{])tone\s*:/;
const TEXT_COLOUR_KEY_RE = /['"]--(?:muted-)?foreground['"]\s*:/;
const TONE_FLIP_RE = /data-tone-flip/;

function lineAt(text: string, offset: number): number {
  return text.slice(0, offset).split('\n').length;
}

function blank(match: string): string {
  return match.replace(/[^\n]/g, ' ');
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/(^|\s)\/\/.*$/gm, blank);
}

function braceBlockEnd(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    else if (text[i] === '}' && (depth -= 1) === 0) return i;
  }
  return text.length;
}

async function files(ctx: RuleContext, globs: string[]): Promise<string[]> {
  const found = (await Promise.all(globs.map((glob) => ctx.glob(glob)))).flat();
  return [...new Set(found)].filter((file) => !TEST_FILE_RE.test(file));
}

export default {
  rules: {
    // decision: FE-004 §5.4
    'no-retired-tone': {
      description:
        'A Slide presentation MUST NOT declare `tone`, carry a `--foreground` or `--muted-foreground` key in its `style`, and no Episode code or CSS may use `data-tone-flip`. A Slide declares `inverse` and `surface` instead.',
      severity: 'error',
      async check(ctx) {
        for (const file of await files(ctx, ALL_GLOBS)) {
          const source = stripComments(await ctx.readFile(file));
          source.split('\n').forEach((text, index) => {
            if (!TONE_FLIP_RE.test(text)) return;
            ctx.report.violation({
              message:
                'data-tone-flip is retired — declare `inverse` on the Slide presentation (FE-004 [no-retired-tone]).',
              file,
              line: index + 1,
            });
          });
          if (!/\.tsx?$/.test(file)) continue;
          for (const open of source.matchAll(PRESENTATION_OPEN_RE)) {
            const start = (open.index ?? 0) + open[0].length - 1;
            const body = source.slice(start, braceBlockEnd(source, start));
            for (const [re, what] of [
              [TONE_KEY_RE, '`tone`'],
              [TEXT_COLOUR_KEY_RE, 'a `--foreground` or `--muted-foreground` key'],
            ] as const) {
              const hit = re.exec(body);
              if (!hit) continue;
              ctx.report.violation({
                message: `Presentation declares ${what} — declare \`inverse\` or a \`surface\` instead (FE-004 [no-retired-tone]).`,
                file,
                line: lineAt(source, start + hit.index),
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
