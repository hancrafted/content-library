/// <reference path="../rules.d.ts" />

// FE-010 — Context Drawer. The two parts of the decision that sit in file text:
// the stylesheet reveals the context slot in print, and the drawer code never
// goes modal. Placement, focus and the rendered slot are held by the post-build
// test. Matched textually. Self-contained by design:
// archgate forbids imports between rules files.
const CSS_FILE = 'src/app/globals.css';
const DRAWER_GLOB = 'src/components/context-drawer/**/*';

const COMMENT_RE = /\/\*[\s\S]*?\*\//g;
const PRINT_START_RE = /@media\s+print\s*\{/g;
const CONTEXT_SLOT_RE = /\[data-slot=(['"])context\1\]/;
const DISPLAY_BLOCK_RE = /display\s*:\s*block/;
const MODAL_RE = /\bshowModal\s*\(|\baria-modal\b/g;

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

// The text of each `@media print { ... }` block, found by brace depth.
function printBlocks(css: string): string[] {
  const blocks: string[] = [];
  for (const start of css.matchAll(PRINT_START_RE)) {
    let depth = 1;
    let i = start.index + start[0].length;
    const begin = i;
    for (; i < css.length && depth > 0; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
    }
    blocks.push(css.slice(begin, i - 1));
  }
  return blocks;
}

export default {
  rules: {
    'print-reveals-context': {
      description:
        "src/app/globals.css holds an @media print block that names [data-slot='context'] and sets display: block, so notes print whether or not the drawer was ever opened.",
      severity: 'error',
      async check(ctx) {
        const files = await ctx.glob(CSS_FILE);
        if (files.length === 0) {
          ctx.report.violation({
            message: `${CSS_FILE} is missing — it must hold the print block that reveals the context slot (FE-010 [print-reveals-context]).`,
          });
          return;
        }
        const css = (await ctx.readFile(CSS_FILE)).replace(COMMENT_RE, '');
        const reveals = printBlocks(css).some((block) => CONTEXT_SLOT_RE.test(block) && DISPLAY_BLOCK_RE.test(block));
        if (!reveals) {
          ctx.report.violation({
            message: `No @media print block names [data-slot='context'] with display: block — a closed drawer would drop the notes from the printed page (FE-010 [print-reveals-context]).`,
            file: CSS_FILE,
          });
        }
      },
    },
    'drawer-is-non-modal': {
      description:
        'Nothing under src/components/context-drawer/ calls showModal( or sets aria-modal: the drawer is a complementary region that leaves the page interactive.',
      severity: 'error',
      async check(ctx) {
        for (const file of await ctx.glob(DRAWER_GLOB)) {
          const source = await ctx.readFile(file);
          for (const match of source.matchAll(MODAL_RE)) {
            ctx.report.violation({
              message: `Drawer names '${match[0]}' — it is a non-modal complementary region; leave the page interactive (FE-010 [drawer-is-non-modal]).`,
              file,
              line: lineAt(source, match.index),
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
