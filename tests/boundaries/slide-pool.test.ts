// Probe tests for the Slide pool boundary (design-ADR 0016, Slide reuse rule 1; FE-007 §5): a pool Slide obeys the
// same import boundary as any Slide folder, and only an Episode file lists it. The dependency-cruiser rules run, as
// `npm run lint:boundaries` runs them, over a throwaway tree of probe files written to a temporary directory.

import { cruise, type IForbiddenRuleType, type IReporterOutput } from 'dependency-cruiser';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const config = createRequire(import.meta.url)('../../.dependency-cruiser.cjs') as {
  forbidden: (IForbiddenRuleType & { name: string; comment: string })[];
};
const RULES = [
  'pool-slide-reaches-only-own-and-shared',
  'pool-slide-client-reaches-only-hooks-and-lib',
  'slide-pool-reached-only-from-episodes',
  'episodes-reach-only-slide-parts',
];
const RULE_SET = { forbidden: config.forbidden.filter(({ name }) => RULES.includes(name)) };

const POOL = 'src/components/slide-pool/probe-slide';

/** Each probe file and what it imports, relative to the probe tree's root. */
const PROBES: Readonly<Record<string, string>> = {
  'src/components/slide-master/slide.ts': 'export const slide = 1;',
  'src/components/slide-shared/statement.tsx': 'export const Statement = 1;',
  'src/components/ui/button.tsx': 'export const Button = 1;',
  'src/components/table-of-contents/toc.tsx': 'export const Toc = 1;',
  'src/components/pages/probe-page.tsx':
    "import { legal } from '../slide-pool/probe-slide/slide';\nexport const page = legal;",
  'src/hooks/use-probe.ts': 'export const useProbe = 1;',
  'src/lib/probe.pure.ts': 'export const probe = 1;',
  'src/components/slide-pool/other-slide/slide.tsx': 'export const other = 1;',
  'src/components/episodes/probe/sections/probe.ts':
    "import { legal } from '../../../slide-pool/probe-slide/slide';\nexport const section = [legal];",
  [`${POOL}/part.tsx`]: 'export const part = 1;',
  [`${POOL}/widget.pure.ts`]: 'export const pure = 1;',
  [`${POOL}/widget.client.tsx`]:
    "import { pure } from './widget.pure';\nimport { useProbe } from '../../../hooks/use-probe';\nimport { probe } from '../../../lib/probe.pure';\nexport const w = [pure, useProbe, probe];",
  [`${POOL}/slide.tsx`]: [
    "import { part } from './part';",
    "import { w } from './widget.client';",
    "import { slide } from '../../slide-master/slide';",
    "import { Statement } from '../../slide-shared/statement';",
    "import { Button } from '../../ui/button';",
    "import { probe } from '../../../lib/probe.pure';",
    'export const legal = [part, w, slide, Statement, Button, probe];',
  ].join('\n'),
  [`${POOL}/reaches-other-slide.tsx`]: "import { other } from '../other-slide/slide';\nexport const x = other;",
  [`${POOL}/reaches-episode.tsx`]:
    "import { section } from '../../episodes/probe/sections/probe';\nexport const x = section;",
  [`${POOL}/reaches-toc.tsx`]: "import { Toc } from '../../table-of-contents/toc';\nexport const x = Toc;",
  [`${POOL}/reaches-master.client.tsx`]: "import { slide } from '../../slide-master/slide';\nexport const x = slide;",
};

let root = '';
let output: IReporterOutput;

/** Every violation as `<rule>: <from> -> <to>`, sorted. */
function violations(): string[] {
  if (typeof output.output === 'string') throw new Error('dependency-cruiser returned a report, not a result.');
  return output.output.summary.violations
    .map(({ rule, from, to }) => `${rule.name}: ${from.replace(`${POOL}/`, '')} -> ${to}`)
    .sort();
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'slide-pool-'));
  for (const [file, source] of Object.entries(PROBES)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), source);
  }
  const cwd = process.cwd();
  process.chdir(root);
  try {
    output = await cruise(['src'], { validate: true, ruleSet: RULE_SET, tsPreCompilationDeps: true });
  } finally {
    process.chdir(cwd);
  }
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('success cases', () => {
  it("lets a pool Slide's server entry import its own files and every global shared location", () => {
    // ARRANGE
    const files = ['slide.tsx', 'widget.client.tsx'];
    // ACT
    const found = violations().filter((line) => files.some((file) => line.includes(`: ${file} ->`)));
    // ASSERT
    expect(found).toEqual([]);
  });

  it("lets an Episode's Section list a pool Slide by reference", () => {
    // ARRANGE
    const section = 'src/components/episodes/probe/sections/probe.ts';
    // ACT
    const found = violations().filter((line) => line.includes(`: ${section} ->`));
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects a pool Slide importing another Slide, an Episode or a non-shared component, its widget reaching the Slide master, and a page importing a pool Slide', () => {
    // ARRANGE
    const expected = [
      'pool-slide-client-reaches-only-hooks-and-lib: reaches-master.client.tsx -> src/components/slide-master/slide.ts',
      'pool-slide-reaches-only-own-and-shared: reaches-episode.tsx -> src/components/episodes/probe/sections/probe.ts',
      'pool-slide-reaches-only-own-and-shared: reaches-other-slide.tsx -> src/components/slide-pool/other-slide/slide.tsx',
      'pool-slide-reaches-only-own-and-shared: reaches-toc.tsx -> src/components/table-of-contents/toc.tsx',
      'slide-pool-reached-only-from-episodes: src/components/pages/probe-page.tsx -> src/components/slide-pool/probe-slide/slide.tsx',
    ];
    // ACT
    const found = violations();
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('names every allowed location in the rule message, so a violation can be fixed without the ADR', () => {
    // ARRANGE
    const expected = [
      'src/components/slide-master/',
      'slide-shared/',
      'explorable-explanations/',
      'ui/',
      'src/hooks/',
      'src/lib/',
    ];
    const rule = config.forbidden.find(({ name }) => name === RULES[0]);
    // ACT
    const named = expected.filter((location) => rule?.comment.includes(location));
    // ASSERT
    expect(named).toEqual(expected);
  });
});
