import { ESLint } from 'eslint';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * Probe tests for the design-token lint checks (FE-011, eslint.config.mjs): one planted violation per check must
 * fail, and the allowed forms must pass. Each probe lints a snippet through the real config under a virtual path,
 * so the per-file exemptions (legacy list, HeroTitle file, the two relative sizes) are exercised too.
 */

const ROOT = path.join(__dirname, '../..');
const LEGACY: string[] = JSON.parse(
  readFileSync(path.join(ROOT, 'src/shared/design-system/legacy.json'), 'utf8'),
).globs;
const eslint = new ESLint({ cwd: ROOT });

const SLIDE = 'src/episodes/resources/timelines/slides/probe/slide.tsx';
const HERO_TITLE = 'src/episodes/components/slide-master/slide-master.tsx';
const CITATION = 'src/shared/page-chrome/context-drawer/slide-notes.tsx';
const INLINE_CODE = 'src/episodes/components/slide-master/rich-tags.tsx';
const TIMEOUT = 30_000;

const markup = (classes: string) => `export const Probe = () => <div className="${classes}" />;\n`;

/** The better-tailwindcss rule ids a snippet breaks when linted as `file`. */
async function broken(classes: string, file: string): Promise<string[]> {
  const [result] = await eslint.lintText(markup(classes), { filePath: path.join(ROOT, file) });
  return result.messages.filter((m) => m.ruleId?.startsWith('better-tailwindcss/')).map((m) => m.ruleId ?? '');
}

const E1 = 'better-tailwindcss/no-unknown-classes';
const E2 = 'better-tailwindcss/no-restricted-classes';
const legacyProbe = (glob: string) => `${glob.replace(/\*+$/, '')}probe.tsx`;

describe('E1 no-unregistered-classes', () => {
  it(
    'fails a phantom class',
    async () => {
      // ARRANGE
      const phantom = 'p-4 btn-phantom';
      // ACT
      const rules = await broken(phantom, SLIDE);
      // ASSERT
      expect(rules).toEqual([E1]);
    },
    TIMEOUT,
  );

  it.each(LEGACY)(
    'fails a phantom class in the legacy file set %s too',
    async (glob) => {
      // ARRANGE
      const phantom = 'btn-phantom';
      // ACT
      const rules = await broken(phantom, legacyProbe(glob));
      // ASSERT
      expect(rules).toEqual([E1]);
    },
    TIMEOUT,
  );

  it(
    'passes registered utilities, token utilities and the slide-token shorthand',
    async () => {
      // ARRANGE
      const registered = 'flex bg-primary text-muted-foreground text-heading font-semibold bg-(--loop-edge)';
      // ACT
      const rules = await broken(registered, SLIDE);
      // ASSERT
      expect(rules).toEqual([]);
    },
    TIMEOUT,
  );
});

describe('E2 no-restricted-classes', () => {
  it.each([
    ['a palette colour', 'text-red-500'],
    ['plain black', 'bg-black'],
    ['an arbitrary hex colour', 'bg-[#ff0000]'],
    ['an arbitrary oklch colour', 'text-[oklch(0.6_0.1_200)]'],
    ['a fourth size', 'text-sm'],
    ['an arbitrary size', 'text-[13px]'],
    ['a breakpoint prefix on a size', 'md:text-heading'],
    ['a weight outside normal, medium and semibold', 'font-bold'],
  ])(
    'fails %s outside the legacy list',
    async (_name, classes) => {
      // ARRANGE
      const expected = [E2];
      // ACT
      const rules = await broken(classes, SLIDE);
      // ASSERT
      expect(rules).toEqual(expected);
    },
    TIMEOUT,
  );

  it.each(['bg-(--loop-edge)', 'text-(--loop-edge)', 'bg-[color-mix(in_oklch,var(--lane)_38%,transparent)]'])(
    'allows the slide-token form %s',
    async (classes) => {
      // ARRANGE
      const expected: string[] = [];
      // ACT
      const rules = await broken(classes, SLIDE);
      // ASSERT
      expect(rules).toEqual(expected);
    },
    TIMEOUT,
  );

  it.each(LEGACY)(
    'exempts every file under the legacy entry %s',
    async (glob) => {
      // ARRANGE
      const violations = 'text-sm text-red-500 font-bold';
      // ACT
      const rules = await broken(violations, legacyProbe(glob));
      // ASSERT
      expect(rules).toEqual([]);
    },
    TIMEOUT,
  );

  it(
    'allows the citation marker size in its one file only',
    async () => {
      // ARRANGE
      const marker = 'text-[0.7em]';
      // ACT
      const [inFile, elsewhere] = [await broken(marker, CITATION), await broken(marker, SLIDE)];
      // ASSERT
      expect([inFile, elsewhere]).toEqual([[], [E2]]);
    },
    TIMEOUT,
  );

  it(
    'allows the inline code size in its one file only',
    async () => {
      // ARRANGE
      const code = 'text-[0.9em]';
      // ACT
      const [inFile, elsewhere] = [await broken(code, INLINE_CODE), await broken(code, SLIDE)];
      // ASSERT
      expect([inFile, elsewhere]).toEqual([[], [E2]]);
    },
    TIMEOUT,
  );

  it(
    'refuses the other relative size in each exempt file',
    async () => {
      // ARRANGE
      const swapped: [string, string][] = [
        [CITATION, 'text-[0.9em]'],
        [INLINE_CODE, 'text-[0.7em]'],
      ];
      // ACT
      const rules = await Promise.all(swapped.map(([file, classes]) => broken(classes, file)));
      // ASSERT
      expect(rules).toEqual([[E2], [E2]]);
    },
    TIMEOUT,
  );
});

describe('E3 text-hero only in HeroTitle', () => {
  it(
    'fails text-hero outside the HeroTitle file',
    async () => {
      // ARRANGE
      const hero = 'text-hero';
      // ACT
      const rules = await broken(hero, SLIDE);
      // ASSERT
      expect(rules).toEqual([E2]);
    },
    TIMEOUT,
  );

  it.each(LEGACY)(
    'fails text-hero in the legacy file set %s too',
    async (glob) => {
      // ARRANGE
      const hero = 'text-hero';
      // ACT
      const rules = await broken(hero, legacyProbe(glob));
      // ASSERT
      expect(rules).toEqual([E2]);
    },
    TIMEOUT,
  );

  it(
    'passes text-hero in the HeroTitle file',
    async () => {
      // ARRANGE
      const hero = 'font-semibold text-hero';
      // ACT
      const rules = await broken(hero, HERO_TITLE);
      // ASSERT
      expect(rules).toEqual([]);
    },
    TIMEOUT,
  );
});
