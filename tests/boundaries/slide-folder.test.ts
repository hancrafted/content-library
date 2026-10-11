// Probe tests for the Slide-folder import boundary (#51, FE-007 §5, FE-006 §5):
// the dependency-cruiser rules run, as `npm run lint:boundaries` runs them, over a
// throwaway tree of probe files written to a temporary directory, so a rule that
// stopped firing — or started firing on a legal import — fails here, not in review.

import { cruise, type IForbiddenRuleType, type IReporterOutput } from 'dependency-cruiser';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const config = createRequire(import.meta.url)('../../.dependency-cruiser.cjs') as {
  forbidden: (IForbiddenRuleType & { name: string; comment: string })[];
};
const RULES = ['slide-folder-reaches-only-own-and-shared', 'slide-client-reaches-only-hooks-and-lib'];
const RULE_SET = { forbidden: config.forbidden.filter(({ name }) => RULES.includes(name)) };

const SLIDE = 'src/components/episodes/probe/slides/probe-slide';

/** Each probe file and what it imports, relative to the probe tree's root. */
const PROBES: Readonly<Record<string, string>> = {
  'src/components/slide-master/slide.ts': 'export const slide = 1;',
  'src/components/slide-shared/statement.tsx': 'export const Statement = 1;',
  'src/components/ui/button.tsx': 'export const Button = 1;',
  'src/components/table-of-contents/toc.tsx': 'export const Toc = 1;',
  'src/hooks/use-probe.ts': 'export const useProbe = 1;',
  'src/lib/probe.pure.ts': 'export const probe = 1;',
  'src/components/episodes/probe/probe.ts':
    "import { legal } from './slides/probe-slide/slide';\nexport const ep = legal;",
  'src/components/episodes/probe/slides/other-slide/slide.tsx': 'export const other = 1;',
  [`${SLIDE}/part.tsx`]: 'export const part = 1;',
  [`${SLIDE}/widget.pure.ts`]: 'export const pure = 1;',
  [`${SLIDE}/widget.client.tsx`]:
    "import { pure } from './widget.pure';\nimport { useProbe } from '../../../../../hooks/use-probe';\nimport { probe } from '../../../../../lib/probe.pure';\nexport const w = [pure, useProbe, probe];",
  [`${SLIDE}/slide.tsx`]: [
    "import { part } from './part';",
    "import { w } from './widget.client';",
    "import { slide } from '../../../../slide-master/slide';",
    "import { Statement } from '../../../../slide-shared/statement';",
    "import { Button } from '../../../../ui/button';",
    "import { probe } from '../../../../../lib/probe.pure';",
    'export const legal = [part, w, slide, Statement, Button, probe];',
  ].join('\n'),
  [`${SLIDE}/reaches-other-slide.tsx`]: "import { other } from '../other-slide/slide';\nexport const x = other;",
  [`${SLIDE}/reaches-episode.tsx`]: "import { ep } from '../../probe';\nexport const x = ep;",
  [`${SLIDE}/reaches-toc.tsx`]: "import { Toc } from '../../../../table-of-contents/toc';\nexport const x = Toc;",
  [`${SLIDE}/reaches-master.client.tsx`]:
    "import { slide } from '../../../../slide-master/slide';\nexport const x = slide;",
};

let root = '';
let output: IReporterOutput;

/** Every violation as `<rule>: <from> -> <to>`, sorted. */
function violations(): string[] {
  if (typeof output.output === 'string') throw new Error('dependency-cruiser returned a report, not a result.');
  return output.output.summary.violations
    .map(({ rule, from, to }) => `${rule.name}: ${from.replace(`${SLIDE}/`, '')} -> ${to}`)
    .sort();
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'slide-folder-'));
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
  it("lets a Slide's server entry import its own files and every global shared location", () => {
    // ARRANGE
    const legalEntry = 'slide.tsx';
    // ACT
    const fromEntry = violations().filter((line) => line.includes(`: ${legalEntry} ->`));
    // ASSERT
    expect(fromEntry).toEqual([]);
  });

  it("lets a Slide's client widget import its own pure logic, hooks and lib", () => {
    // ARRANGE
    const widget = 'widget.client.tsx';
    // ACT
    const fromWidget = violations().filter((line) => line.includes(`: ${widget} ->`));
    // ASSERT
    expect(fromWidget).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects a Slide importing another Slide, the Episode file or a non-shared component, and a client widget reaching the Slide master', () => {
    // ARRANGE
    const expected = [
      'slide-client-reaches-only-hooks-and-lib: reaches-master.client.tsx -> src/components/slide-master/slide.ts',
      'slide-folder-reaches-only-own-and-shared: reaches-episode.tsx -> src/components/episodes/probe/probe.ts',
      'slide-folder-reaches-only-own-and-shared: reaches-other-slide.tsx -> src/components/episodes/probe/slides/other-slide/slide.tsx',
      'slide-folder-reaches-only-own-and-shared: reaches-toc.tsx -> src/components/table-of-contents/toc.tsx',
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
      'src/components/slide-shared/',
      'src/components/ui/',
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
