import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { lintProbes, type ProbeDiagnostic } from './lint-probe';

// decision: FE-011 §4
const ROOT = path.join(__dirname, '../..');
const LEGACY: string[] = JSON.parse(
  readFileSync(path.join(ROOT, 'src/shared/design-system/legacy.json'), 'utf8'),
).globs;

const SLIDE_FOLDER = 'src/episodes/templates/timelines/slides/probe';
const HERO_TITLE = 'src/episodes/components/slide-master/slide-master.tsx';
const CITATION = 'src/shared/page-chrome/context-drawer/slide-notes.tsx';
const INLINE_CODE = 'src/episodes/components/slide-master/rich-tags.tsx';
const TIMEOUT = 30_000;

const E1 = 'better-tailwindcss/no-unknown-classes';
const E2 = 'better-tailwindcss/no-restricted-classes';

const RESTRICTED: [name: string, classes: string][] = [
  ['a palette colour', 'text-red-500'],
  ['plain black', 'bg-black'],
  ['an arbitrary hex colour', 'bg-[#ff0000]'],
  ['an arbitrary oklch colour', 'text-[oklch(0.6_0.1_200)]'],
  ['a fourth size', 'text-sm'],
  ['an arbitrary size', 'text-[13px]'],
  ['a breakpoint prefix on a size', 'md:text-heading'],
  ['a weight outside normal, medium and semibold', 'font-bold'],
];
const SLIDE_TOKEN_FORMS = [
  'bg-(--loop-edge)',
  'text-(--loop-edge)',
  'bg-[color-mix(in_oklch,var(--lane)_38%,transparent)]',
];

const AT_SLIDE: Record<string, string> = {
  phantom: 'p-4 btn-phantom',
  registered: 'flex bg-primary text-muted-foreground text-heading font-semibold bg-(--loop-edge)',
  ...Object.fromEntries(RESTRICTED.map(([, classes]) => [`restricted ${classes}`, classes])),
  ...Object.fromEntries(SLIDE_TOKEN_FORMS.map((classes) => [`slide token ${classes}`, classes])),
  'citation marker elsewhere': 'text-[0.7em]',
  'inline code elsewhere': 'text-[0.9em]',
  'hero elsewhere': 'text-hero',
};

const IN_LEGACY: Record<string, string> = {
  'legacy phantom': 'btn-phantom',
  'legacy exempt': 'text-sm text-red-500 font-bold',
  'legacy hero': 'text-hero',
};
const legacyProbe = (glob: string, n: number) => `${glob.replace(/\*+$/, '')}probe-${n}.tsx`;

interface ProbeEntry {
  virtualPath: string;
  classes: string;
}

const PROBES: Record<string, ProbeEntry> = {
  ...Object.fromEntries(
    Object.entries(AT_SLIDE).map(([key, classes], i) => [
      key,
      { virtualPath: `${SLIDE_FOLDER}/slide-${i + 1}.tsx`, classes },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(IN_LEGACY).flatMap(([kind, classes], i) =>
      LEGACY.map((glob) => [`${kind} ${glob}`, { virtualPath: legacyProbe(glob, i + 1), classes }]),
    ),
  ),
  'citation marker in its file': { virtualPath: CITATION, classes: 'text-[0.7em]' },
  'inline code in its file': { virtualPath: INLINE_CODE, classes: 'text-[0.9em]' },
  'hero in its file': { virtualPath: HERO_TITLE, classes: 'font-semibold text-hero' },
};

const SECOND_RUN_SWAPPED_EXACT_PATH_PROBES: Record<string, ProbeEntry> = {
  'citation file swapped': { virtualPath: CITATION, classes: 'text-[0.9em]' },
  'inline code file swapped': { virtualPath: INLINE_CODE, classes: 'text-[0.7em]' },
};

const markup = (classes: string) => `export const Probe = () => <div className="${classes}" />;\n`;

const tailwindRules = (diagnostics: ProbeDiagnostic[]): string[] =>
  diagnostics.filter((d) => d.ruleId.startsWith('better-tailwindcss/')).map((d) => d.ruleId);

async function lintTable(table: Record<string, ProbeEntry>): Promise<[key: string, rules: string[]][]> {
  const entries = Object.entries(table);
  const results = await lintProbes(
    entries.map(([, { virtualPath, classes }]) => ({ source: markup(classes), virtualPath })),
  );
  return entries.map(([key], i) => [key, tailwindRules(results[i])]);
}

const broken = new Map<string, string[]>();

beforeAll(async () => {
  const runs = await Promise.all([lintTable(PROBES), lintTable(SECOND_RUN_SWAPPED_EXACT_PATH_PROBES)]);
  for (const [key, rules] of runs.flat()) broken.set(key, rules);
}, TIMEOUT);

function rulesOf(key: string): string[] {
  const rules = broken.get(key);
  if (!rules) throw new Error(`no probe named ${key}`);
  return rules;
}

describe('E1 no-unregistered-classes', () => {
  it('fails a phantom class', () => {
    // ARRANGE
    const expected = [E1];
    // ACT
    const rules = rulesOf('phantom');
    // ASSERT
    expect(rules).toEqual(expected);
  });

  it.each(LEGACY)('fails a phantom class in the legacy file set %s too', (glob) => {
    // ARRANGE
    const expected = [E1];
    // ACT
    const rules = rulesOf(`legacy phantom ${glob}`);
    // ASSERT
    expect(rules).toEqual(expected);
  });

  it('passes registered utilities, token utilities and the slide-token shorthand', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const rules = rulesOf('registered');
    // ASSERT
    expect(rules).toEqual(expected);
  });
});

describe('E2 no-restricted-classes', () => {
  it.each(RESTRICTED)('fails %s outside the legacy list', (_name, classes) => {
    // ARRANGE
    const expected = [E2];
    // ACT
    const rules = rulesOf(`restricted ${classes}`);
    // ASSERT
    expect(rules).toEqual(expected);
  });

  it.each(SLIDE_TOKEN_FORMS)('allows the slide-token form %s', (classes) => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const rules = rulesOf(`slide token ${classes}`);
    // ASSERT
    expect(rules).toEqual(expected);
  });

  it.each(LEGACY)('exempts every file under the legacy entry %s', (glob) => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const rules = rulesOf(`legacy exempt ${glob}`);
    // ASSERT
    expect(rules).toEqual(expected);
  });

  it('allows the citation marker size in its one file only', () => {
    // ARRANGE
    const expected = [[], [E2]];
    // ACT
    const [inFile, elsewhere] = [rulesOf('citation marker in its file'), rulesOf('citation marker elsewhere')];
    // ASSERT
    expect([inFile, elsewhere]).toEqual(expected);
  });

  it('allows the inline code size in its one file only', () => {
    // ARRANGE
    const expected = [[], [E2]];
    // ACT
    const [inFile, elsewhere] = [rulesOf('inline code in its file'), rulesOf('inline code elsewhere')];
    // ASSERT
    expect([inFile, elsewhere]).toEqual(expected);
  });

  it('refuses the other relative size in each exempt file', () => {
    // ARRANGE
    const expected = [[E2], [E2]];
    // ACT
    const rules = [rulesOf('citation file swapped'), rulesOf('inline code file swapped')];
    // ASSERT
    expect(rules).toEqual(expected);
  });
});

describe('E3 text-hero only in HeroTitle', () => {
  it('fails text-hero outside the HeroTitle file', () => {
    // ARRANGE
    const expected = [E2];
    // ACT
    const rules = rulesOf('hero elsewhere');
    // ASSERT
    expect(rules).toEqual(expected);
  });

  it.each(LEGACY)('fails text-hero in the legacy file set %s too', (glob) => {
    // ARRANGE
    const expected = [E2];
    // ACT
    const rules = rulesOf(`legacy hero ${glob}`);
    // ASSERT
    expect(rules).toEqual(expected);
  });

  it('passes text-hero in the HeroTitle file', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const rules = rulesOf('hero in its file');
    // ASSERT
    expect(rules).toEqual(expected);
  });
});
