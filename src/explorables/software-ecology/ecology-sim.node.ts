/*
 * The node entry of the software ecology Explorable (FE-007 §2.8): the one module of it that skills and tools may
 * import. It runs under plain node, no DOM and no rendering: it reads a shipped use case through the reader it is handed and
 * judges a scenario's beats across seeds with the judge the tests use (design-ADR 0024 §12, §20). `npm run
 * ecology:sim` (tools/ecology/sim.ts) is its shell.
 */
import {
  judgeScenario,
  SEEDS,
  seedsFrom,
  type BeatVerdict,
  type ScenarioVerdict,
  type SeedCheck,
} from './factory-scenario.pure.ts';
import type { Bundle } from './software-ecology.types';
import { bundleOf, readCatalog, readConfig } from './use-case-file.ts';

/** What to run: a use case, one of its scenarios, and one seed or a number of seeds in a row from the shipped one. */
export interface SimOptions {
  readonly useCase: string;
  readonly scenario: string;
  readonly seed?: number;
  readonly seeds?: number;
  readonly json?: boolean;
}

/** A judged run: the scenario's name and each beat's claim in English, and the verdict. */
export interface SimRun {
  readonly useCase: string;
  readonly scenario: string;
  readonly name: string;
  readonly claims: readonly (string | null)[];
  readonly verdict: ScenarioVerdict;
}

const USAGE = 'usage: npm run ecology:sim -- <use-case> <scenario> [--seed n | --seeds n] [--json]';

/** Reads a file of this Explorable's folder by name (`tire.yml`); the shell hands it in, reading from disk. */
export type ReadFile = (name: string) => string;

const fileOf = (read: ReadFile, name: string): string => {
  try {
    return read(name);
  } catch {
    throw new Error(`no use case ${name.split('.')[0] ?? name}`);
  }
};

/** A shipped use case, its files read by `read`. */
export const loadUseCase = (id: string, read: ReadFile): Bundle => {
  if (!/^[\w-]+$/.test(id)) throw new Error(`no use case ${id}`);
  const text = (suffix: string) => fileOf(read, `${id}${suffix}`);
  return bundleOf(
    { data: text('.yml'), en: text('.words.yml'), de: text('.words.de.yml') },
    readCatalog(fileOf(read, 'roles.yml')),
  );
};

const count = (flag: string, v: string | undefined): number => {
  if (!v || !/^\d+$/.test(v) || Number(v) < 1) throw new Error(`${flag} needs a whole number from 1\n${USAGE}`);
  return Number(v);
};

/** The seeds a flag picks: one seed, or a number of them in a row. */
type SeedPick = { seed: number } | { seeds: number };

/** One flag of the rest of the arguments: what it sets, and how many arguments it took. */
const flagOf = (a: string | undefined, v: string | undefined): { json?: true; pick?: SeedPick; took: number } => {
  if (a === '--json') return { json: true, took: 1 };
  if (a === '--seed') return { pick: { seed: count(a, v) }, took: 2 };
  if (a === '--seeds') return { pick: { seeds: count(a, v) }, took: 2 };
  throw new Error(`unknown argument ${a}\n${USAGE}`);
};

const usable = (x: string | undefined): x is string => !!x && !x.startsWith('-');

/** The shell arguments as options; throws the usage on anything else. */
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

const nameOf = (B: Bundle, read: ReadFile, id: string): string => {
  const catalog = readConfig<{ presets?: Record<string, string> }>(fileOf(read, 'roles.words.yml'));
  return B.words.en.presets?.[id] ?? catalog.presets?.[id] ?? id;
};

/** Judges the scenario on its seeds, the use case's files read by `read`. */
export const simulate = (o: SimOptions, read: ReadFile): SimRun => {
  const B = loadUseCase(o.useCase, read),
    verdict = judgeScenario(B, o.scenario, { seeds: seedsOf(o) }),
    claims = B.words.en.scenarios?.[o.scenario]?.claims ?? {};
  return {
    useCase: o.useCase,
    scenario: o.scenario,
    name: nameOf(B, read, o.scenario),
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

/** The run as text: a header, then each beat's claim, checks, per-seed readings and verdict. */
export const formatVerdict = (run: SimRun): string => {
  const v = run.verdict;
  return [
    `${run.useCase} ${run.scenario} · ${run.name} · ${v.seeds.length} seeds, a beat passes on ${v.need}`,
    ...v.beats.flatMap((b, i) => beatLines(b, run.claims[i] ?? null)),
    v.ok ? 'PASS: every beat holds' : 'FAIL: a beat does not hold',
  ].join('\n');
};
