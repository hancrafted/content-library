// Pins the general area rules (spec #348, #358, FE-007 §2): layers import only downward, product areas never import
// each other but for a Slide showing an Explorable explanation, page assembly reaches an area only through its tier
// folders, shared knows no domain, the store's one upward edge is Episode metadata, and `src/` and `skills/`/`tools/`
// meet only through an area's `lib/` or the store's entry. The dependency-cruiser rules run, as
// `npm run lint:boundaries` runs them over `src/`, `skills/` and `tools/`, on a throwaway probe tree.

import { cruise, type IForbiddenRuleType, type IReporterOutput } from 'dependency-cruiser';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, posix } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const config = createRequire(import.meta.url)('../../.dependency-cruiser.cjs') as {
  forbidden: (IForbiddenRuleType & { name: string })[];
};
const RULES = [
  'layers-never-import-app',
  'page-assembly-reached-only-from-app',
  'areas-never-import-each-other',
  'slide-folder-reaches-only-own-and-shared',
  'page-assembly-reaches-areas-through-tier-folders',
  'shared-knows-no-domain',
  'content-store-tier',
  'src-never-imports-skills-or-tools',
  'skills-and-tools-reach-src-through-area-lib-or-store-entry',
];
const RULE_SET = { forbidden: config.forbidden.filter(({ name }) => RULES.includes(name)) };

/** A module importing each target, given as a repo-root path without its extension. */
function importing(from: string, targets: readonly string[]): string {
  const lines = targets.map((target, i) => {
    const relative = posix.relative(posix.dirname(from), target);
    return `import * as m${i} from '${relative.startsWith('.') ? relative : `./${relative}`}';`;
  });
  return [...lines, `export const x = [${targets.map((_, i) => `m${i}`).join(', ')}];`].join('\n');
}

const LEAF = 'export const leaf = 1;';
const SLIDE = 'src/episodes/probe/slides/probe-slide/slide.tsx';
const STRAY_SLIDE = 'src/episodes/probe/slides/stray-slide/slide.tsx';
const TEMPLATE = 'src/page-assembly/landing';

/** Each probe file and what it imports, relative to the probe tree's root. */
const PROBES: Readonly<Record<string, string>> = {
  'src/app/page.tsx': LEAF,
  'src/episodes/components/episode-card/episode-card.tsx': LEAF,
  'src/episodes/lib/probe.pure.ts': LEAF,
  'src/episodes/probe/episode.ts': LEAF,
  'src/episodes/probe/episode-metadata.ts': LEAF,
  'src/events/index.ts': LEAF,
  'src/events/components/event-card.tsx': importing('src/events/components/event-card.tsx', [
    'src/shared/lib/probe.pure',
    'src/content-store/store',
  ]),
  'src/pipeline/lib/run-log.pure.ts': LEAF,
  'src/pipeline/hooks/use-run.ts': LEAF,
  'src/explorable-explanations/index.ts': LEAF,
  'src/explorable-explanations/probe/probe.tsx': LEAF,
  'src/content-store/schemas/fields.ts': LEAF,
  'src/shared/lib/probe.pure.ts': LEAF,
  'src/content-store/store.ts': importing('src/content-store/store.ts', [
    'src/episodes/probe/episode-metadata',
    'src/content-store/schemas/fields',
    'src/shared/lib/probe.pure',
  ]),
  'tools/probe/helper.ts': importing('tools/probe/helper.ts', ['src/episodes/lib/probe.pure']),
  'skills/probe/scripts/run.ts': importing('skills/probe/scripts/run.ts', [
    'src/pipeline/lib/run-log.pure',
    'src/content-store/store',
  ]),
  [`${TEMPLATE}/landing-page.tsx`]: importing(`${TEMPLATE}/landing-page.tsx`, [
    'src/episodes/components/episode-card/episode-card',
    'src/episodes/lib/probe.pure',
    'src/events/components/event-card',
    'src/pipeline/lib/run-log.pure',
    'src/explorable-explanations/probe/probe',
    'src/content-store/store',
  ]),
  [SLIDE]: importing(SLIDE, ['src/explorable-explanations/probe/probe']),
  // Breaks: each file below draws edges the rules refuse.
  [STRAY_SLIDE]: importing(STRAY_SLIDE, ['src/events/components/event-card']),
  [`${TEMPLATE}/reaches-past-tiers.tsx`]: importing(`${TEMPLATE}/reaches-past-tiers.tsx`, [
    'src/episodes/probe/episode',
    'src/pipeline/hooks/use-run',
    'src/events/index',
    'src/explorable-explanations/index',
  ]),
  'src/events/lib/reaches-episodes.pure.ts': importing('src/events/lib/reaches-episodes.pure.ts', [
    'src/episodes/lib/probe.pure',
  ]),
  'src/events/components/reaches-up.tsx': importing('src/events/components/reaches-up.tsx', [
    `${TEMPLATE}/landing-page`,
    'src/app/page',
  ]),
  'src/pipeline/components/reaches-events.tsx': importing('src/pipeline/components/reaches-events.tsx', [
    'src/events/components/event-card',
  ]),
  'src/explorable-explanations/probe/reaches-episodes.tsx': importing(
    'src/explorable-explanations/probe/reaches-episodes.tsx',
    ['src/episodes/components/episode-card/episode-card'],
  ),
  'src/content-store/reaches-area.ts': importing('src/content-store/reaches-area.ts', [
    'src/events/components/event-card',
    'src/episodes/lib/probe.pure',
  ]),
  'src/shared/lib/reaches-domain.pure.ts': importing('src/shared/lib/reaches-domain.pure.ts', [
    'src/content-store/store',
    'src/content-store/schemas/fields',
    'src/pipeline/lib/run-log.pure',
  ]),
  'src/shared/lib/reaches-tool.ts': importing('src/shared/lib/reaches-tool.ts', ['tools/probe/helper']),
  'skills/probe/scripts/reaches-past.ts': importing('skills/probe/scripts/reaches-past.ts', [
    'src/pipeline/hooks/use-run',
    'src/content-store/schemas/fields',
    'src/shared/lib/probe.pure',
    'src/episodes/probe/episode',
  ]),
};

let root = '';
let output: IReporterOutput;

/** Every violation as `<rule>: <from> -> <to>`, sorted. */
function violations(): string[] {
  if (typeof output.output === 'string') throw new Error('dependency-cruiser returned a report, not a result.');
  return output.output.summary.violations.map(({ rule, from, to }) => `${rule.name}: ${from} -> ${to}`).sort();
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'area-rules-'));
  for (const [file, source] of Object.entries(PROBES)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), source);
  }
  const cwd = process.cwd();
  process.chdir(root);
  try {
    output = await cruise(['src', 'skills', 'tools'], {
      validate: true,
      ruleSet: RULE_SET,
      tsPreCompilationDeps: true,
    });
  } finally {
    process.chdir(cwd);
  }
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('success cases', () => {
  it('lets page assembly reach each area through its tier folders, a Slide show an explanation, the store read Episode metadata, and skills and tools reach an area lib or the store entry', () => {
    // ARRANGE
    const legal = [
      `${TEMPLATE}/landing-page.tsx`,
      SLIDE,
      'src/events/components/event-card.tsx',
      'src/content-store/store.ts',
      'tools/probe/helper.ts',
      'skills/probe/scripts/run.ts',
    ];
    // ACT
    const found = violations().filter((line) => legal.some((file) => line.includes(`: ${file} ->`)));
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects a Slide importing any area but the Explorable explanations, through its own folder rule', () => {
    // ARRANGE
    const expected = [
      `slide-folder-reaches-only-own-and-shared: ${STRAY_SLIDE} -> src/events/components/event-card.tsx`,
    ];
    // ACT
    const found = violations().filter((line) => line.includes(`: ${STRAY_SLIDE} ->`));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('rejects an upward edge, one area importing another, page assembly reaching past tier folders, shared reading the domain, the store reaching an area, and src/ and skills/ or tools/ meeting anywhere else', () => {
    // ARRANGE
    const expected = [
      'areas-never-import-each-other: src/events/lib/reaches-episodes.pure.ts -> src/episodes/lib/probe.pure.ts',
      'areas-never-import-each-other: src/explorable-explanations/probe/reaches-episodes.tsx -> src/episodes/components/episode-card/episode-card.tsx',
      'areas-never-import-each-other: src/pipeline/components/reaches-events.tsx -> src/events/components/event-card.tsx',
      'content-store-tier: src/content-store/reaches-area.ts -> src/episodes/lib/probe.pure.ts',
      'content-store-tier: src/content-store/reaches-area.ts -> src/events/components/event-card.tsx',
      'layers-never-import-app: src/events/components/reaches-up.tsx -> src/app/page.tsx',
      `page-assembly-reached-only-from-app: src/events/components/reaches-up.tsx -> ${TEMPLATE}/landing-page.tsx`,
      `page-assembly-reaches-areas-through-tier-folders: ${TEMPLATE}/reaches-past-tiers.tsx -> src/episodes/probe/episode.ts`,
      `page-assembly-reaches-areas-through-tier-folders: ${TEMPLATE}/reaches-past-tiers.tsx -> src/events/index.ts`,
      `page-assembly-reaches-areas-through-tier-folders: ${TEMPLATE}/reaches-past-tiers.tsx -> src/explorable-explanations/index.ts`,
      `page-assembly-reaches-areas-through-tier-folders: ${TEMPLATE}/reaches-past-tiers.tsx -> src/pipeline/hooks/use-run.ts`,
      'shared-knows-no-domain: src/shared/lib/reaches-domain.pure.ts -> src/content-store/schemas/fields.ts',
      'shared-knows-no-domain: src/shared/lib/reaches-domain.pure.ts -> src/content-store/store.ts',
      'shared-knows-no-domain: src/shared/lib/reaches-domain.pure.ts -> src/pipeline/lib/run-log.pure.ts',
      'skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> src/content-store/schemas/fields.ts',
      'skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> src/episodes/probe/episode.ts',
      'skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> src/pipeline/hooks/use-run.ts',
      'skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> src/shared/lib/probe.pure.ts',
      `slide-folder-reaches-only-own-and-shared: ${STRAY_SLIDE} -> src/events/components/event-card.tsx`,
      'src-never-imports-skills-or-tools: src/shared/lib/reaches-tool.ts -> tools/probe/helper.ts',
    ];
    // ACT
    const found = violations();
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('names the fix in every area rule, so a violation can be fixed without opening the ADR', () => {
    // ARRANGE
    const pointer = 'FE-007';
    // ACT
    const silent = config.forbidden
      .filter(
        ({ name }) =>
          RULES.includes(name) && !config.forbidden.find((rule) => rule.name === name)?.comment?.includes(pointer),
      )
      .map(({ name }) => name);
    // ASSERT
    expect(silent).toEqual([]);
  });
});
