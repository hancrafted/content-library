// Probe tests for the Slide pool's import boundaries (FE-004 §3, FE-007 §5): the dependency-cruiser rules run, as
// `npm run lint:boundaries` runs them, over a throwaway tree of probe files written to a temporary directory, with a
// tsconfig of its own so the `@/` alias resolves as it does in the repo. Only a Section reaches a pool Slide, through
// the alias; never as its section slide, never from the Episode file (the Title slide), never from another Slide.

import { cruise, type IForbiddenRuleType, type IReporterOutput } from 'dependency-cruiser';
import extractTSConfig from 'dependency-cruiser/config-utl/extract-ts-config';
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
  'slide-pool-reached-only-from-sections',
  'section-slide-never-from-pool',
  'section-reaches-pool-by-alias',
];
const RULE_SET = { forbidden: config.forbidden.filter(({ name }) => RULES.includes(name)) };

const POOL = 'src/components/episodes/slide-pool';
const EPISODE = 'src/components/episodes/probe';
/** An Event's copy, one folder deeper: the alias reaches the pool from any depth. */
const COPY = 'src/components/episodes/by-event/2026-01-01-probe/probe';
const POOLED = '@/components/episodes/slide-pool/pooled/slide';

/** Each probe file and what it imports, relative to the probe tree's root. */
const PROBES: Readonly<Record<string, string>> = {
  'tsconfig.json': JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@/*': ['./src/*'] } } }),
  'src/components/slide-master/slide.ts': 'export const slide = 1;',
  'src/hooks/use-probe.ts': 'export const useProbe = 1;',
  [`${POOL}/pooled/part.tsx`]: 'export const part = 1;',
  [`${POOL}/pooled/slide.tsx`]: [
    "import { part } from './part';",
    "import { slide } from '../../../slide-master/slide';",
    'export const pooled = [part, slide];',
  ].join('\n'),
  [`${POOL}/pooled/widget.client.tsx`]:
    "import { useProbe } from '../../../../hooks/use-probe';\nexport const w = useProbe;",
  [`${POOL}/other/slide.tsx`]: 'export const other = 1;',
  [`${POOL}/pooled/reaches-other-pool-slide.tsx`]: "import { other } from '../other/slide';\nexport const x = other;",
  [`${POOL}/pooled/reaches-episode-slide.tsx`]:
    "import { own } from '../../probe/slides/own/slide';\nexport const x = own;",
  [`${POOL}/pooled/reaches-master.client.tsx`]:
    "import { slide } from '../../../slide-master/slide';\nexport const x = slide;",
  [`${EPISODE}/slides/opener/slide.tsx`]: 'export const opener = 1;',
  [`${EPISODE}/slides/own/slide.tsx`]: 'export const own = 1;',
  [`${EPISODE}/slides/own/reaches-pool.tsx`]: `import { pooled } from '${POOLED}';\nexport const x = pooled;`,
  [`${EPISODE}/sections/opener.ts`]: [
    "import { opener } from '../slides/opener/slide';",
    `import { pooled } from '${POOLED}';`,
    'export const section = [opener, pooled];',
  ].join('\n'),
  [`${EPISODE}/sections/relative.ts`]:
    "import { pooled } from '../../slide-pool/pooled/slide';\nexport const x = pooled;",
  [`${EPISODE}/sections/pooled.ts`]: `import { pooled } from '${POOLED}';\nexport const section = [pooled];`,
  [`${EPISODE}/episode.ts`]: `import { pooled } from '${POOLED}';\nexport const title = pooled;`,
  [`${COPY}/sections/opener.ts`]: `import { pooled } from '${POOLED}';\nexport const section = [pooled];`,
};

let root = '';
let output: IReporterOutput;

/** Every violation as `<rule>: <from> -> <to>`, sorted, paths shortened to the probe folders. */
function violations(): string[] {
  if (typeof output.output === 'string') throw new Error('dependency-cruiser returned a report, not a result.');
  return output.output.summary.violations
    .map(({ rule, from, to }) => `${rule.name}: ${from.replace('src/components/episodes/', '')} -> ${to}`)
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
    output = await cruise(
      ['src'],
      { validate: true, ruleSet: RULE_SET, tsPreCompilationDeps: true, tsConfig: { fileName: 'tsconfig.json' } },
      undefined,
      { tsConfig: extractTSConfig('tsconfig.json') },
    );
  } finally {
    process.chdir(cwd);
  }
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('success cases', () => {
  it('lets a Section import a pool Slide through the alias, from an Episode and from an Event copy alike', () => {
    // ARRANGE
    const sections = ['probe/sections/opener.ts', 'by-event/2026-01-01-probe/probe/sections/opener.ts'];
    // ACT
    const found = violations().filter((line) => sections.some((file) => line.includes(`: ${file} ->`)));
    // ASSERT
    expect(found).toEqual([]);
  });

  it('lets a pool Slide import its own files and the Slide master, and its client widget reach hooks', () => {
    // ARRANGE
    const files = ['slide-pool/pooled/slide.tsx', 'slide-pool/pooled/widget.client.tsx'];
    // ACT
    const found = violations().filter((line) => files.some((file) => line.includes(`: ${file} ->`)));
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('failure cases', () => {
  it('refuses a pool Slide as a Title slide or a section slide, reached by a relative path, or from another Slide', () => {
    // ARRANGE
    const expected = [
      'section-reaches-pool-by-alias: probe/sections/relative.ts -> src/components/episodes/slide-pool/pooled/slide.tsx',
      'section-slide-never-from-pool: probe/sections/pooled.ts -> src/components/episodes/slide-pool/pooled/slide.tsx',
      'slide-client-reaches-only-hooks-and-lib: slide-pool/pooled/reaches-master.client.tsx -> src/components/slide-master/slide.ts',
      'slide-folder-reaches-only-own-and-shared: probe/slides/own/reaches-pool.tsx -> src/components/episodes/slide-pool/pooled/slide.tsx',
      'slide-folder-reaches-only-own-and-shared: slide-pool/pooled/reaches-episode-slide.tsx -> src/components/episodes/probe/slides/own/slide.tsx',
      'slide-folder-reaches-only-own-and-shared: slide-pool/pooled/reaches-other-pool-slide.tsx -> src/components/episodes/slide-pool/other/slide.tsx',
      'slide-pool-reached-only-from-sections: probe/episode.ts -> src/components/episodes/slide-pool/pooled/slide.tsx',
      'slide-pool-reached-only-from-sections: probe/slides/own/reaches-pool.tsx -> src/components/episodes/slide-pool/pooled/slide.tsx',
    ];
    // ACT
    const found = violations();
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('resolves the alias in the probe tree, so the by-alias rule is not passing over unresolved imports', () => {
    // ARRANGE
    const resolved = 'src/components/episodes/slide-pool/pooled/slide.tsx';
    // ACT
    const targets =
      typeof output.output === 'string'
        ? []
        : output.output.modules
            .filter(({ source }) => source === `${EPISODE}/episode.ts`)
            .flatMap(({ dependencies }) => dependencies.map(({ resolved: to }) => to));
    // ASSERT
    expect(targets).toEqual([resolved]);
  });
});
