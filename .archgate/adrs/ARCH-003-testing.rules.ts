/// <reference path="../rules.d.ts" />

// ARCH-003 — Testing. The two shape Disciplines under src/ that no eslint
// selector expresses cheaply, matched by scanning lines (prettier fixes the
// layout these patterns rely on: a top-level describe starts at column 0).
//
// `suite-three-blocks` — the file's top-level describe blocks are exactly
// `success cases`, `failure cases` and `edge cases`, once each (§2.1).
// `test-body-aaa` — every it/test body carries `// ARRANGE`, `// ACT` and
// `// ASSERT`, uppercase, once each, in that order, one marker per comment
// (§3.1). A body runs from its `it(`/`test(` line to the next test or describe
// line, so markers in a helper between tests count toward the test above it.
// Runs at error (GEN-001 §7). Self-contained: archgate forbids imports
// between rules files.
const TEST_GLOB = 'src/**/*.test.ts';
const BLOCKS = ['success cases', 'failure cases', 'edge cases'];
const MARKERS = ['ARRANGE', 'ACT', 'ASSERT'];

const TOP_DESCRIBE_RE = /^describe(?:\.\w+)*\(\s*(['"`])(.*?)\1/;
const TEST_START_RE = /^\s*(?:it|test)(?:\.\w+)*(?:\([\s\S]*?\))?\s*\(/;
const BLOCK_START_RE = /^\s*describe(?:\.\w+)*\(/;
// Any comment naming a marker word, in any case — so `// Arrange` and
// `// ARRANGE / ACT` are seen and judged rather than skipped.
const MARKER_COMMENT_RE = /^\s*\/\/\s*(arrange|act|assert)\b(.*)$/i;
const SECOND_MARKER_RE = /\b(arrange|act|assert)\b/i;

interface Body {
  line: number;
  markers: string[];
  malformed: string[];
}

function testBodies(lines: string[]): Body[] {
  const bodies: Body[] = [];
  let current: Body | null = null;
  lines.forEach((text, index) => {
    if (TEST_START_RE.test(text)) {
      current = { line: index + 1, markers: [], malformed: [] };
      bodies.push(current);
      return;
    }
    if (BLOCK_START_RE.test(text)) {
      current = null;
      return;
    }
    const marker = MARKER_COMMENT_RE.exec(text);
    if (current === null || marker === null) return;
    const word = marker[1];
    if (word !== word.toUpperCase() || SECOND_MARKER_RE.test(marker[2])) current.malformed.push(text.trim());
    else current.markers.push(word);
  });
  return bodies;
}

export default {
  rules: {
    'suite-three-blocks': {
      description:
        'Every src/**/*.test.ts splits at top level into exactly three describe blocks — success cases, failure cases, edge cases — once each, with no fourth name (§2.1).',
      severity: 'error',
      async check(ctx) {
        for (const file of await ctx.glob(TEST_GLOB)) {
          const lines = (await ctx.readFile(file)).split('\n');
          const seen: string[] = [];
          lines.forEach((text, index) => {
            const m = TOP_DESCRIBE_RE.exec(text);
            if (m === null) return;
            const name = m[2];
            if (!BLOCKS.includes(name)) {
              ctx.report.violation({
                message: `Top-level describe '${name}' is not one of success cases, failure cases, edge cases — fold it into the block it belongs to (ARCH-003 [suite-three-blocks]).`,
                file,
                line: index + 1,
              });
            } else if (seen.includes(name)) {
              ctx.report.violation({
                message: `Top-level describe '${name}' appears twice — merge the two blocks (ARCH-003 [suite-three-blocks]).`,
                file,
                line: index + 1,
              });
            }
            seen.push(name);
          });
          const missing = BLOCKS.filter((name) => !seen.includes(name));
          if (missing.length > 0) {
            ctx.report.violation({
              message: `Test file has no top-level describe '${missing.join("', '")}' — every suite splits into success cases, failure cases and edge cases (ARCH-003 [suite-three-blocks]).`,
              file,
            });
          }
        }
      },
    },
    'test-body-aaa': {
      description:
        'Every it/test body under src/ carries // ARRANGE, // ACT and // ASSERT, uppercase, exactly once each, in that order, one marker per comment (§3.1).',
      severity: 'error',
      async check(ctx) {
        for (const file of await ctx.glob(TEST_GLOB)) {
          const lines = (await ctx.readFile(file)).split('\n');
          for (const body of testBodies(lines)) {
            for (const comment of body.malformed) {
              ctx.report.violation({
                message: `Marker comment '${comment}' must be exactly one uppercase marker — split a combined comment into separate // ARRANGE, // ACT, // ASSERT lines (ARCH-003 [test-body-aaa]).`,
                file,
                line: body.line,
              });
            }
            if (body.malformed.length > 0) continue;
            if (body.markers.join() !== MARKERS.join()) {
              ctx.report.violation({
                message: `Test body carries [${body.markers.join(', ')}] — it needs // ARRANGE, // ACT, // ASSERT exactly once each, in that order (ARCH-003 [test-body-aaa]).`,
                file,
                line: body.line,
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
