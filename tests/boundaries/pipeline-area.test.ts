// Pins the pipeline product area's boundary (#354, FE-007 §2.3 and §2.8): the content pipeline, its Run log and the dashboard
// live in `src/pipeline/`, page assembly reaches them through `components/` and `lib/`, and nothing under `src/`
// imports `skills/` or `tools/`. The dependency-cruiser rules run over a throwaway probe tree, as in
// slide-folder.test.ts.

import { cruise, type IForbiddenRuleType, type IReporterOutput } from 'dependency-cruiser';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const config = createRequire(import.meta.url)('../../.dependency-cruiser.cjs') as {
  forbidden: (IForbiddenRuleType & { name: string })[];
};
const RULES = [
  'src-never-imports-skills-or-tools',
  'layers-never-import-app',
  'page-assembly-reached-only-from-app',
  'areas-never-import-each-other',
  'page-assembly-reaches-areas-through-tier-folders',
  'shared-knows-no-domain',
  'lib-imports-no-react',
  'lib-imports-no-upper-tier',
  'hooks-reached-only-from-client',
];
const RULE_SET = { forbidden: config.forbidden.filter(({ name }) => RULES.includes(name)) };

const AREA = 'src/pipeline';
const TEMPLATE = 'src/page-assembly/dashboard';

/** Each probe file and what it imports, relative to the probe tree's root. */
const PROBES: Readonly<Record<string, string>> = {
  'node_modules/react/index.js': 'export const React = 1;',
  'skills/probe/scripts/helper.ts': 'export const helper = 1;',
  'tools/probe/helper.ts': 'export const tool = 1;',
  'src/shared/components/ui/button.tsx': 'export const Button = 1;',
  'src/page-assembly/landing/card.tsx': 'export const Card = 1;',
  'src/shared/lib/probe.pure.ts': 'export const probe = 1;',
  'src/episodes/lib/episode.pure.ts': 'export const placeSections = 1;',
  [`${AREA}/lib/run-log.pure.ts`]: "import { probe } from '../../shared/lib/probe.pure';\nexport const log = probe;",
  [`${AREA}/hooks/use-run.ts`]: "import { log } from '../lib/run-log.pure';\nexport const useRun = log;",
  [`${AREA}/components/panel.client.tsx`]: [
    "import { useRun } from '../hooks/use-run';",
    "import { Button } from '../../shared/components/ui/button';",
    'export const Panel = [useRun, Button];',
  ].join('\n'),
  [`${AREA}/components/dashboard.tsx`]: "import { Panel } from './panel.client';\nexport const Dashboard = Panel;",
  [`${TEMPLATE}/dashboard-page.tsx`]: [
    "import { Dashboard } from '../../pipeline/components/dashboard';",
    "import { log } from '../../pipeline/lib/run-log.pure';",
    'export const Page = [Dashboard, log];',
  ].join('\n'),
  [`${TEMPLATE}/reaches-hook.tsx`]: "import { useRun } from '../../pipeline/hooks/use-run';\nexport const x = useRun;",
  'src/shared/lib/reaches-pipeline.pure.ts':
    "import { log } from '../../pipeline/lib/run-log.pure';\nexport const x = log;",
  'src/shared/lib/reaches-skill.ts':
    "import { helper } from '../../../skills/probe/scripts/helper';\nexport const x = helper;",
  'src/shared/lib/reaches-tool.ts': "import { tool } from '../../../tools/probe/helper';\nexport const x = tool;",
  [`${AREA}/lib/reaches-react.ts`]: "import { React } from 'react';\nexport const x = React;",
  [`${AREA}/lib/reaches-hook.ts`]: "import { useRun } from '../hooks/use-run';\nexport const x = useRun;",
  [`${AREA}/components/reaches-landing.tsx`]:
    "import { Card } from '../../page-assembly/landing/card';\nexport const x = Card;",
  [`${AREA}/lib/reaches-episodes.ts`]:
    "import { placeSections } from '../../episodes/lib/episode.pure';\nexport const x = placeSections;",
  [`${AREA}/components/server-reaches-hook.tsx`]:
    "import { useRun } from '../hooks/use-run';\nexport const x = useRun;",
};

let root = '';
let output: IReporterOutput;

/** Every violation as `<rule>: <from> -> <to>`, sorted. */
function violations(): string[] {
  if (typeof output.output === 'string') throw new Error('dependency-cruiser returned a report, not a result.');
  return output.output.summary.violations.map(({ rule, from, to }) => `${rule.name}: ${from} -> ${to}`).sort();
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'pipeline-area-'));
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
  it('lets the dashboard template reach the area through components/ and lib/, and the area use its own tiers and the UI kit', () => {
    // ARRANGE
    const legal = [
      `${TEMPLATE}/dashboard-page.tsx`,
      `${AREA}/components/dashboard.tsx`,
      `${AREA}/components/panel.client.tsx`,
      `${AREA}/hooks/use-run.ts`,
      `${AREA}/lib/run-log.pure.ts`,
    ];
    // ACT
    const found = violations().filter((line) => legal.some((file) => line.includes(`: ${file} ->`)));
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects src/ importing a skill or a tool, a lower tier reaching the area, assembly reaching its hooks, and the area leaving its tiers', () => {
    // ARRANGE
    const expected = [
      `areas-never-import-each-other: ${AREA}/lib/reaches-episodes.ts -> src/episodes/lib/episode.pure.ts`,
      `hooks-reached-only-from-client: ${TEMPLATE}/reaches-hook.tsx -> ${AREA}/hooks/use-run.ts`,
      `hooks-reached-only-from-client: ${AREA}/components/server-reaches-hook.tsx -> ${AREA}/hooks/use-run.ts`,
      `hooks-reached-only-from-client: ${AREA}/lib/reaches-hook.ts -> ${AREA}/hooks/use-run.ts`,
      `lib-imports-no-react: ${AREA}/lib/reaches-react.ts -> node_modules/react/index.js`,
      `lib-imports-no-upper-tier: ${AREA}/lib/reaches-hook.ts -> ${AREA}/hooks/use-run.ts`,
      `page-assembly-reached-only-from-app: ${AREA}/components/reaches-landing.tsx -> src/page-assembly/landing/card.tsx`,
      `page-assembly-reaches-areas-through-tier-folders: ${TEMPLATE}/reaches-hook.tsx -> ${AREA}/hooks/use-run.ts`,
      `shared-knows-no-domain: src/shared/lib/reaches-pipeline.pure.ts -> ${AREA}/lib/run-log.pure.ts`,
      'src-never-imports-skills-or-tools: src/shared/lib/reaches-skill.ts -> skills/probe/scripts/helper.ts',
      'src-never-imports-skills-or-tools: src/shared/lib/reaches-tool.ts -> tools/probe/helper.ts',
    ];
    // ACT
    const found = violations();
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('names the fix in the skills-and-tools rule, so a violation can be fixed without the ADR', () => {
    // ARRANGE
    const fix = 'Move the module into its area under src/';
    // ACT
    const comment = config.forbidden.find(({ name }) => name === 'src-never-imports-skills-or-tools')?.comment;
    // ASSERT
    expect(comment).toContain(fix);
  });
});
