import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../tests/docs/run-checks.ts';

/*
 * The Run-level staging checks on this Run's folder alone (ARCH-003 §4.7, `tests/docs/run-checks.ts`). The glob puts
 * every text file the checks read in this test's import graph, so `vitest --changed` runs it when one of them changes;
 * the checks read the folder from disk. begin-run copies this file from
 * `skills/new-episode/assets/run-checks.test.ts.txt`; never edit one Run's copy.
 */

const FILES = import.meta.glob('./**/*.{md,yml,html,jsonl}', { import: 'default' });
const CHECKS = runChecks(import.meta.dirname);

describe('success cases', () => {
  it.each(CHECKS)('$name', async ({ findings }) => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const found = await findings();
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads the Brief, so a Run checked without its Brief fails', () => {
    // ARRANGE
    const brief = './brief.md';
    // ACT
    const files = Object.keys(FILES);
    // ASSERT
    expect(files).toContain(brief);
  });
});

describe('edge cases', () => {
  it('follows the per-run pipeline, so a pipeline edit reruns this test', () => {
    // ARRANGE
    const pipeline = './pipeline.yml';
    // ACT
    const files = Object.keys(FILES);
    // ASSERT
    expect(files).toContain(pipeline);
  });
});
