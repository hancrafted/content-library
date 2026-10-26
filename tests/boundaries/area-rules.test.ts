// Pins the area rules (spec #348, #354, #358, FE-007 §2 and §3, FE-006 §3.1): layers import only downward, product
// areas never import each other but for a Slide showing an Explorable explanation, page assembly reaches an area only
// through its tier folders, an area's lib/ imports no React and no upper tier, its hooks/ are reached only from a
// client leaf, shared knows no domain, the store's one upward edge is Episode metadata, and `src/` and
// `skills/`/`tools/` meet only through an area's `lib/` or the store's entry. Every area's probes, Events and pipeline
// included, sit in one throwaway tree and the rules run over it in one cruise, as `npm run lint:boundaries` runs them
// over `src/`, `skills/` and `tools/`, so a rule that stopped firing, or started firing on a legal import, fails here.

import { cruise, type IForbiddenRuleType, type IReporterOutput } from 'dependency-cruiser';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, posix } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const config = createRequire(import.meta.url)('../../.dependency-cruiser.cjs') as {
  forbidden: (IForbiddenRuleType & { name: string })[];
};
const RULES = [
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
const RULE_SET = { forbidden: config.forbidden.filter(({ name }) => RULES.includes(name)) };

/** A module importing each target, given as a repo-root path without its extension, or a bare package name. */
function importing(from: string, targets: readonly string[]): string {
  const lines = targets.map((target, i) => {
    if (!target.includes('/')) return `import * as m${i} from '${target}';`;
    const relative = posix.relative(posix.dirname(from), target);
    return `import * as m${i} from '${relative.startsWith('.') ? relative : `./${relative}`}';`;
  });
  return [...lines, `export const x = [${targets.map((_, i) => `m${i}`).join(', ')}];`].join('\n');
}

/** Each probe file and the targets it imports; a file with none is a leaf. */
function probes(edges: Readonly<Record<string, readonly string[]>>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(edges).map(([file, targets]) => [
      file,
      targets.length === 0 ? 'export const leaf = 1;' : importing(file, targets),
    ]),
  );
}

const SLIDE = 'src/episodes/probe/slides/probe-slide/slide.tsx';
const STRAY_SLIDE = 'src/episodes/probe/slides/stray-slide/slide.tsx';
const LANDING = 'src/page-assembly/landing';
const EVENT = 'src/page-assembly/event';
const DASHBOARD = 'src/page-assembly/dashboard';
const EVENTS = 'src/events';
const PIPELINE = 'src/pipeline';

/** Each probe file and what it imports, relative to the probe tree's root. */
const PROBES = probes({
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
  'src/explorable-explanations/index.ts': [],
  'src/explorable-explanations/probe/probe.tsx': [],
  'src/page-assembly/landing/card.tsx': [],
  'skills/probe/scripts/helper.ts': [],
  // Legal: each file below draws only edges the rules allow.
  'src/content-store/store.ts': [
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
    'src/explorable-explanations/probe/probe',
    'src/content-store/store',
  ],
  [`${EVENT}/event-page.tsx`]: [`${EVENTS}/components/probe-card`, `${EVENTS}/lib/probe-event.pure`],
  [`${DASHBOARD}/dashboard-page.tsx`]: [`${PIPELINE}/components/dashboard`, `${PIPELINE}/lib/run-log.pure`],
  [SLIDE]: ['src/explorable-explanations/probe/probe'],
  'tools/probe/helper.ts': ['src/episodes/lib/probe.pure'],
  'skills/probe/scripts/run.ts': [`${PIPELINE}/lib/run-log.pure`, 'src/content-store/store'],
  // Breaks: each file below draws edges the rules refuse.
  [STRAY_SLIDE]: [`${EVENTS}/components/event-card`],
  [`${LANDING}/reaches-past-tiers.tsx`]: [
    'src/episodes/probe/episode',
    `${PIPELINE}/hooks/use-run`,
    `${EVENTS}/index`,
    'src/explorable-explanations/index',
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
  'src/explorable-explanations/probe/reaches-episodes.tsx': ['src/episodes/components/episode-card/episode-card'],
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
  ],
});

let root = '';
let output: IReporterOutput;

/** Every violation as `<rule>: <from> -> <to>`, sorted. */
function violations(): string[] {
  if (typeof output.output === 'string') throw new Error('dependency-cruiser returned a report, not a result.');
  return output.output.summary.violations.map(({ rule, from, to }) => `${rule.name}: ${from} -> ${to}`).sort();
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'area-rules-'));
  for (const [file, source] of Object.entries(PROBES)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), source);
  }
  const cwd = process.cwd();
  process.chdir(root);
  try {
    output = await cruise(['src', 'skills', 'tools'], {
      validate: true,
      ruleSet: RULE_SET,
      tsPreCompilationDeps: true,
    });
  } finally {
    process.chdir(cwd);
  }
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('success cases', () => {
  it('lets page assembly reach each area through its tier folders, a Slide show an explanation, the store read Episode metadata, and skills and tools reach an area lib or the store entry', () => {
    // ARRANGE
    const legal = [
      `${LANDING}/landing-page.tsx`,
      SLIDE,
      `${EVENTS}/components/event-card.tsx`,
      'src/content-store/store.ts',
      'tools/probe/helper.ts',
      'skills/probe/scripts/run.ts',
    ];
    // ACT
    const found = violations().filter((line) => legal.some((file) => line.includes(`: ${file} ->`)));
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
    const found = violations().filter((line) => legal.some((file) => line.includes(`: ${file} ->`)));
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
    const found = violations().filter((line) => line.includes(`: ${STRAY_SLIDE} ->`));
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
      'areas-never-import-each-other: src/explorable-explanations/probe/reaches-episodes.tsx -> src/episodes/components/episode-card/episode-card.tsx',
      `areas-never-import-each-other: ${PIPELINE}/components/reaches-events.tsx -> ${EVENTS}/components/event-card.tsx`,
      `areas-never-import-each-other: ${PIPELINE}/lib/reaches-episodes.ts -> src/episodes/lib/episode.pure.ts`,
      'content-store-tier: src/content-store/reaches-area.ts -> src/episodes/lib/probe.pure.ts',
      `content-store-tier: src/content-store/reaches-area.ts -> ${EVENTS}/components/event-card.tsx`,
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
      `page-assembly-reaches-areas-through-tier-folders: ${LANDING}/reaches-past-tiers.tsx -> src/explorable-explanations/index.ts`,
      `page-assembly-reaches-areas-through-tier-folders: ${LANDING}/reaches-past-tiers.tsx -> ${PIPELINE}/hooks/use-run.ts`,
      `shared-knows-no-domain: src/shared/components/reaches-events.tsx -> ${EVENTS}/components/probe-card.tsx`,
      'shared-knows-no-domain: src/shared/lib/reaches-domain.pure.ts -> src/content-store/schemas/fields.ts',
      'shared-knows-no-domain: src/shared/lib/reaches-domain.pure.ts -> src/content-store/store.ts',
      `shared-knows-no-domain: src/shared/lib/reaches-domain.pure.ts -> ${PIPELINE}/lib/run-log.pure.ts`,
      `shared-knows-no-domain: src/shared/lib/reaches-events.pure.ts -> ${EVENTS}/lib/probe-event.pure.ts`,
      'skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> src/content-store/schemas/fields.ts',
      'skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> src/episodes/probe/episode.ts',
      `skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> ${PIPELINE}/hooks/use-run.ts`,
      'skills-and-tools-reach-src-through-area-lib-or-store-entry: skills/probe/scripts/reaches-past.ts -> src/shared/lib/probe.pure.ts',
      `slide-folder-reaches-only-own-and-shared: ${STRAY_SLIDE} -> ${EVENTS}/components/event-card.tsx`,
      'src-never-imports-skills-or-tools: src/shared/lib/reaches-skill.ts -> skills/probe/scripts/helper.ts',
      'src-never-imports-skills-or-tools: src/shared/lib/reaches-tool.ts -> tools/probe/helper.ts',
    ];
    // ACT
    const found = violations();
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('fires every rule it runs on a probe, so no rule here passes for want of a violation', () => {
    // ARRANGE
    const expected = [...RULES].sort();
    // ACT
    const fired = [...new Set(violations().map((line) => line.slice(0, line.indexOf(':'))))].sort();
    // ASSERT
    expect(fired).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('points every rule at the record that explains it: FE-006 for the client boundary, FE-007 for the rest', () => {
    // ARRANGE
    const records = /\bFE-00[67]\b/;
    // ACT
    const silent = RULE_SET.forbidden.filter(({ comment }) => !records.test(comment ?? '')).map(({ name }) => name);
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
});
