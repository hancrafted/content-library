// Probe tests for the Slide-folder and slide-shared import boundaries (#51, FE-007 §5, FE-006 §5):
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
const RULES = [
  'slide-folder-reaches-only-own-and-shared',
  'slide-client-reaches-only-hooks-and-lib',
  'slide-shared-reaches-only-ui-and-lib',
  'slide-shared-client-reaches-only-own-part-hooks-and-lib',
  'core-components-are-a-leaf',
];
const RULE_SET = { forbidden: config.forbidden.filter(({ name }) => RULES.includes(name)) };

const SLIDE = 'src/components/episodes/probe/slides/probe-slide';
/** A Slide of an Event's copy, under `by-event/<event>/<slug>/`: the same fence holds there. */
const COPY = 'src/components/episodes/by-event/2026-01-01-probe/probe';
const PART = 'src/components/slide-shared/probe-visual';
const CORE = 'src/components/slide-shared/core-components';

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
  [`${COPY}/slides/other-slide/slide.tsx`]: 'export const copied = 1;',
  [`${COPY}/slides/probe-slide/own.tsx`]: 'export const own = 1;',
  [`${COPY}/slides/probe-slide/slide.tsx`]: "import { own } from './own';\nexport const legalCopy = own;",
  [`${COPY}/slides/probe-slide/copy-reaches-other-slide.tsx`]:
    "import { copied } from '../other-slide/slide';\nexport const x = copied;",
  [`${PART}/probe-visual.pure.ts`]: 'export const view = 1;',
  [`${PART}/probe-visual.client.tsx`]:
    "import { view } from './probe-visual.pure';\nimport { useProbe } from '../../../hooks/use-probe';\nimport { probe } from '../../../lib/probe.pure';\nexport const v = [view, useProbe, probe];",
  [`${PART}/probe-visual.tsx`]: [
    "import { v } from './probe-visual.client';",
    "import { view } from './probe-visual.pure';",
    "import { Statement } from '../statement';",
    "import { Button } from '../../ui/button';",
    'export const visual = [v, view, Statement, Button];',
  ].join('\n'),
  [`${PART}/reaches-other-part.client.tsx`]: "import { Statement } from '../statement';\nexport const x = Statement;",
  [`${PART}/reaches-ui.client.tsx`]: "import { Button } from '../../ui/button';\nexport const x = Button;",
  [`${PART}/reaches-hook.tsx`]: "import { useProbe } from '../../../hooks/use-probe';\nexport const x = useProbe;",
  [`${CORE}/probe-core/probe-core.tsx`]: [
    "import { sibling } from '../probe-sibling/probe-sibling';",
    "import { probe } from '../../../../lib/probe.pure';",
    'export const core = [sibling, probe];',
  ].join('\n'),
  [`${CORE}/probe-core/probe-core.client.tsx`]:
    "import { sibling } from '../probe-sibling/probe-sibling';\nimport { useProbe } from '../../../../hooks/use-probe';\nexport const c = [sibling, useProbe];",
  [`${CORE}/probe-sibling/probe-sibling.tsx`]: 'export const sibling = 1;',
  [`${CORE}/probe-core/reaches-part.tsx`]: "import { Statement } from '../../statement';\nexport const x = Statement;",
  [`${CORE}/probe-core/reaches-ui.tsx`]: "import { Button } from '../../../ui/button';\nexport const x = Button;",
  [`${PART}/uses-core.client.tsx`]:
    "import { core } from '../core-components/probe-core/probe-core';\nexport const x = core;",
  [`${SLIDE}/uses-core.tsx`]:
    "import { core } from '../../../../slide-shared/core-components/probe-core/probe-core';\nexport const x = core;",
  [`${SLIDE}/reaches-core.client.tsx`]:
    "import { core } from '../../../../slide-shared/core-components/probe-core/probe-core';\nexport const x = core;",
};

let root = '';
let output: IReporterOutput;

/** Every violation as `<rule>: <from> -> <to>`, sorted. */
function violations(): string[] {
  if (typeof output.output === 'string') throw new Error('dependency-cruiser returned a report, not a result.');
  return output.output.summary.violations
    .map(
      ({ rule, from, to }) =>
        `${rule.name}: ${from.replace(`${SLIDE}/`, '').replace(`${COPY}/slides/probe-slide/`, '').replace(`${PART}/`, '').replace(`${CORE}/probe-core/`, '')} -> ${to}`,
    )
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

  it('lets a slide-shared part render its own client leaf, and the leaf import its own pure logic, hooks and lib', () => {
    // ARRANGE
    const files = ['probe-visual.tsx', 'probe-visual.client.tsx'];
    // ACT
    const fromPart = violations().filter((line) => files.some((file) => line.includes(`: ${file} ->`)));
    // ASSERT
    expect(fromPart).toEqual([]);
  });
});

describe('core-components', () => {
  it('lets a slide-shared client leaf, a Slide server file and a core file reach core, hooks and lib', () => {
    // ARRANGE
    const files = ['uses-core.client.tsx', 'uses-core.tsx', 'probe-core.tsx', 'probe-core.client.tsx'];
    // ACT
    const found = violations().filter((line) => files.some((file) => line.includes(`: ${file} ->`)));
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('failure cases', () => {
  it("rejects a Slide importing another Slide (an Event copy's too), the Episode file or a non-shared component, a client widget reaching the Slide master, a slide-shared client leaf leaving its part, and a slide-shared server part reaching a hook", () => {
    // ARRANGE
    const expected = [
      'core-components-are-a-leaf: reaches-part.tsx -> src/components/slide-shared/statement.tsx',
      'core-components-are-a-leaf: reaches-ui.tsx -> src/components/ui/button.tsx',
      'slide-client-reaches-only-hooks-and-lib: reaches-core.client.tsx -> src/components/slide-shared/core-components/probe-core/probe-core.tsx',
      'slide-client-reaches-only-hooks-and-lib: reaches-master.client.tsx -> src/components/slide-master/slide.ts',
      'slide-folder-reaches-only-own-and-shared: copy-reaches-other-slide.tsx -> src/components/episodes/by-event/2026-01-01-probe/probe/slides/other-slide/slide.tsx',
      'slide-folder-reaches-only-own-and-shared: reaches-episode.tsx -> src/components/episodes/probe/probe.ts',
      'slide-folder-reaches-only-own-and-shared: reaches-other-slide.tsx -> src/components/episodes/probe/slides/other-slide/slide.tsx',
      'slide-folder-reaches-only-own-and-shared: reaches-toc.tsx -> src/components/table-of-contents/toc.tsx',
      'slide-shared-client-reaches-only-own-part-hooks-and-lib: reaches-other-part.client.tsx -> src/components/slide-shared/statement.tsx',
      'slide-shared-client-reaches-only-own-part-hooks-and-lib: reaches-ui.client.tsx -> src/components/ui/button.tsx',
      'slide-shared-reaches-only-ui-and-lib: reaches-hook.tsx -> src/hooks/use-probe.ts',
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
