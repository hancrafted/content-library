import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * The factory model's seam (design-ADR 0024 §1): outside the model, every module reaches the network through the
 * handle `createFactory` returns — its Snapshot, Topology and Floor — never the network itself, its flags or the
 * modules that step it. The model is `factory-model.pure.ts` and the modules listed in MODEL; tests may use its
 * internal seam (`buildFactory`).
 */
const DIR = import.meta.dirname;
/** Where else the model is drawn: the software ecology page's Slides, whose stills read it through the same handle. */
const SLIDES = join(DIR, '../../episodes/explorable-pages/software-ecology');
/** How a module names one of the Explorable's own: relative from inside it, by its alias path from a Slide. */
const OWN = String.raw`(?:\./|@/explorables/software-ecology/)`;

/** The model: its interface module and what only it (and its own tests) may reach. */
const MODEL = new Set([
  'factory-model.pure.ts',
  'factory-network.pure.ts',
  'factory-floor-reads.pure.ts',
  'factory-reads.types.ts',
  'factory-build.pure.ts',
  'factory-step.pure.ts',
  'factory-flow.pure.ts',
  'factory-service.pure.ts',
  'factory-docs.pure.ts',
  'factory-sizing.pure.ts',
  'factory-solve.pure.ts',
  'factory-traffic.pure.ts',
  'factory-routing.pure.ts',
  'factory-readouts.pure.ts',
  'factory-measures.pure.ts',
  'factory-snapshot.pure.ts',
  'stage-readouts.pure.ts',
  'dashboard-readouts.pure.ts',
  'factory-dials.pure.ts',
  'factory.types.ts',
  'factory-random.pure.ts',
]);

/** Modules that hold or step the network: never imported from outside the model. */
const INTERNAL = [
  'factory-network',
  'factory-floor-reads',
  'factory-build',
  'factory-step',
  'factory-flow',
  'factory-service',
  'factory-docs',
  'factory-sizing',
  'factory-solve',
  'factory-traffic',
  'factory-routing',
  'factory-readouts',
  'factory-measures',
  'factory-snapshot',
  'factory.types',
];

/** Names of `factory-dials` that read a work center of the network or a document's quality. */
const NETWORK_READS = ['Q', 'dials', 'speedOf', 'rushOf', 'effvNow', 'aiOn', 'srcRate'];

const internalImports = (src: string): string[] =>
  [...src.matchAll(new RegExp(String.raw`from '${OWN}([\w.-]+?)(?:\.pure)?(?:\.ts)?'`, 'g'))]
    .map((m) => m[1] ?? '')
    .filter((name) => INTERNAL.includes(name))
    .map((name) => `imports ${name}`);

const dialsNames = (src: string): string[] =>
  [
    ...src.matchAll(
      new RegExp(String.raw`import\s+(?:type\s+)?\{([^}]*)\}\s+from '${OWN}factory-dials\.pure(?:\.ts)?'`, 'g'),
    ),
  ]
    .flatMap((m) => (m[1] ?? '').split(','))
    .map((x) => x.trim().replace(/^type\s+/, ''))
    .filter((name) => NETWORK_READS.includes(name))
    .map((name) => `imports ${name} from factory-dials`);

/** What a source file does that only the model may: each breach as `<what>: <text>`. */
const breachesOf = (src: string): string[] => [
  ...internalImports(src),
  ...dialsNames(src),
  ...(/\bbuildFactory\b/.test(src) ? ['builds the network'] : []),
  ...(/\.m\.|\brun\.m\b|\.hook\s*=/.test(src) ? ['reaches into the network'] : []),
];

/** Every source file outside the model, by its path from the Explorable's folder: its own, then the Slides'. */
const outside = () => [
  ...readdirSync(DIR)
    .filter((f) => /\.tsx?$/.test(f) && !/\.test\.ts$/.test(f) && !MODEL.has(f))
    .sort(),
  ...readdirSync(SLIDES, { recursive: true, encoding: 'utf8' })
    .filter((f) => /\.tsx?$/.test(f) && !/\.test\.ts$/.test(f))
    .sort()
    .map((f) => relative(DIR, join(SLIDES, f))),
];

describe('success cases', () => {
  it('finds no module outside the model, the page Slides included, that reaches the network past the handle', () => {
    // ARRANGE
    const files = outside();
    const none: string[] = [];
    // ACT
    const breaches = files.flatMap((f) => breachesOf(readFileSync(join(DIR, f), 'utf8')).map((b) => `${f}: ${b}`));
    // ASSERT
    expect(files.length).toBeGreaterThan(MODEL.size);
    expect(files).toContain(
      '../../episodes/explorable-pages/software-ecology/slides/why-how-what/factory-still-state.ts',
    );
    expect(breaches).toEqual(none);
  });
});

describe('failure cases', () => {
  it('names a painter that imports the flags, writes the hook and steps the network itself', () => {
    // ARRANGE
    const src = [
      "import { COMPL } from './factory-flow.pure.ts';",
      "import { dials, DTW } from './factory-dials.pure.ts';",
      'this.m.hook = this.hear;',
    ].join('\n');
    const expected = ['imports factory-flow', 'imports dials from factory-dials', 'reaches into the network'];
    // ACT
    const breaches = breachesOf(src);
    // ASSERT
    expect(breaches).toEqual(expected);
  });

  it('names a Slide still that imports the flow and the dials by their alias path', () => {
    // ARRANGE
    const src = [
      "import { COMPL } from '@/explorables/software-ecology/factory-flow.pure';",
      "import { speedOf } from '@/explorables/software-ecology/factory-dials.pure';",
    ].join('\n');
    const expected = ['imports factory-flow', 'imports speedOf from factory-dials'];
    // ACT
    const breaches = breachesOf(src);
    // ASSERT
    expect(breaches).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lets a module read the settings constants and the handle’s own types', () => {
    // ARRANGE
    const src = [
      "import { DAYS, DTW, startSettings } from './factory-dials.pure.ts';",
      "import type { Floor, Snapshot } from './factory-model.pure.ts';",
      "import { RACK } from './stage-readouts.pure.ts';",
    ].join('\n');
    const none: string[] = [];
    // ACT
    const breaches = breachesOf(src);
    // ASSERT
    expect(breaches).toEqual(none);
  });
});
