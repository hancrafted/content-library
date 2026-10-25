// Probe tests for the content store's import boundaries (FE-013 Decision 1, FE-007 §2):
// the dependency-cruiser rules run, as `npm run lint:boundaries` runs them, over a
// throwaway tree of probe files written to a temporary directory. The store does not
// exist on main yet, so these probes are the executable spec its ticket builds against.

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
  'records-read-only-through-store',
  'store-entry-only',
  'episode-metadata-reaches-only-schemas-and-lib',
  'content-store-tier',
  'lib-imports-no-upper-tier',
  'hooks-import-no-upper-tier',
];
const RULE_SET = { forbidden: config.forbidden.filter(({ name }) => RULES.includes(name)) };

const STORE = 'src/content-store';
const EPISODE = 'src/components/episodes/probe';
const PAGES = 'src/components/pages';

/** Each probe file and what it imports, relative to the probe tree's root. */
const PROBES: Readonly<Record<string, string>> = {
  'node_modules/zod/index.js': 'export const z = 1;',
  'node_modules/react/index.js': 'export const React = 1;',
  'src/lib/probe.pure.ts': 'export const probe = 1;',
  'src/components/slide-master/slide.ts': 'export const slide = 1;',
  [`${STORE}/schemas/episode.schema.ts`]: "import { z } from 'zod';\nexport const episodeSchema = z;",
  [`${STORE}/events/2026-10-23-axel.ts`]: 'export const event = 1;',
  [`${STORE}/refusals.ts`]: "import { probe } from '../lib/probe.pure';\nexport const refusals = probe;",
  [`${STORE}/store.ts`]: [
    "import { episodeSchema } from './schemas/episode.schema';",
    "import { event } from './events/2026-10-23-axel';",
    "import { refusals } from './refusals';",
    "import { episodeMetadata } from '../components/episodes/probe/episode-metadata';",
    "import { probe } from '../lib/probe.pure';",
    'export const store = [episodeSchema, event, refusals, episodeMetadata, probe];',
  ].join('\n'),
  [`${STORE}/store.test.ts`]: "import { refusals } from './refusals';\nexport const t = refusals;",
  [`${STORE}/reaches-slide-master.ts`]:
    "import { slide } from '../components/slide-master/slide';\nexport const x = slide;",
  [`${STORE}/reaches-react.ts`]: "import { React } from 'react';\nexport const x = React;",
  [`${EPISODE}/episode-metadata.ts`]: [
    "import { episodeSchema } from '../../../content-store/schemas/episode.schema';",
    "import { probe } from '../../../lib/probe.pure';",
    'export const episodeMetadata = [episodeSchema, probe];',
  ].join('\n'),
  'src/components/episodes/stray/episode-metadata.ts':
    "import { slide } from '../../slide-master/slide';\nexport const episodeMetadata = slide;",
  'src/components/episodes/episode-repository.ts':
    "import { episodeMetadata } from './probe/episode-metadata';\nexport const old = episodeMetadata;",
  [`${PAGES}/reads-store.tsx`]: "import { store } from '../../content-store/store';\nexport const x = store;",
  [`${PAGES}/reaches-metadata.tsx`]:
    "import { episodeMetadata } from '../episodes/probe/episode-metadata';\nexport const x = episodeMetadata;",
  [`${PAGES}/reaches-refusals.tsx`]:
    "import { refusals } from '../../content-store/refusals';\nexport const x = refusals;",
  [`${PAGES}/reaches-event.tsx`]:
    "import { event } from '../../content-store/events/2026-10-23-axel';\nexport const x = event;",
  'src/lib/reaches-store.pure.ts': "import { store } from '../content-store/store';\nexport const x = store;",
  'src/hooks/use-store.ts': "import { store } from '../content-store/store';\nexport const x = store;",
};

let root = '';
let output: IReporterOutput;

/** Every violation as `<rule>: <from> -> <to>`, sorted. */
function violations(): string[] {
  if (typeof output.output === 'string') throw new Error('dependency-cruiser returned a report, not a result.');
  return output.output.summary.violations.map(({ rule, from, to }) => `${rule.name}: ${from} -> ${to}`).sort();
}

function from(file: string): string[] {
  return violations().filter((line) => line.includes(`: ${file} ->`));
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'content-store-'));
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
  it('lets the store read its schemas, records, refusals, Episode metadata and lib', () => {
    // ARRANGE
    const files = [`${STORE}/store.ts`, `${STORE}/refusals.ts`, `${STORE}/schemas/episode.schema.ts`];
    // ACT
    const found = files.flatMap(from);
    // ASSERT
    expect(found).toEqual([]);
  });

  it("lets a page read the store's entry, and an Episode's metadata import its schema and lib", () => {
    // ARRANGE
    const files = [`${PAGES}/reads-store.tsx`, `${EPISODE}/episode-metadata.ts`];
    // ACT
    const found = files.flatMap(from);
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects every reader that bypasses the entry, a store that reaches components or React, a lower tier reaching the store, and Episode metadata reaching above lib', () => {
    // ARRANGE
    const expected = [
      'content-store-tier: src/content-store/reaches-react.ts -> node_modules/react/index.js',
      'content-store-tier: src/content-store/reaches-slide-master.ts -> src/components/slide-master/slide.ts',
      'episode-metadata-reaches-only-schemas-and-lib: src/components/episodes/stray/episode-metadata.ts -> src/components/slide-master/slide.ts',
      'hooks-import-no-upper-tier: src/hooks/use-store.ts -> src/content-store/store.ts',
      'lib-imports-no-upper-tier: src/lib/reaches-store.pure.ts -> src/content-store/store.ts',
      'records-read-only-through-store: src/components/pages/reaches-event.tsx -> src/content-store/events/2026-10-23-axel.ts',
      'records-read-only-through-store: src/components/pages/reaches-metadata.tsx -> src/components/episodes/probe/episode-metadata.ts',
      'store-entry-only: src/components/pages/reaches-event.tsx -> src/content-store/events/2026-10-23-axel.ts',
      'store-entry-only: src/components/pages/reaches-refusals.tsx -> src/content-store/refusals.ts',
    ];
    // ACT
    const found = violations();
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it("lets a test reach the store's internals", () => {
    // ARRANGE
    const file = `${STORE}/store.test.ts`;
    // ACT
    const found = from(file);
    // ASSERT
    expect(found).toEqual([]);
  });

  it('keeps the old Episode repository as the one dormant exception until the store replaces it', () => {
    // ARRANGE
    const file = 'src/components/episodes/episode-repository.ts';
    // ACT
    const found = from(file);
    // ASSERT
    expect(found).toEqual([]);
  });
});
