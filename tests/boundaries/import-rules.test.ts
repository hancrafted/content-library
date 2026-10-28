// Pins the import rules `npm run lint:boundaries` enforces, each asserted here once. Every probe below sits in one
// throwaway tree, with a tsconfig of its own so the `@/` alias resolves as it does in the repo, and every forbidden rule
// of `.dependency-cruiser.cjs` runs over it in one cruise, as the gate runs them over `src/`, `skills/` and `tools/`.
// A rule that stopped firing, or started firing on a legal import, fails here, not in review. The probes come in five
// groups, one per concern; each group's violations are asserted whole, so a stray one in any group fails too:
// - areas (spec #348, #354, #358, FE-007 §2 and §3, FE-006 §3.1): layers import only downward, product areas never
//   import each other but for a Slide showing an Explorable explanation, page assembly reaches an area only through its
//   tier folders, an area's lib/ imports no React and no upper tier, its hooks/ are reached only from a client leaf,
//   shared knows no domain, and `src/` and `skills/`/`tools/` meet only through an area's `lib/` or the store's entry.
// - the content store (FE-013 Decision 1, FE-007 §2): records are read only through the store's entry, which sits
//   below the areas, its one upward edge an Episode's metadata.
// - Slide folders and slide-shared parts (#51, FE-007 §5, FE-006 §5): a Slide, an Event copy's too, imports only its
//   own files and the shared locations; client leaves reach only hooks and lib; core components are a leaf.
// - the Slide pool (FE-004 §3, FE-007 §5): only a Section reaches a pool Slide, through the alias; never as its section
//   slide, never from the Episode file (the Title slide), never from another Slide.
// - Explorable explanations (design-ADR 0016 decision 6, FE-012): one folder each in their own area, apart from
//   slide-shared, which they never import; only a Slide or page assembly imports one.

import { cruise, type IForbiddenRuleType, type IReporterOutput } from 'dependency-cruiser';
import extractTSConfig from 'dependency-cruiser/config-utl/extract-ts-config';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, posix } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const config = createRequire(import.meta.url)('../../.dependency-cruiser.cjs') as {
  forbidden: (IForbiddenRuleType & { name: string; comment: string })[];
};
/** Every rule a probe below breaks: each must fire, and no other may. */
const PINNED = [
  'areas-never-import-each-other',
  'client-never-imports-content-store',
  'content-store-tier',
  'core-components-are-a-leaf',
  'episode-metadata-reaches-only-schemas-and-lib',
  'explorable-explanation-client-reaches-only-own-folder-core-ui-hooks-and-lib',
  'explorable-explanation-reaches-shared-ui-and-lib',
  'hooks-import-no-upper-tier',
  'hooks-reached-only-from-client',
  'layers-never-import-app',
  'lib-imports-no-react',
  'lib-imports-no-upper-tier',
  'page-assembly-reached-only-from-app',
  'page-assembly-reaches-areas-through-tier-folders',
  'page-chrome-reached-only-from-page-assembly-or-container',
  'records-read-only-through-store',
  'schemas-are-a-leaf',
  'section-reaches-pool-by-alias',
  'section-slide-never-from-pool',
  'shared-knows-no-domain',
  'skills-and-tools-reach-src-through-area-lib-or-store-entry',
  'slide-client-reaches-only-hooks-and-lib',
  'slide-folder-reaches-only-own-and-shared',
  'slide-pool-reached-only-from-sections',
  'slide-shared-client-reaches-only-own-part-hooks-and-lib',
  'slide-shared-reaches-only-ui-and-lib',
  'src-never-imports-skills-or-tools',
  'store-entry-only',
  'toc-reached-only-from-container',
];
/** The area rules, each of which explains itself by FE-006 or FE-007. */
const AREA_RULES = [
  'layers-never-import-app',
  'page-assembly-reached-only-from-app',
  'areas-never-import-each-other',
  'slide-folder-reaches-only-own-and-shared',
  'page-assembly-reaches-areas-through-tier-folders',
  'shared-knows-no-domain',
  'content-store-tier',
  'lib-imports-no-react',
  'lib-imports-no-upper-tier',
  'hooks-reached-only-from-client',
  'src-never-imports-skills-or-tools',
  'skills-and-tools-reach-src-through-area-lib-or-store-entry',
];

/** A probe file's imports: each a repo-root path without its extension, an `@/` alias or a bare package name. */
type Edges = readonly string[];
/** A probe file's imports, or its source written out, for an import edges cannot say (a type-only one). */
type Probe = Edges | { readonly source: string };

/** A module importing each target, by a relative path, its alias or its package name. */
function importing(from: string, targets: Edges): string {
  const lines = targets.map((target, i) => {
    if (target.startsWith('@/') || !target.includes('/')) return `import * as m${i} from '${target}';`;
    const relative = posix.relative(posix.dirname(from), target);
    return `import * as m${i} from '${relative.startsWith('.') ? relative : `./${relative}`}';`;
  });
  return [...lines, `export const x = [${targets.map((_, i) => `m${i}`).join(', ')}];`].join('\n');
}

function isWritten(probe: Probe): probe is { readonly source: string } {
  return 'source' in probe;
}

/** One file two groups both probe: what either imports, or refused when either writes its source out. */
function merged(file: string, before: Probe, probe: Probe): Probe {
  if (isWritten(before) || isWritten(probe))
    throw new Error(`Probe ${file} is written out by two groups: give it one.`);
  return [...new Set([...before, ...probe])];
}

/** The source a probe file holds. */
function sourceOf(file: string, probe: Probe): string {
  if (isWritten(probe)) return probe.source;
  return probe.length === 0 ? 'export const leaf = 1;' : importing(file, probe);
}

/** The probe tree: every group's files, a file two groups share importing what either gives it. */
function tree(groups: readonly Readonly<Record<string, Probe>>[]): Record<string, string> {
  const files = new Map<string, Probe>();
  for (const [file, probe] of groups.flatMap((group) => Object.entries(group))) {
    const before = files.get(file);
    files.set(file, before === undefined ? probe : merged(file, before, probe));
  }
  return Object.fromEntries([...files].map(([file, probe]) => [file, sourceOf(file, probe)]));
}

const SLIDE = 'src/episodes/probe/slides/probe-slide';
const STRAY_SLIDE = 'src/episodes/probe/slides/stray-slide/slide.tsx';
/** An Event's copy, under `by-event/<event>/<slug>/`: the Slide fence holds there, and the alias reaches the pool. */
const COPY = 'src/episodes/by-event/2026-01-01-probe/probe';
const PART = 'src/episodes/components/slide-shared/probe-visual';
const CORE = 'src/shared/components/core-components';
const POOL = 'src/episodes/slide-pool';
const POOLED = '@/episodes/slide-pool/pooled/slide';
/** The Episode whose Sections, Slides and Title slide reach the pool. */
const POOL_EPISODE = 'src/episodes/pooling';
const EXPLANATION = 'src/explorables/probe-explanation';
const STORE = 'src/content-store';
const SCHEMA = `${STORE}/schemas/episode.schema`;
const LANDING = 'src/page-assembly/landing';
const EVENT = 'src/page-assembly/event';
const DASHBOARD = 'src/page-assembly/dashboard';
const EVENTS = 'src/events';
const PIPELINE = 'src/pipeline';

/** Product areas, layers, and where `src/` meets `skills/` and `tools/`. */
const AREAS: Readonly<Record<string, Probe>> = {
  // Leaves: the targets the probes below reach.
  'node_modules/react/index.js': [],
  'src/app/page.tsx': [],
  'src/shared/components/ui/button.tsx': [],
  'src/shared/hooks/use-probe.ts': [],
  'src/shared/i18n/translation-strings.ts': [],
  'src/shared/lib/probe.pure.ts': [],
  'src/content-store/schemas/fields.ts': [],
  'src/episodes/components/episode-card/episode-card.tsx': [],
  'src/episodes/components/episode-card/episode-card.pure.ts': [],
  'src/episodes/lib/probe.pure.ts': [],
  'src/episodes/lib/episode.pure.ts': [],
  'src/episodes/lib/registry.ts': [],
  'src/episodes/probe/episode.ts': [],
  'src/episodes/probe/episode-metadata.ts': [],
  'src/events/index.ts': [],
  'src/explorables/index.ts': [],
  'src/explorables/probe/probe.tsx': [],
  'src/explorables/probe/workflow.node.ts': [],
  'src/page-assembly/landing/card.tsx': [],
  'skills/probe/scripts/helper.ts': [],
  // Legal: each file below draws only edges the rules allow.
  [`${STORE}/store.ts`]: [
    'src/episodes/probe/episode-metadata',
    'src/content-store/schemas/fields',
    'src/shared/lib/probe.pure',
  ],
  [`${EVENTS}/lib/probe-event.pure.ts`]: ['src/shared/lib/probe.pure', 'src/content-store/schemas/fields'],
  [`${EVENTS}/components/event-card.tsx`]: ['src/shared/lib/probe.pure', 'src/content-store/store'],
  [`${EVENTS}/components/probe-card.tsx`]: [
    `${EVENTS}/lib/probe-event.pure`,
    `${EVENTS}/components/probe-card.client`,
    'src/shared/components/ui/button',
    'src/shared/i18n/translation-strings',
    'src/content-store/store',
  ],
  [`${EVENTS}/components/probe-card.client.tsx`]: ['src/shared/hooks/use-probe', `${EVENTS}/lib/probe-event.pure`],
  [`${PIPELINE}/lib/run-log.pure.ts`]: ['src/shared/lib/probe.pure'],
  [`${PIPELINE}/hooks/use-run.ts`]: [`${PIPELINE}/lib/run-log.pure`],
  [`${PIPELINE}/components/panel.client.tsx`]: [`${PIPELINE}/hooks/use-run`, 'src/shared/components/ui/button'],
  [`${PIPELINE}/components/dashboard.tsx`]: [`${PIPELINE}/components/panel.client`],
  [`${LANDING}/landing-page.tsx`]: [
    'src/episodes/components/episode-card/episode-card',
    'src/episodes/lib/probe.pure',
    `${EVENTS}/components/event-card`,
    `${PIPELINE}/lib/run-log.pure`,
    'src/explorables/probe/probe',
    'src/content-store/store',
  ],
  [`${EVENT}/event-page.tsx`]: [`${EVENTS}/components/probe-card`, `${EVENTS}/lib/probe-event.pure`],
  [`${DASHBOARD}/dashboard-page.tsx`]: [`${PIPELINE}/components/dashboard`, `${PIPELINE}/lib/run-log.pure`],
  [`${SLIDE}/slide.tsx`]: ['src/explorables/probe/probe'],
  'tools/probe/helper.ts': ['src/episodes/lib/probe.pure'],
  'skills/probe/scripts/run.ts': [`${PIPELINE}/lib/run-log.pure`, 'src/content-store/store'],
  'skills/probe/scripts/render.ts': ['src/explorables/probe/workflow.node'],
  // Breaks: each file below draws edges the rules refuse.
  [STRAY_SLIDE]: [`${EVENTS}/components/event-card`],
  [`${LANDING}/reaches-past-tiers.tsx`]: [
    'src/episodes/probe/episode',
    `${PIPELINE}/hooks/use-run`,
    `${EVENTS}/index`,
    'src/explorables/index',
  ],
  [`${DASHBOARD}/reaches-hook.tsx`]: [`${PIPELINE}/hooks/use-run`],
  [`${EVENTS}/lib/reaches-episodes.pure.ts`]: ['src/episodes/lib/probe.pure'],
  [`${EVENTS}/components/reaches-episodes.tsx`]: [
    'src/episodes/lib/registry',
    'src/episodes/components/episode-card/episode-card.pure',
    'src/episodes/lib/probe.pure',
  ],
  [`${EVENTS}/components/reaches-up.tsx`]: [`${LANDING}/landing-page`, `${EVENT}/event-page`, 'src/app/page'],
  [`${PIPELINE}/components/reaches-events.tsx`]: [`${EVENTS}/components/event-card`],
  [`${PIPELINE}/components/reaches-landing.tsx`]: [`${LANDING}/card`],
  [`${PIPELINE}/components/server-reaches-hook.tsx`]: [`${PIPELINE}/hooks/use-run`],
  [`${PIPELINE}/lib/reaches-episodes.ts`]: ['src/episodes/lib/episode.pure'],
  [`${PIPELINE}/lib/reaches-react.ts`]: ['react'],
  [`${PIPELINE}/lib/reaches-hook.ts`]: [`${PIPELINE}/hooks/use-run`],
  'src/explorables/probe/reaches-episodes.tsx': ['src/episodes/components/episode-card/episode-card'],
  'src/content-store/reaches-area.ts': [`${EVENTS}/components/event-card`, 'src/episodes/lib/probe.pure'],
  'src/shared/lib/reaches-domain.pure.ts': [
    'src/content-store/store',
    'src/content-store/schemas/fields',
    `${PIPELINE}/lib/run-log.pure`,
  ],
  'src/shared/lib/reaches-events.pure.ts': [`${EVENTS}/lib/probe-event.pure`],
  'src/shared/components/reaches-events.tsx': [`${EVENTS}/components/probe-card`],
  'src/shared/lib/reaches-skill.ts': ['skills/probe/scripts/helper'],
  'src/shared/lib/reaches-tool.ts': ['tools/probe/helper'],
  'skills/probe/scripts/reaches-past.ts': [
    `${PIPELINE}/hooks/use-run`,
    'src/content-store/schemas/fields',
    'src/shared/lib/probe.pure',
    'src/episodes/probe/episode',
    'src/explorables/probe/probe',
  ],
};

/** The content store: its entry, records, refusals and schemas, and who may read them. */
const CONTENT_STORE: Readonly<Record<string, Probe>> = {
  'node_modules/zod/index.js': [],
  'node_modules/react/index.js': [],
  'src/shared/lib/probe.pure.ts': [],
  'src/shared/components/ui/button.tsx': [],
  'src/episodes/components/slide-master/slide.ts': [],
  [`${SCHEMA}.ts`]: ['zod'],
  [`${STORE}/events/probe-event.ts`]: [],
  [`${STORE}/refusals.ts`]: ['src/shared/lib/probe.pure'],
  [`${STORE}/store.ts`]: [
    SCHEMA,
    `${STORE}/events/probe-event`,
    `${STORE}/refusals`,
    'src/episodes/probe/episode-metadata',
    'src/shared/lib/probe.pure',
  ],
  [`${STORE}/store.test.ts`]: [`${STORE}/refusals`],
  'src/episodes/probe/episode-metadata.ts': [SCHEMA, 'src/shared/lib/probe.pure'],
  [`${LANDING}/reads-store.tsx`]: [`${STORE}/store`],
  [`${LANDING}/types-from-schema.client.tsx`]: {
    source: "import type { x } from '../../content-store/schemas/episode.schema';\nexport type X = typeof x;",
  },
  'src/episodes/lib/types-from-schema.pure.ts': [SCHEMA],
  // Breaks.
  [`${STORE}/reaches-slide-master.ts`]: ['src/episodes/components/slide-master/slide'],
  [`${STORE}/reaches-ui.ts`]: ['src/shared/components/ui/button'],
  [`${STORE}/reaches-react.ts`]: ['react'],
  [`${STORE}/schemas/reaches-lib.schema.ts`]: ['src/shared/lib/probe.pure'],
  'src/episodes/stray/episode-metadata.ts': ['src/episodes/components/slide-master/slide'],
  'src/episodes/episode-repository.ts': ['src/episodes/probe/episode-metadata'],
  [`${LANDING}/reaches-metadata.tsx`]: ['src/episodes/probe/episode-metadata'],
  [`${LANDING}/reaches-refusals.tsx`]: [`${STORE}/refusals`],
  [`${LANDING}/reaches-event.tsx`]: [`${STORE}/events/probe-event`],
  [`${LANDING}/reaches-store.client.tsx`]: [`${STORE}/store`],
  'src/episodes/lib/reaches-store.pure.ts': [`${STORE}/store`],
  'src/shared/lib/types-from-schema.pure.ts': [SCHEMA],
  'src/shared/lib/reaches-store.pure.ts': [`${STORE}/store`],
  'src/shared/hooks/use-store.ts': [`${STORE}/store`],
};

/** A Slide's folder, an Event copy's Slide, a slide-shared part and the core components. */
const SLIDES: Readonly<Record<string, Probe>> = {
  'src/episodes/components/slide-master/slide.ts': [],
  'src/episodes/components/slide-shared/statement.tsx': [],
  'src/shared/components/ui/button.tsx': [],
  'src/shared/page-chrome/table-of-contents/toc.tsx': [],
  'src/shared/hooks/use-probe.ts': [],
  'src/shared/lib/probe.pure.ts': [],
  'src/episodes/probe/probe.ts': [`${SLIDE}/slide`],
  'src/episodes/probe/slides/other-slide/slide.tsx': [],
  [`${SLIDE}/part.tsx`]: [],
  [`${SLIDE}/widget.pure.ts`]: [],
  [`${SLIDE}/widget.client.tsx`]: [`${SLIDE}/widget.pure`, 'src/shared/hooks/use-probe', 'src/shared/lib/probe.pure'],
  [`${SLIDE}/slide.tsx`]: [
    `${SLIDE}/part`,
    `${SLIDE}/widget.client`,
    'src/episodes/components/slide-master/slide',
    'src/episodes/components/slide-shared/statement',
    'src/shared/components/ui/button',
    'src/shared/lib/probe.pure',
  ],
  [`${COPY}/slides/other-slide/slide.tsx`]: [],
  [`${COPY}/slides/probe-slide/own.tsx`]: [],
  [`${COPY}/slides/probe-slide/slide.tsx`]: [`${COPY}/slides/probe-slide/own`],
  [`${PART}/probe-visual.pure.ts`]: [],
  [`${PART}/probe-visual.client.tsx`]: [
    `${PART}/probe-visual.pure`,
    'src/shared/hooks/use-probe',
    'src/shared/lib/probe.pure',
  ],
  [`${PART}/probe-visual.tsx`]: [
    `${PART}/probe-visual.client`,
    `${PART}/probe-visual.pure`,
    'src/episodes/components/slide-shared/statement',
    'src/shared/components/ui/button',
  ],
  [`${CORE}/probe-core/probe-core.tsx`]: [`${CORE}/probe-sibling/probe-sibling`, 'src/shared/lib/probe.pure'],
  [`${CORE}/probe-core/probe-core.client.tsx`]: [`${CORE}/probe-sibling/probe-sibling`, 'src/shared/hooks/use-probe'],
  [`${CORE}/probe-sibling/probe-sibling.tsx`]: [],
  [`${PART}/uses-core.client.tsx`]: [`${CORE}/probe-core/probe-core`],
  [`${SLIDE}/uses-core.tsx`]: [`${CORE}/probe-core/probe-core`],
  // Breaks.
  [`${SLIDE}/reaches-other-slide.tsx`]: ['src/episodes/probe/slides/other-slide/slide'],
  [`${SLIDE}/reaches-episode.tsx`]: ['src/episodes/probe/probe'],
  [`${SLIDE}/reaches-toc.tsx`]: ['src/shared/page-chrome/table-of-contents/toc'],
  [`${SLIDE}/reaches-master.client.tsx`]: ['src/episodes/components/slide-master/slide'],
  [`${SLIDE}/reaches-core.client.tsx`]: [`${CORE}/probe-core/probe-core`],
  [`${COPY}/slides/probe-slide/copy-reaches-other-slide.tsx`]: [`${COPY}/slides/other-slide/slide`],
  [`${PART}/reaches-other-part.client.tsx`]: ['src/episodes/components/slide-shared/statement'],
  [`${PART}/reaches-ui.client.tsx`]: ['src/shared/components/ui/button'],
  [`${PART}/reaches-hook.tsx`]: ['src/shared/hooks/use-probe'],
  [`${CORE}/probe-core/reaches-part.tsx`]: ['src/episodes/components/slide-shared/statement'],
  [`${CORE}/probe-core/reaches-ui.tsx`]: ['src/shared/components/ui/button'],
};

/** The Slide pool and the Sections, Slides and Episode files around it. */
const SLIDE_POOL: Readonly<Record<string, Probe>> = {
  'src/episodes/components/slide-master/slide.ts': [],
  'src/shared/hooks/use-probe.ts': [],
  [`${POOL}/pooled/part.tsx`]: [],
  [`${POOL}/pooled/slide.tsx`]: [`${POOL}/pooled/part`, 'src/episodes/components/slide-master/slide'],
  [`${POOL}/pooled/widget.client.tsx`]: ['src/shared/hooks/use-probe'],
  [`${POOL}/other/slide.tsx`]: [],
  [`${POOL_EPISODE}/slides/opener/slide.tsx`]: [],
  [`${POOL_EPISODE}/slides/own/slide.tsx`]: [],
  [`${POOL_EPISODE}/sections/opener.ts`]: [`${POOL_EPISODE}/slides/opener/slide`, POOLED],
  [`${COPY}/sections/opener.ts`]: [POOLED],
  // Breaks.
  [`${POOL}/pooled/reaches-other-pool-slide.tsx`]: [`${POOL}/other/slide`],
  [`${POOL}/pooled/reaches-episode-slide.tsx`]: [`${POOL_EPISODE}/slides/own/slide`],
  [`${POOL}/pooled/reaches-master.client.tsx`]: ['src/episodes/components/slide-master/slide'],
  [`${POOL_EPISODE}/slides/own/reaches-pool.tsx`]: [POOLED],
  [`${POOL_EPISODE}/sections/relative.ts`]: [`${POOL}/pooled/slide`],
  [`${POOL_EPISODE}/sections/pooled.ts`]: [POOLED],
  [`${POOL_EPISODE}/episode.ts`]: [POOLED],
};

/** An Explorable explanation's folder, and who may import it. */
const EXPLANATIONS: Readonly<Record<string, Probe>> = {
  'src/episodes/components/slide-shared/statement.tsx': [],
  'src/shared/components/ui/button.tsx': [],
  'src/shared/hooks/use-probe.ts': [],
  'src/shared/lib/probe.pure.ts': [],
  [`${CORE}/probe-core/probe-core.tsx`]: [],
  'src/explorables/other-explanation/other.tsx': [],
  [`${EXPLANATION}/probe-explanation.client.tsx`]: [
    `${CORE}/probe-core/probe-core`,
    'src/shared/components/ui/button',
    'src/shared/hooks/use-probe',
  ],
  [`${EXPLANATION}/probe-explanation.tsx`]: [
    `${EXPLANATION}/probe-explanation.client`,
    `${CORE}/probe-core/probe-core`,
    'src/shared/components/ui/button',
    'src/shared/lib/probe.pure',
  ],
  [`${SLIDE}/slide.tsx`]: [`${EXPLANATION}/probe-explanation`],
  'src/page-assembly/probe-template/probe-template.tsx': [`${EXPLANATION}/probe-explanation`],
  // Breaks.
  [`${EXPLANATION}/reaches-other.client.tsx`]: ['src/explorables/other-explanation/other'],
  [`${EXPLANATION}/reaches-statement.tsx`]: ['src/episodes/components/slide-shared/statement'],
  [`${EXPLANATION}/reaches-statement.client.tsx`]: ['src/episodes/components/slide-shared/statement'],
  'src/shared/lib/reaches-explanation.pure.ts': [`${EXPLANATION}/probe-explanation`],
  'src/episodes/components/slide-shared/reaches-explanation.tsx': [`${EXPLANATION}/probe-explanation`],
};

const TSCONFIG = JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@/*': ['./src/*'] } } });

let root = '';
let output: IReporterOutput;

/** Every violation as `<rule>: <from> -> <to>`, sorted. */
function violations(): string[] {
  if (typeof output.output === 'string') throw new Error('dependency-cruiser returned a report, not a result.');
  return output.output.summary.violations.map(({ rule, from, to }) => `${rule.name}: ${from} -> ${to}`).sort();
}

/** The violations drawn from any of the given probe files. */
function from(files: readonly string[]): string[] {
  return violations().filter((line) => files.some((file) => line.includes(`: ${file} ->`)));
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'import-rules-'));
  const files = { ...tree([AREAS, CONTENT_STORE, SLIDES, SLIDE_POOL, EXPLANATIONS]), 'tsconfig.json': TSCONFIG };
  for (const [file, source] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), source);
  }
  const cwd = process.cwd();
  process.chdir(root);
  try {
    output = await cruise(
      ['src', 'skills', 'tools'],
      {
        validate: true,
        ruleSet: { forbidden: config.forbidden },
        tsPreCompilationDeps: true,
        tsConfig: { fileName: 'tsconfig.json' },
      },
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
  it("lets page assembly reach each area through its tier folders, a Slide show an explanation, the store read Episode metadata, and skills and tools reach an area lib, the store entry or an explanation's node entry", () => {
    // ARRANGE
    const legal = [
      `${LANDING}/landing-page.tsx`,
      `${SLIDE}/slide.tsx`,
      `${EVENTS}/components/event-card.tsx`,
      `${STORE}/store.ts`,
      'tools/probe/helper.ts',
      'skills/probe/scripts/run.ts',
      'skills/probe/scripts/render.ts',
    ];
    // ACT
    const found = from(legal);
    // ASSERT
    expect(found).toEqual([]);
  });

  it('lets an area reach itself, the shared tiers and the content store, its client leaf reach hooks, and its template reach its components and lib', () => {
    // ARRANGE
    const legal = [
      `${EVENTS}/lib/probe-event.pure.ts`,
      `${EVENTS}/components/probe-card.tsx`,
      `${EVENTS}/components/probe-card.client.tsx`,
      `${EVENT}/event-page.tsx`,
      `${PIPELINE}/lib/run-log.pure.ts`,
      `${PIPELINE}/hooks/use-run.ts`,
      `${PIPELINE}/components/panel.client.tsx`,
      `${PIPELINE}/components/dashboard.tsx`,
      `${DASHBOARD}/dashboard-page.tsx`,
    ];
    // ACT
    const found = from(legal);
    // ASSERT
    expect(found).toEqual([]);
  });

  it("lets the store read its schemas, records, refusals, Episode metadata and lib, a page read the store's entry, and an Episode's metadata import its schema and lib", () => {
    // ARRANGE
    const legal = [
      `${STORE}/store.ts`,
      `${STORE}/refusals.ts`,
      `${SCHEMA}.ts`,
      `${LANDING}/reads-store.tsx`,
      'src/episodes/probe/episode-metadata.ts',
    ];
    // ACT
    const found = from(legal);
    // ASSERT
    expect(found).toEqual([]);
  });

  it("lets a product area's lib read record types from a schema, and a client leaf import one as a type only", () => {
    // ARRANGE
    const legal = ['src/episodes/lib/types-from-schema.pure.ts', `${LANDING}/types-from-schema.client.tsx`];
    // ACT
    const found = from(legal);
    // ASSERT
    expect(found).toEqual([]);
  });

  it("lets a Slide's server entry import its own files and every global shared location, an Event copy's Slide its own files, and its client widget its own pure logic, hooks and lib", () => {
    // ARRANGE
    const legal = [`${SLIDE}/slide.tsx`, `${COPY}/slides/probe-slide/slide.tsx`, `${SLIDE}/widget.client.tsx`];
    // ACT
    const found = from(legal);
    // ASSERT
    expect(found).toEqual([]);
  });

  it('lets a slide-shared part render its own client leaf, and the leaf import its own pure logic, hooks and lib', () => {
    // ARRANGE
    const legal = [`${PART}/probe-visual.tsx`, `${PART}/probe-visual.client.tsx`];
    // ACT
    const found = from(legal);
    // ASSERT
    expect(found).toEqual([]);
  });

  it('lets a slide-shared client leaf, a Slide server file and a core file reach core, hooks and lib', () => {
    // ARRANGE
    const legal = [
      `${PART}/uses-core.client.tsx`,
      `${SLIDE}/uses-core.tsx`,
      `${CORE}/probe-core/probe-core.tsx`,
      `${CORE}/probe-core/probe-core.client.tsx`,
    ];
    // ACT
    const found = from(legal);
    // ASSERT
    expect(found).toEqual([]);
  });

  it('lets a Section import a pool Slide through the alias, from an Episode and from an Event copy alike, a pool Slide import its own files and the Slide master, and its client widget reach hooks', () => {
    // ARRANGE
    const legal = [
      `${POOL_EPISODE}/sections/opener.ts`,
      `${COPY}/sections/opener.ts`,
      `${POOL}/pooled/slide.tsx`,
      `${POOL}/pooled/widget.client.tsx`,
    ];
    // ACT
    const found = from(legal);
    // ASSERT
    expect(found).toEqual([]);
  });

  it('lets an explanation and its client leaf reach the plain shared parts they are allowed to, and a Slide or a page template import an explanation', () => {
    // ARRANGE
    const legal = [
      `${EXPLANATION}/probe-explanation.tsx`,
      `${EXPLANATION}/probe-explanation.client.tsx`,
      `${SLIDE}/slide.tsx`,
      'src/page-assembly/probe-template/probe-template.tsx',
    ];
    // ACT
    const found = from(legal);
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects a Slide importing any area but the Explorable explanations, through its own folder rule', () => {
    // ARRANGE
    const expected = [
      `slide-folder-reaches-only-own-and-shared: ${STRAY_SLIDE} -> ${EVENTS}/components/event-card.tsx`,
    ];
    // ACT
    const found = from([STRAY_SLIDE]);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('rejects an upward edge, one area importing another, page assembly reaching past tier folders, a lib reaching React or a hook, a hook reached from a server file, shared reading the domain, the store reaching an area, and src/ and skills/ or tools/ meeting anywhere else', () => {
    // ARRANGE
    const expected = [
      `areas-never-import-each-other: ${EVENTS}/components/reaches-episodes.tsx -> src/episodes/components/episode-card/episode-card.pure.ts`,
      `areas-never-import-each-other: ${EVENTS}/components/reaches-episodes.tsx -> src/episodes/lib/probe.pure.ts`,
      `areas-never-import-each-other: ${EVENTS}/components/reaches-episodes.tsx -> src/episodes/lib/registry.ts`,
      `areas-never-import-each-other: ${EVENTS}/lib/reaches-episodes.pure.ts -> src/episodes/lib/probe.pure.ts`,
      'areas-never-import-each-other: src/explorables/probe/reaches-episodes.tsx -> src/episodes/components/episode-card/episode-card.tsx',
      `areas-never-import-each-other: ${PIPELINE}/components/reaches-events.tsx -> ${EVENTS}/components/event-card.tsx`,
      `areas-never-import-each-other: ${PIPELINE}/lib/reaches-episodes.ts -> src/episodes/lib/episode.pure.ts`,
      'content-store-tier: src/content-store/reaches-area.ts -> src/episodes/lib/probe.pure.ts',
      `content-store-tier: src/content-store/reaches-area.ts -> ${EVENTS}/components/event-card.tsx`,
      'explorable-explanation-reaches-shared-ui-and-lib: src/explorables/probe/reaches-episodes.tsx -> src/episodes/components/episode-card/episode-card.tsx',
      `hooks-reached-only-from-client: skills/probe/scripts/reaches-past.ts -> ${PIPELINE}/hooks/use-run.ts`,
      `hooks-reached-only-from-client: ${DASHBOARD}/reaches-hook.tsx -> ${PIPELINE}/hooks/use-run.ts`,
      `hooks-reached-only-from-client: ${LANDING}/reaches-past-tiers.tsx -> ${PIPELINE}/hooks/use-run.ts`,
      `hooks-reached-only-from-client: ${PIPELINE}/components/server-reaches-hook.tsx -> ${PIPELINE}/hooks/use-run.ts`,
      `hooks-reached-only-from-client: ${PIPELINE}/lib/reaches-hook.ts -> ${PIPELINE}/hooks/use-run.ts`,
      `layers-never-import-app: ${EVENTS}/components/reaches-up.tsx -> src/app/page.tsx`,
      `lib-imports-no-react: ${PIPELINE}/lib/reaches-react.ts -> node_modules/react/index.js`,
      `lib-imports-no-upper-tier: ${PIPELINE}/lib/reaches-hook.ts -> ${PIPELINE}/hooks/use-run.ts`,
      'lib-imports-no-upper-tier: src/shared/lib/reaches-domain.pure.ts -> src/content-store/store.ts',
      `page-assembly-reached-only-from-app: ${EVENTS}/components/reaches-up.tsx -> ${EVENT}/event-page.tsx`,
      `page-assembly-reached-only-from-app: ${EVENTS}/components/reaches-up.tsx -> ${LANDING}/landing-page.tsx`,
      `page-assembly-reached-only-from-app: ${PIPELINE}/components/reaches-landing.tsx -> ${LANDING}/card.tsx`,
      `page-assembly-reaches-areas-through-tier-folders: ${DASHBOARD}/reaches-hook.tsx -> ${PIPELINE}/hooks/use-run.ts`,
      `page-assembly-reaches-areas-through-tier-folders: ${LANDING}/reaches-past-tiers.tsx -> src/episodes/probe/episode.ts`,
      `page-assembly-reaches-areas-through-tier-folders: ${LANDING}/reaches-past-tiers.tsx -> ${EVENTS}/index.ts`,
      `page-assembly-reaches-areas-through-tier-folders: ${LANDING}/reaches-past-tiers.tsx -> src/explorables/index.ts`,
      `page-assembly-reaches-areas-through-tier-folders: ${LANDING}/reaches-past-tiers.tsx -> ${PIPELINE}/hooks/use-run.ts`,
      `shared-knows-no-domain: src/shared/components/reaches-events.tsx -> ${EVENTS}/components/probe-card.tsx`,
      'shared-knows-no-domain: src/shared/lib/reaches-domain.pure.ts -> src/content-store/schemas/fields.ts',
      'shared-knows-no-domain: src/shared/lib/reaches-domain.pure.ts -> src/content-store/store.ts',
      `shared-knows-no-domain: src/shared/lib/reaches-domain.pure.ts -> ${PIPELINE}/lib/run-log.pure.ts`,
      `shared-knows-no-domain: src/shared/lib/reaches-events.pure.ts -> ${EVENTS}/lib/probe-event.pure.ts`,
      'skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> src/content-store/schemas/fields.ts',
      'skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> src/episodes/probe/episode.ts',
      'skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> src/explorables/probe/probe.tsx',
      `skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> ${PIPELINE}/hooks/use-run.ts`,
      'skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> src/shared/lib/probe.pure.ts',
      `slide-folder-reaches-only-own-and-shared: ${STRAY_SLIDE} -> ${EVENTS}/components/event-card.tsx`,
      'src-never-imports-skills-or-tools: src/shared/lib/reaches-skill.ts -> skills/probe/scripts/helper.ts',
      'src-never-imports-skills-or-tools: src/shared/lib/reaches-tool.ts -> tools/probe/helper.ts',
    ];
    // ACT
    const found = from(Object.keys(AREAS));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('rejects every reader that bypasses the store entry, the old Episode repository included, a store that reaches components or React, a lower tier reaching the store, shared code reaching the domain, a client leaf importing it at runtime, a schema leaving its leaf, and Episode metadata reaching above lib', () => {
    // ARRANGE
    const expected = [
      `client-never-imports-content-store: ${LANDING}/reaches-store.client.tsx -> ${STORE}/store.ts`,
      `content-store-tier: ${STORE}/reaches-react.ts -> node_modules/react/index.js`,
      `content-store-tier: ${STORE}/reaches-slide-master.ts -> src/episodes/components/slide-master/slide.ts`,
      `content-store-tier: ${STORE}/reaches-ui.ts -> src/shared/components/ui/button.tsx`,
      'episode-metadata-reaches-only-schemas-and-lib: src/episodes/stray/episode-metadata.ts -> src/episodes/components/slide-master/slide.ts',
      `hooks-import-no-upper-tier: src/shared/hooks/use-store.ts -> ${STORE}/store.ts`,
      `lib-imports-no-upper-tier: src/episodes/lib/reaches-store.pure.ts -> ${STORE}/store.ts`,
      `lib-imports-no-upper-tier: src/shared/lib/reaches-store.pure.ts -> ${STORE}/store.ts`,
      `page-assembly-reaches-areas-through-tier-folders: ${LANDING}/reaches-metadata.tsx -> src/episodes/probe/episode-metadata.ts`,
      'records-read-only-through-store: src/episodes/episode-repository.ts -> src/episodes/probe/episode-metadata.ts',
      `records-read-only-through-store: ${LANDING}/reaches-event.tsx -> ${STORE}/events/probe-event.ts`,
      `records-read-only-through-store: ${LANDING}/reaches-metadata.tsx -> src/episodes/probe/episode-metadata.ts`,
      `schemas-are-a-leaf: ${STORE}/schemas/reaches-lib.schema.ts -> src/shared/lib/probe.pure.ts`,
      `shared-knows-no-domain: src/shared/hooks/use-store.ts -> ${STORE}/store.ts`,
      `shared-knows-no-domain: src/shared/lib/reaches-store.pure.ts -> ${STORE}/store.ts`,
      `shared-knows-no-domain: src/shared/lib/types-from-schema.pure.ts -> ${SCHEMA}.ts`,
      `store-entry-only: ${LANDING}/reaches-event.tsx -> ${STORE}/events/probe-event.ts`,
      `store-entry-only: ${LANDING}/reaches-refusals.tsx -> ${STORE}/refusals.ts`,
    ];
    // ACT
    const found = from(Object.keys(CONTENT_STORE));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it("rejects a Slide importing another Slide (an Event copy's too), the Episode file or a non-shared component, a client widget reaching the Slide master, a slide-shared client leaf leaving its part, and a slide-shared server part reaching a hook", () => {
    // ARRANGE
    const expected = [
      `core-components-are-a-leaf: ${CORE}/probe-core/reaches-part.tsx -> src/episodes/components/slide-shared/statement.tsx`,
      `core-components-are-a-leaf: ${CORE}/probe-core/reaches-ui.tsx -> src/shared/components/ui/button.tsx`,
      `hooks-reached-only-from-client: ${PART}/reaches-hook.tsx -> src/shared/hooks/use-probe.ts`,
      `page-chrome-reached-only-from-page-assembly-or-container: ${SLIDE}/reaches-toc.tsx -> src/shared/page-chrome/table-of-contents/toc.tsx`,
      `shared-knows-no-domain: ${CORE}/probe-core/reaches-part.tsx -> src/episodes/components/slide-shared/statement.tsx`,
      `slide-client-reaches-only-hooks-and-lib: ${SLIDE}/reaches-core.client.tsx -> ${CORE}/probe-core/probe-core.tsx`,
      `slide-client-reaches-only-hooks-and-lib: ${SLIDE}/reaches-master.client.tsx -> src/episodes/components/slide-master/slide.ts`,
      `slide-folder-reaches-only-own-and-shared: ${COPY}/slides/probe-slide/copy-reaches-other-slide.tsx -> ${COPY}/slides/other-slide/slide.tsx`,
      `slide-folder-reaches-only-own-and-shared: ${SLIDE}/reaches-episode.tsx -> src/episodes/probe/probe.ts`,
      `slide-folder-reaches-only-own-and-shared: ${SLIDE}/reaches-other-slide.tsx -> src/episodes/probe/slides/other-slide/slide.tsx`,
      `slide-folder-reaches-only-own-and-shared: ${SLIDE}/reaches-toc.tsx -> src/shared/page-chrome/table-of-contents/toc.tsx`,
      `slide-shared-client-reaches-only-own-part-hooks-and-lib: ${PART}/reaches-other-part.client.tsx -> src/episodes/components/slide-shared/statement.tsx`,
      `slide-shared-client-reaches-only-own-part-hooks-and-lib: ${PART}/reaches-ui.client.tsx -> src/shared/components/ui/button.tsx`,
      `slide-shared-reaches-only-ui-and-lib: ${PART}/reaches-hook.tsx -> src/shared/hooks/use-probe.ts`,
      `toc-reached-only-from-container: ${SLIDE}/reaches-toc.tsx -> src/shared/page-chrome/table-of-contents/toc.tsx`,
    ];
    // ACT
    const found = from(Object.keys(SLIDES));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('refuses a pool Slide as a Title slide or a section slide, reached by a relative path, or from another Slide', () => {
    // ARRANGE
    const pooled = `${POOL}/pooled/slide.tsx`;
    const expected = [
      `section-reaches-pool-by-alias: ${POOL_EPISODE}/sections/relative.ts -> ${pooled}`,
      `section-slide-never-from-pool: ${POOL_EPISODE}/sections/pooled.ts -> ${pooled}`,
      `slide-client-reaches-only-hooks-and-lib: ${POOL}/pooled/reaches-master.client.tsx -> src/episodes/components/slide-master/slide.ts`,
      `slide-folder-reaches-only-own-and-shared: ${POOL_EPISODE}/slides/own/reaches-pool.tsx -> ${pooled}`,
      `slide-folder-reaches-only-own-and-shared: ${POOL}/pooled/reaches-episode-slide.tsx -> ${POOL_EPISODE}/slides/own/slide.tsx`,
      `slide-folder-reaches-only-own-and-shared: ${POOL}/pooled/reaches-other-pool-slide.tsx -> ${POOL}/other/slide.tsx`,
      `slide-pool-reached-only-from-sections: ${POOL_EPISODE}/episode.ts -> ${pooled}`,
      `slide-pool-reached-only-from-sections: ${POOL_EPISODE}/slides/own/reaches-pool.tsx -> ${pooled}`,
    ];
    // ACT
    const found = from(Object.keys(SLIDE_POOL));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('rejects an explanation reaching a slide-shared part (another product area), a client leaf leaving its explanation for another or a plain shared part, and a shared part or lib module importing an explanation', () => {
    // ARRANGE
    const statement = 'src/episodes/components/slide-shared/statement.tsx';
    const explanation = `${EXPLANATION}/probe-explanation.tsx`;
    const expected = [
      `areas-never-import-each-other: src/episodes/components/slide-shared/reaches-explanation.tsx -> ${explanation}`,
      `areas-never-import-each-other: ${EXPLANATION}/reaches-statement.client.tsx -> ${statement}`,
      `areas-never-import-each-other: ${EXPLANATION}/reaches-statement.tsx -> ${statement}`,
      `explorable-explanation-client-reaches-only-own-folder-core-ui-hooks-and-lib: ${EXPLANATION}/reaches-other.client.tsx -> src/explorables/other-explanation/other.tsx`,
      `explorable-explanation-client-reaches-only-own-folder-core-ui-hooks-and-lib: ${EXPLANATION}/reaches-statement.client.tsx -> ${statement}`,
      `explorable-explanation-reaches-shared-ui-and-lib: ${EXPLANATION}/reaches-statement.tsx -> ${statement}`,
      `shared-knows-no-domain: src/shared/lib/reaches-explanation.pure.ts -> ${explanation}`,
      `slide-shared-reaches-only-ui-and-lib: src/episodes/components/slide-shared/reaches-explanation.tsx -> ${explanation}`,
    ];
    // ACT
    const found = from(Object.keys(EXPLANATIONS));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('fires every rule it pins on a probe, and no other, so no rule here passes for want of a violation', () => {
    // ARRANGE
    const expected = [...PINNED].sort();
    // ACT
    const fired = [...new Set(violations().map((line) => line.slice(0, line.indexOf(':'))))].sort();
    // ASSERT
    expect(fired).toEqual(expected);
  });
});

describe('edge cases', () => {
  it("lets a test reach the store's internals", () => {
    // ARRANGE
    const file = `${STORE}/store.test.ts`;
    // ACT
    const found = from([file]);
    // ASSERT
    expect(found).toEqual([]);
  });

  it('resolves the alias in the probe tree, so the by-alias rule is not passing over unresolved imports', () => {
    // ARRANGE
    const resolved = `${POOL}/pooled/slide.tsx`;
    // ACT
    const targets =
      typeof output.output === 'string'
        ? []
        : output.output.modules
            .filter(({ source }) => source === `${POOL_EPISODE}/episode.ts`)
            .flatMap(({ dependencies }) => dependencies.map(({ resolved: to }) => to));
    // ASSERT
    expect(targets).toEqual([resolved]);
  });

  it('keeps the old-repository exception out of records-read-only-through-store, now that the store entry reads every record', () => {
    // ARRANGE
    const exception = 'episode-repository';
    // ACT
    const rules = readFileSync('.dependency-cruiser.cjs', 'utf8');
    // ASSERT
    expect(
      rules,
      'delete the episode-repository exception from records-read-only-through-store (FE-013).',
    ).not.toContain(exception);
  });

  it('points every area rule at the record that explains it: FE-006 for the client boundary, FE-007 for the rest', () => {
    // ARRANGE
    const records = /\bFE-00[67]\b/;
    // ACT
    const silent = config.forbidden
      .filter(({ name, comment }) => AREA_RULES.includes(name) && !records.test(comment))
      .map(({ name }) => name);
    // ASSERT
    expect(silent).toEqual([]);
  });

  it('names the fix in the skills-and-tools rule, so a violation can be fixed without the ADR', () => {
    // ARRANGE
    const fix = 'Move the module into its area under src/';
    // ACT
    const comment = config.forbidden.find(({ name }) => name === 'src-never-imports-skills-or-tools')?.comment;
    // ASSERT
    expect(comment).toContain(fix);
  });

  it('names every allowed location in the Slide-folder rule message, so a violation can be fixed without the ADR', () => {
    // ARRANGE
    const expected = [
      'src/episodes/components/slide-master/',
      'src/episodes/components/slide-shared/',
      'src/shared/components/ui/',
      'src/shared/hooks/',
      'src/shared/lib/',
      'src/episodes/hooks/',
      'src/episodes/lib/',
    ];
    // ACT
    const comment = config.forbidden.find(({ name }) => name === 'slide-folder-reaches-only-own-and-shared')?.comment;
    const named = expected.filter((location) => comment?.includes(location));
    // ASSERT
    expect(named).toEqual(expected);
  });
});
