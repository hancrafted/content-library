// Pins the Events product area's boundary (spec #348, FE-007 §2): `src/events/` imports no other product area and no
// layer above it, and only page assembly reaches into it, through its tier folders. The dependency-cruiser rules run over a throwaway probe
// tree, as in slide-folder.test.ts.

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
  'layers-never-import-app',
  'page-assembly-reached-only-from-app',
  'areas-never-import-each-other',
  'page-assembly-reaches-areas-through-tier-folders',
  'shared-knows-no-domain',
];
const RULE_SET = { forbidden: config.forbidden.filter(({ name }) => RULES.includes(name)) };

const AREA = 'src/events';
const reach = (from: string, names: readonly string[]) =>
  [
    ...names.map((name, i) => `import * as m${i} from '${name}';`),
    `export const x = [${names.map((_, i) => `m${i}`)}];`,
  ]
    .join('\n')
    .replaceAll("'@/", `'${'../'.repeat(from.split('/').length - 2)}`);

const PROBES: Readonly<Record<string, string>> = {
  'src/shared/components/ui/button.tsx': 'export const Button = 1;',
  'src/shared/hooks/use-probe.ts': 'export const useProbe = 1;',
  'src/shared/i18n/translation-strings.ts': 'export const readTranslationStrings = 1;',
  'src/shared/lib/probe.pure.ts': 'export const probe = 1;',
  'src/content-store/store.ts': 'export const store = 1;',
  'src/content-store/schemas/fields.ts': 'export const fields = 1;',
  'src/episodes/lib/registry.ts': 'export const registry = 1;',
  'src/episodes/components/episode-card/episode-card.pure.ts': 'export const card = 1;',
  'src/episodes/lib/probe.pure.ts': 'export const episode = 1;',
  'src/app/page.tsx': 'export const page = 1;',
  [`${AREA}/lib/probe-event.pure.ts`]: reach(`${AREA}/lib/probe-event.pure.ts`, [
    '@/shared/lib/probe.pure',
    '@/content-store/schemas/fields',
  ]),
  [`${AREA}/components/probe-card.tsx`]: reach(`${AREA}/components/probe-card.tsx`, [
    '@/events/lib/probe-event.pure',
    '@/shared/components/ui/button',
    '@/shared/hooks/use-probe',
    '@/shared/i18n/translation-strings',
    '@/content-store/store',
  ]),
  [`${AREA}/components/reaches-episodes.tsx`]: reach(`${AREA}/components/reaches-episodes.tsx`, [
    '@/episodes/lib/registry',
    '@/episodes/components/episode-card/episode-card.pure',
    '@/episodes/lib/probe.pure',
  ]),
  [`${AREA}/components/reaches-up.tsx`]: reach(`${AREA}/components/reaches-up.tsx`, [
    '@/page-assembly/event/event-page',
    '@/app/page',
  ]),
  'src/page-assembly/event/event-page.tsx': reach('src/page-assembly/event/event-page.tsx', [
    '@/events/components/probe-card',
    '@/events/lib/probe-event.pure',
  ]),
  'src/shared/lib/reaches-events.pure.ts': reach('src/shared/lib/reaches-events.pure.ts', [
    '@/events/lib/probe-event.pure',
  ]),
  'src/shared/components/reaches-events.tsx': reach('src/shared/components/reaches-events.tsx', [
    '@/events/components/probe-card',
  ]),
};

let root = '';
let output: IReporterOutput;

function violations(): string[] {
  if (typeof output.output === 'string') throw new Error('dependency-cruiser returned a report, not a result.');
  return output.output.summary.violations.map(({ rule, from, to }) => `${rule.name}: ${from} -> ${to}`).sort();
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'events-area-'));
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

describe('Events product area', () => {
  it('holds the Event cards, the Playlist list and the Event-scoped Episode framing', () => {
    // ARRANGE
    const homes = [
      `${AREA}/components/playlist-list.tsx`,
      `${AREA}/components/event-episode-chrome.tsx`,
      `${AREA}/components/event-card.tsx`,
      `${AREA}/lib/event-playlist.pure.ts`,
      `${AREA}/lib/events.pure.ts`,
    ];
    // ACT
    const found = homes.filter((file) => !existsSync(file));
    // ASSERT
    expect(found).toEqual([]);
  });

  it('lets the area reach itself, the shared tiers and the content store, and page assembly reach the area', () => {
    // ARRANGE
    const allowed = [`${AREA}/lib/probe-event.pure.ts`, `${AREA}/components/probe-card.tsx`, 'src/page-assembly/'];
    // ACT
    const found = violations().filter((line) => allowed.some((file) => line.includes(`: ${file}`)));
    // ASSERT
    expect(found).toEqual([]);
  });

  it('rejects the area importing another product area or a layer above it, and anything but page assembly importing the area', () => {
    // ARRANGE
    const expected = [
      'areas-never-import-each-other: src/events/components/reaches-episodes.tsx -> src/episodes/components/episode-card/episode-card.pure.ts',
      'areas-never-import-each-other: src/events/components/reaches-episodes.tsx -> src/episodes/lib/probe.pure.ts',
      'areas-never-import-each-other: src/events/components/reaches-episodes.tsx -> src/episodes/lib/registry.ts',
      'layers-never-import-app: src/events/components/reaches-up.tsx -> src/app/page.tsx',
      'page-assembly-reached-only-from-app: src/events/components/reaches-up.tsx -> src/page-assembly/event/event-page.tsx',
      'shared-knows-no-domain: src/shared/components/reaches-events.tsx -> src/events/components/probe-card.tsx',
      'shared-knows-no-domain: src/shared/lib/reaches-events.pure.ts -> src/events/lib/probe-event.pure.ts',
    ];
    // ACT
    const found = violations();
    // ASSERT
    expect(found).toEqual(expected);
  });
});
