// Pins the Explorable explanation folder boundary (design-ADR 0016 decision 6, FE-012): an Explorable explanation
// lives in its own folder of the Explorable explanations product area, `src/explorable-explanations/<name>/`, apart
// from the Episodes area's `slide-shared/`, which it never imports; only a Slide or page assembly imports one (FE-007).
// The dependency-cruiser rules run over a throwaway probe tree, as in slide-folder.test.ts.

import { cruise, type IForbiddenRuleType, type IReporterOutput } from 'dependency-cruiser';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const config = createRequire(import.meta.url)('../../.dependency-cruiser.cjs') as {
  forbidden: (IForbiddenRuleType & { name: string })[];
};
const RULES = [
  'slide-folder-reaches-only-own-and-shared',
  'slide-shared-reaches-only-ui-and-lib',
  'explorable-explanation-reaches-shared-ui-and-lib',
  'explorable-explanation-client-reaches-only-own-folder-core-hooks-and-lib',
  'areas-never-import-each-other',
  'page-assembly-reaches-areas-through-tier-folders',
  'shared-knows-no-domain',
];
const RULE_SET = { forbidden: config.forbidden.filter(({ name }) => RULES.includes(name)) };

const SLIDE = 'src/episodes/probe/slides/probe-slide';
const EXPLANATION = 'src/explorable-explanations/probe-explanation';
const CORE = 'src/shared/components/core-components';

const PROBES: Readonly<Record<string, string>> = {
  'src/episodes/components/slide-shared/statement.tsx': 'export const Statement = 1;',
  'src/shared/components/ui/button.tsx': 'export const Button = 1;',
  'src/shared/hooks/use-probe.ts': 'export const useProbe = 1;',
  'src/shared/lib/probe.pure.ts': 'export const probe = 1;',
  [`${CORE}/probe-core/probe-core.tsx`]: 'export const core = 1;',
  'src/explorable-explanations/other-explanation/other.tsx': 'export const other = 1;',
  [`${EXPLANATION}/probe-explanation.client.tsx`]:
    "import { core } from '../../shared/components/core-components/probe-core/probe-core';\nimport { useProbe } from '../../shared/hooks/use-probe';\nexport const c = [core, useProbe];",
  [`${EXPLANATION}/probe-explanation.tsx`]: [
    "import { c } from './probe-explanation.client';",
    "import { core } from '../../shared/components/core-components/probe-core/probe-core';",
    "import { Button } from '../../shared/components/ui/button';",
    "import { probe } from '../../shared/lib/probe.pure';",
    'export const explanation = [c, core, Button, probe];',
  ].join('\n'),
  [`${EXPLANATION}/reaches-other.client.tsx`]:
    "import { other } from '../other-explanation/other';\nexport const x = other;",
  [`${EXPLANATION}/reaches-statement.tsx`]:
    "import { Statement } from '../../episodes/components/slide-shared/statement';\nexport const x = Statement;",
  [`${EXPLANATION}/reaches-statement.client.tsx`]:
    "import { Statement } from '../../episodes/components/slide-shared/statement';\nexport const x = Statement;",
  [`${SLIDE}/slide.tsx`]:
    "import { explanation } from '../../../../explorable-explanations/probe-explanation/probe-explanation';\nexport const slide = explanation;",
  'src/page-assembly/probe-template/probe-template.tsx':
    "import { explanation } from '../../explorable-explanations/probe-explanation/probe-explanation';\nexport const page = explanation;",
  'src/shared/lib/reaches-explanation.pure.ts':
    "import { explanation } from '../../explorable-explanations/probe-explanation/probe-explanation';\nexport const x = explanation;",
  'src/episodes/components/slide-shared/reaches-explanation.tsx':
    "import { explanation } from '../../../explorable-explanations/probe-explanation/probe-explanation';\nexport const x = explanation;",
};

let root = '';
let output: IReporterOutput;

function violations(): string[] {
  if (typeof output.output === 'string') throw new Error('dependency-cruiser returned a report, not a result.');
  return output.output.summary.violations
    .map(({ rule, from, to }) => `${rule.name}: ${from.replace(`${EXPLANATION}/`, '')} -> ${to}`)
    .sort();
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'explanation-folder-'));
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

describe('Explorable explanation folder', () => {
  it('keeps the context window and the human-in-the-loop workflow apart from plain shared parts', () => {
    // ARRANGE
    const home = 'src/explorable-explanations';
    const names = ['context', 'human-in-the-loop'];
    // ACT
    const moved = names.map((name) => ({
      name,
      inHome: existsSync(join(process.cwd(), home, name)),
      inShared: existsSync(join(process.cwd(), 'src/episodes/components/slide-shared', name)),
    }));
    // ASSERT
    expect(moved).toEqual(names.map((name) => ({ name, inHome: true, inShared: false })));
  });

  it('lets an explanation and its client leaf reach the plain shared parts they are allowed to, and a Slide or a page template import an explanation', () => {
    // ARRANGE
    const files = ['probe-explanation.tsx', 'probe-explanation.client.tsx', 'slide.tsx', 'probe-template.tsx'];
    // ACT
    const found = violations().filter((line) => files.some((file) => line.split(' -> ')[0].endsWith(file)));
    // ASSERT
    expect(found).toEqual([]);
  });

  it('rejects an explanation reaching a slide-shared part (another product area), a client leaf leaving its explanation for another or a plain shared part, and a shared part or lib module importing an explanation', () => {
    // ARRANGE
    const expected = [
      'areas-never-import-each-other: reaches-statement.client.tsx -> src/episodes/components/slide-shared/statement.tsx',
      'areas-never-import-each-other: reaches-statement.tsx -> src/episodes/components/slide-shared/statement.tsx',
      'areas-never-import-each-other: src/episodes/components/slide-shared/reaches-explanation.tsx -> src/explorable-explanations/probe-explanation/probe-explanation.tsx',
      'explorable-explanation-client-reaches-only-own-folder-core-hooks-and-lib: reaches-other.client.tsx -> src/explorable-explanations/other-explanation/other.tsx',
      'explorable-explanation-client-reaches-only-own-folder-core-hooks-and-lib: reaches-statement.client.tsx -> src/episodes/components/slide-shared/statement.tsx',
      'explorable-explanation-reaches-shared-ui-and-lib: reaches-statement.tsx -> src/episodes/components/slide-shared/statement.tsx',
      'shared-knows-no-domain: src/shared/lib/reaches-explanation.pure.ts -> src/explorable-explanations/probe-explanation/probe-explanation.tsx',
      'slide-shared-reaches-only-ui-and-lib: src/episodes/components/slide-shared/reaches-explanation.tsx -> src/explorable-explanations/probe-explanation/probe-explanation.tsx',
    ];
    // ACT
    const found = violations();
    // ASSERT
    expect(found).toEqual(expected);
  });
});
