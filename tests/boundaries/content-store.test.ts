// Probe tests for the content store's import boundaries (FE-013 Decision 1, FE-007 §2):
// the dependency-cruiser rules run, as `npm run lint:boundaries` runs them, over a
// throwaway tree of probe files written to a temporary directory. Every forbidden rule
// runs, so a probe meets the real gate.

import { cruise, type IForbiddenRuleType, type IReporterOutput } from 'dependency-cruiser';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const config = createRequire(import.meta.url)('../../.dependency-cruiser.cjs') as {
  forbidden: (IForbiddenRuleType & { name: string; comment: string })[];
};
const RULE_SET = { forbidden: config.forbidden };

const STORE = 'src/content-store';
const EPISODE = 'src/episodes/probe';
const PAGES = 'src/page-assembly/landing';

/** Each probe file and what it imports, relative to the probe tree's root. */
const PROBES: Readonly<Record<string, string>> = {
  'node_modules/zod/index.js': 'export const z = 1;',
  'node_modules/react/index.js': 'export const React = 1;',
  'src/shared/lib/probe.pure.ts': 'export const probe = 1;',
  'src/episodes/components/slide-master/slide.ts': 'export const slide = 1;',
  [`${STORE}/schemas/episode.schema.ts`]: "import { z } from 'zod';\nexport const episodeSchema = z;",
  [`${STORE}/events/2026-10-23-axel.ts`]: 'export const event = 1;',
  'src/shared/components/ui/button.tsx': 'export const Button = 1;',
  [`${STORE}/refusals.ts`]: "import { probe } from '../shared/lib/probe.pure';\nexport const refusals = probe;",
  [`${STORE}/store.ts`]: [
    "import { episodeSchema } from './schemas/episode.schema';",
    "import { event } from './events/2026-10-23-axel';",
    "import { refusals } from './refusals';",
    "import { episodeMetadata } from '../episodes/probe/episode-metadata';",
    "import { probe } from '../shared/lib/probe.pure';",
    'export const store = [episodeSchema, event, refusals, episodeMetadata, probe];',
  ].join('\n'),
  [`${STORE}/store.test.ts`]: "import { refusals } from './refusals';\nexport const t = refusals;",
  [`${STORE}/reaches-slide-master.ts`]:
    "import { slide } from '../episodes/components/slide-master/slide';\nexport const x = slide;",
  [`${STORE}/reaches-ui.ts`]: "import { Button } from '../shared/components/ui/button';\nexport const x = Button;",
  [`${STORE}/reaches-react.ts`]: "import { React } from 'react';\nexport const x = React;",
  [`${EPISODE}/episode-metadata.ts`]: [
    "import { episodeSchema } from '../../content-store/schemas/episode.schema';",
    "import { probe } from '../../shared/lib/probe.pure';",
    'export const episodeMetadata = [episodeSchema, probe];',
  ].join('\n'),
  'src/episodes/stray/episode-metadata.ts':
    "import { slide } from '../components/slide-master/slide';\nexport const episodeMetadata = slide;",
  'src/episodes/episode-repository.ts':
    "import { episodeMetadata } from './probe/episode-metadata';\nexport const old = episodeMetadata;",
  [`${PAGES}/reads-store.tsx`]: "import { store } from '../../content-store/store';\nexport const x = store;",
  [`${PAGES}/reaches-metadata.tsx`]:
    "import { episodeMetadata } from '../../episodes/probe/episode-metadata';\nexport const x = episodeMetadata;",
  [`${PAGES}/reaches-refusals.tsx`]:
    "import { refusals } from '../../content-store/refusals';\nexport const x = refusals;",
  [`${PAGES}/types-from-schema.client.tsx`]:
    "import type { episodeSchema } from '../../content-store/schemas/episode.schema';\nexport type X = typeof episodeSchema;",
  [`${PAGES}/reaches-store.client.tsx`]: "import { store } from '../../content-store/store';\nexport const x = store;",
  'src/episodes/lib/types-from-schema.pure.ts':
    "import { episodeSchema } from '../../content-store/schemas/episode.schema';\nexport const x = episodeSchema;",
  'src/shared/lib/types-from-schema.pure.ts':
    "import { episodeSchema } from '../../content-store/schemas/episode.schema';\nexport const x = episodeSchema;",
  [`${STORE}/schemas/reaches-lib.schema.ts`]:
    "import { probe } from '../../shared/lib/probe.pure';\nexport const x = probe;",
  [`${PAGES}/reaches-event.tsx`]:
    "import { event } from '../../content-store/events/2026-10-23-axel';\nexport const x = event;",
  'src/episodes/lib/reaches-store.pure.ts':
    "import { store } from '../../content-store/store';\nexport const x = store;",
  'src/shared/lib/reaches-store.pure.ts': "import { store } from '../../content-store/store';\nexport const x = store;",
  'src/shared/hooks/use-store.ts': "import { store } from '../../content-store/store';\nexport const x = store;",
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
  it("lets a product area's lib read record types from a schema, and a client leaf import one as a type only", () => {
    // ARRANGE
    const files = ['src/episodes/lib/types-from-schema.pure.ts', `${PAGES}/types-from-schema.client.tsx`];
    // ACT
    const found = files.flatMap(from);
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects every reader that bypasses the entry, the old Episode repository included, a store that reaches components or React, a lower tier reaching the store, shared code reaching the domain, a client leaf importing it at runtime, a schema leaving its leaf, and Episode metadata reaching above lib', () => {
    // ARRANGE
    const expected = [
      'client-never-imports-content-store: src/page-assembly/landing/reaches-store.client.tsx -> src/content-store/store.ts',
      'content-store-tier: src/content-store/reaches-react.ts -> node_modules/react/index.js',
      'content-store-tier: src/content-store/reaches-slide-master.ts -> src/episodes/components/slide-master/slide.ts',
      'content-store-tier: src/content-store/reaches-ui.ts -> src/shared/components/ui/button.tsx',
      'episode-metadata-reaches-only-schemas-and-lib: src/episodes/stray/episode-metadata.ts -> src/episodes/components/slide-master/slide.ts',
      'hooks-import-no-upper-tier: src/shared/hooks/use-store.ts -> src/content-store/store.ts',
      'lib-imports-no-upper-tier: src/episodes/lib/reaches-store.pure.ts -> src/content-store/store.ts',
      'lib-imports-no-upper-tier: src/shared/lib/reaches-store.pure.ts -> src/content-store/store.ts',
      'records-read-only-through-store: src/episodes/episode-repository.ts -> src/episodes/probe/episode-metadata.ts',
      'records-read-only-through-store: src/page-assembly/landing/reaches-event.tsx -> src/content-store/events/2026-10-23-axel.ts',
      'records-read-only-through-store: src/page-assembly/landing/reaches-metadata.tsx -> src/episodes/probe/episode-metadata.ts',
      'schemas-are-a-leaf: src/content-store/schemas/reaches-lib.schema.ts -> src/shared/lib/probe.pure.ts',
      'shared-knows-no-domain: src/shared/hooks/use-store.ts -> src/content-store/store.ts',
      'shared-knows-no-domain: src/shared/lib/reaches-store.pure.ts -> src/content-store/store.ts',
      'shared-knows-no-domain: src/shared/lib/types-from-schema.pure.ts -> src/content-store/schemas/episode.schema.ts',
      'store-entry-only: src/page-assembly/landing/reaches-event.tsx -> src/content-store/events/2026-10-23-axel.ts',
      'store-entry-only: src/page-assembly/landing/reaches-refusals.tsx -> src/content-store/refusals.ts',
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

  it('expires the old-repository exception once the store entry exists in this repository', () => {
    // ARRANGE
    const exception = 'episode-repository';
    const storeExists = existsSync('src/content-store/store.ts');
    // ACT
    const stillExempt = storeExists && readFileSync('.dependency-cruiser.cjs', 'utf8').includes(exception);
    // ASSERT
    expect(
      stillExempt,
      'src/content-store/store.ts exists: delete the episode-repository exception from records-read-only-through-store (FE-013 Known gap).',
    ).toBe(false);
  });
});
