// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
// decision: FE-007 §2.8
import {
  judgeScenario,
  SEEDS,
  seedsFrom,
  type BeatVerdict,
  type ScenarioVerdict,
  type SeedCheck,
} from './factory-scenario.pure.ts';
import type { Bundle, CatalogWords } from './software-ecology.types';
import { bundleOf, readCatalog, readConfig } from './use-case-file.ts';
import { mapTexts, textFileNames, type UseCaseTexts } from './use-case-texts.pure.ts';
import { presetName, scenarioWords, type WordsIn } from './use-case-words.pure.ts';

export interface SimOptions {
  readonly useCase: string;
  readonly scenario: string;
  readonly seed?: number;
  readonly seeds?: number;
  readonly json?: boolean;
}

export interface SimRun {
  readonly useCase: string;
  readonly scenario: string;
  readonly name: string;
  readonly claims: readonly (string | null)[];
  readonly verdict: ScenarioVerdict;
}

const USAGE = 'usage: npm run ecology:sim -- <use-case> <scenario> [--seed n | --seeds n] [--json]';

export type ReadFile = (name: string) => string;

const fileOf = (read: ReadFile, name: string): string => {
  try {
    return read(name);
  } catch {
    throw new Error(`no use case ${name.split('.')[0] ?? name}`);
  }
};

export const readTexts = (id: string, read: ReadFile): UseCaseTexts => {
  if (!/^[\w-]+$/.test(id)) throw new Error(`no use case ${id}`);
  return mapTexts((name) => fileOf(read, name), textFileNames(id));
};

export const loadUseCase = (id: string, read: ReadFile): Bundle =>
  bundleOf(readTexts(id, read), readCatalog(fileOf(read, 'roles.yml')));

const count = (flag: string, v: string | undefined): number => {
  if (!v || !/^\d+$/.test(v) || Number(v) < 1) throw new Error(`${flag} needs a whole number from 1\n${USAGE}`);
  return Number(v);
};

type SeedPick = { seed: number } | { seeds: number };

const flagOf = (a: string | undefined, v: string | undefined): { json?: true; pick?: SeedPick; took: number } => {
  if (a === '--json') return { json: true, took: 1 };
  if (a === '--seed') return { pick: { seed: count(a, v) }, took: 2 };
  if (a === '--seeds') return { pick: { seeds: count(a, v) }, took: 2 };
  throw new Error(`unknown argument ${a}\n${USAGE}`);
};

const usable = (x: string | undefined): x is string => !!x && !x.startsWith('-');

export const parseSimArgs = (argv: readonly string[]): SimOptions => {
  const [useCase, scenario, ...rest] = argv;
  if (!usable(useCase) || !usable(scenario)) throw new Error(USAGE);
  let opts: SimOptions = { useCase, scenario, json: false };
  for (let i = 0; i < rest.length;) {
    const f = flagOf(rest[i], rest[i + 1]);
    opts = { ...opts, ...f.pick, ...(f.json ? { json: true } : {}) };
    i += f.took;
  }
  return opts;
};

const seedsOf = (o: SimOptions): readonly number[] =>
  o.seed !== undefined ? [o.seed] : o.seeds !== undefined ? seedsFrom(o.seeds) : SEEDS;

export const simulate = (o: SimOptions, read: ReadFile): SimRun => {
  const B = loadUseCase(o.useCase, read),
    words: WordsIn = {
      B,
      locale: 'en',
      catalog: readConfig<CatalogWords>(fileOf(read, 'roles.words.yml')),
    },
    verdict = judgeScenario(B, o.scenario, { seeds: seedsOf(o) }),
    claims = scenarioWords(words, o.scenario).claims ?? {};
  return {
    useCase: o.useCase,
    scenario: o.scenario,
    name: presetName(words, o.scenario),
    claims: verdict.beats.map((b) => (b.claim ? (claims[b.claim] ?? b.claim) : null)),
    verdict,
  };
};

const num = (v: number | undefined): string => (v === undefined || Number.isNaN(v) ? '–' : v.toFixed(2));
const mean = (xs: readonly number[]): number => xs.reduce((a, x) => a + x, 0) / (xs.length || 1);

const checkLines = (c: SeedCheck): string[] => {
  const held = c.held.filter(Boolean).length,
    label = c.kind === 'settles' ? 'settles ' : '';
  return [
    `  ${label}${c.key} ${c.test}  mean ${num(mean(c.means))}  held ${held} of ${c.held.length}`,
    `    seeds ${c.means.map(num).join(' ')}`,
    ...(c.prev.some((p) => p !== undefined) ? [`    before ${c.prev.map(num).join(' ')}`] : []),
  ];
};

const beatLines = (b: BeatVerdict, claim: string | null): string[] => [
  `Beat ${b.i + 1} · week ${b.week} (${b.length} weeks${b.lengthOk ? '' : ', not 6 to 9'})${claim ? ` · ${claim}` : ''}`,
  ...b.checks.flatMap(checkLines),
  `  ${b.ok ? 'PASS' : 'FAIL'} ${b.passed} of ${b.of} seeds`,
];

export const formatVerdict = (run: SimRun): string => {
  const v = run.verdict;
  return [
    `${run.useCase} ${run.scenario} · ${run.name} · ${v.seeds.length} seeds, a beat passes on ${v.need}`,
    ...v.beats.flatMap((b, i) => beatLines(b, run.claims[i] ?? null)),
    v.ok ? 'PASS: every beat holds' : 'FAIL: a beat does not hold',
  ].join('\n');
};
