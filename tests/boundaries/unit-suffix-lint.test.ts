import { describe, expect, it } from 'vitest';
import { UNIT_SUFFIX_DENYLIST } from '../../tools/lint/constants';
import { lintProbes, type Probe } from './lint-probe';

const TIMEOUT = 30_000;
const UNIT_MESSAGE = 'spell the unit in full';

const DENYLISTED_FULL_WORDS = {
  Ms: 'Milliseconds',
  Sec: 'Seconds',
  Min: 'Minutes',
  Px: 'Pixels',
  Pct: 'Percent',
  Deg: 'Degrees',
  Hz: 'Hertz',
  Fps: 'FramesPerSecond',
} as const;

const ALLOWED_UNIT_WORDS = [
  'Milliseconds',
  'Seconds',
  'Minutes',
  'Hours',
  'Pixels',
  'Percent',
  'Degrees',
  'Bytes',
  'Frames',
  'Words',
  'Lines',
  'Ratio',
  'Count',
  'Rem',
  'Em',
  'Vh',
  'Vw',
];

const casingsOf = (abbreviation: string) => [
  ['camelCase', `fadeDuration${abbreviation}`],
  ['upper camelCase', `fadeDuration${abbreviation.toUpperCase()}`],
  ['SCREAMING_SNAKE_CASE', `FADE_DURATION_${abbreviation.toUpperCase()}`],
  ['snake_case', `fade_duration_${abbreviation.toLowerCase()}`],
];

const DECLARATION_FORMS = [
  ['a const', (name: string) => `export const ${name} = 1;\n`],
  ['a parameter', (name: string) => `export function probe(${name}: number) { return ${name}; }\n`],
  [
    'a destructured binding',
    (name: string) => `export const probe = ({ ${name} }: { [k: string]: number }) => ${name};\n`,
  ],
  ['an object literal key', (name: string) => `export const probe = { ${name}: 1 };\n`],
  ['an interface property', (name: string) => `export interface Probe { ${name}: number }\n`],
  ['a function name', (name: string) => `export function ${name}() { return 1; }\n`],
] as const;

const AREAS = [
  'src/explorables/probe',
  'src/episodes/onboard-ai-every-time/slides/probe',
  'src/shared/probe',
  'tools/probe',
  'tests/probe',
  'skills/probe/scripts',
];

async function unitMessagesOf(probes: Probe[]): Promise<string[][]> {
  const diagnostics = await lintProbes(probes);
  return diagnostics.map((list) =>
    list.filter((d) => d.ruleId === 'no-restricted-syntax' && d.message.includes(UNIT_MESSAGE)).map((d) => d.message),
  );
}

describe('the denylist', () => {
  it('is the eight abbreviations the GEN-007 ADR names', () => {
    // ARRANGE
    const expected = Object.keys(DENYLISTED_FULL_WORDS);
    // ACT
    const denylisted = Object.keys(UNIT_SUFFIX_DENYLIST);
    // ASSERT
    expect(denylisted).toEqual(expected);
  });
});

describe('failure cases', () => {
  it(
    'refuses every denylisted abbreviation in every casing, naming its full word',
    async () => {
      // ARRANGE
      const cases = Object.entries(DENYLISTED_FULL_WORDS).flatMap(([abbreviation, fullWord]) =>
        casingsOf(abbreviation).map(([casing, name]) => ({ abbreviation, fullWord, casing, name })),
      );
      const probes = cases.map(({ name }, index) => ({
        source: `export const ${name} = 1;\n`,
        virtualPath: `src/shared/probe/casing-${index}.ts`,
      }));
      const expected = cases.map(({ fullWord }) => [expect.stringContaining(fullWord)]);
      // ACT
      const messages = await unitMessagesOf(probes);
      // ASSERT
      expect(messages).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'refuses an abbreviated suffix in every declaration form',
    async () => {
      // ARRANGE
      const probes = DECLARATION_FORMS.map(([, declare], index) => ({
        source: declare('fadeDurationMs'),
        virtualPath: `src/shared/probe/form-${index}.ts`,
      }));
      const expected = DECLARATION_FORMS.map(() => true);
      // ACT
      const messages = await unitMessagesOf(probes);
      // ASSERT
      expect(messages.map((list) => list.length > 0)).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'refuses an abbreviated suffix in every area of the repo',
    async () => {
      // ARRANGE
      const probes = AREAS.map((area) => ({ source: 'export const gapPx = 1;\n', virtualPath: `${area}/probe.ts` }));
      const expected = AREAS.map(() => [expect.stringContaining('Pixels')]);
      // ACT
      const messages = await unitMessagesOf(probes);
      // ASSERT
      expect(messages).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'refuses an abbreviated suffix in a Slide component file',
    async () => {
      // ARRANGE
      const source = 'export const Probe = () => { const gapPx = 1; return <div style={{ gap: gapPx }} />; };\n';
      const probes = [{ source, virtualPath: 'src/episodes/onboard-ai-every-time/slides/probe/slide.tsx' }];
      const expected = [[expect.stringContaining('Pixels')]];
      // ACT
      const messages = await unitMessagesOf(probes);
      // ASSERT
      expect(messages).toEqual(expected);
    },
    TIMEOUT,
  );
});

describe('success cases', () => {
  it(
    'passes every full unit word in every casing',
    async () => {
      // ARRANGE
      const names = ALLOWED_UNIT_WORDS.flatMap((word) => [
        `fadeDuration${word}`,
        `FADE_DURATION_${word.toUpperCase()}`,
        `fade_duration_${word.toLowerCase()}`,
      ]);
      const source = names.map((name) => `export const ${name} = 1;\n`).join('');
      const expected = [[]];
      // ACT
      const messages = await unitMessagesOf([{ source, virtualPath: 'src/shared/probe/full-words.ts' }]);
      // ASSERT
      expect(messages).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'passes words that merely end in the letters of an abbreviation',
    async () => {
      // ARRANGE
      const names = ['items', 'ALARMS', 'xMidYMin', 'admin', 'ADMIN', 'spec', 'codec', 'pattern', 'rhythmHz2'];
      const source = names.map((name) => `export const ${name} = 1;\n`).join('');
      const expected = [[]];
      // ACT
      const messages = await unitMessagesOf([{ source, virtualPath: 'src/shared/probe/near-misses.ts' }]);
      // ASSERT
      expect(messages).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'passes a property read from a third-party API and its renamed destructuring',
    async () => {
      // ARRANGE
      const source = [
        "import { library } from 'third-party';",
        'export const fadeDurationMilliseconds = library.durationMs;',
        'export const { offsetPx: offsetPixels } = library;',
        'library.timing.delayMs = 3;',
        'export const delayMilliseconds = library.delaySec?.valueOf();',
        '',
      ].join('\n');
      const expected = [[]];
      // ACT
      const messages = await unitMessagesOf([{ source, virtualPath: 'src/shared/probe/third-party.ts' }]);
      // ASSERT
      expect(messages).toEqual(expected);
    },
    TIMEOUT,
  );
});
