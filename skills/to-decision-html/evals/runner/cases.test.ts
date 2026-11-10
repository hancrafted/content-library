import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CASES, hashProblems, loadCase, readManifest } from './cases.ts';

const HASH_OF_FROZEN = '9c45da1b799a603c167323bd7ed4f52034ec28ea5e04373045a9c11f1ddc5446';

describe('frozen eval cases', () => {
  describe('success cases', () => {
    it('keeps every frozen file byte-identical to its manifest hash', () => {
      // ARRANGE
      const { cases } = readManifest();

      // ACT
      const problems = cases.flatMap((entry) => hashProblems(CASES, entry.hashes));

      // ASSERT
      expect(problems).toEqual([]);
    });

    it('gives the ink case its mode, prompt, attachments and frozen calibration answers', () => {
      // ARRANGE
      const expected = {
        id: 'ink',
        evalId: 1,
        mode: 'decide',
        prompt: 'ink/prompt.md',
        inputs: ['ink/handoff.md', 'ink/calibration.md'],
      };

      // ACT
      const { id, evalId, mode, prompt, inputs } = loadCase('ink');

      // ASSERT
      expect({ id, evalId, mode, prompt, inputs }).toEqual(expected);
    });
  });

  describe('failure cases', () => {
    it('names a frozen file whose bytes changed', () => {
      // ARRANGE
      const dir = mkdtempSync(path.join(tmpdir(), 'eval-case-'));
      writeFileSync(path.join(dir, 'prompt.md'), 'frozen\n!');
      const expected = ['prompt.md no longer matches its frozen hash; restore it, or freeze a new case'];

      // ACT
      const problems = hashProblems(dir, { 'prompt.md': HASH_OF_FROZEN });

      // ASSERT
      expect(problems).toEqual(expected);
    });

    it('refuses a case without frozen calibration answers', () => {
      // ARRANGE
      const expected = 'case "episode" has no mode or calibration answers, so it cannot run headless';

      // ACT
      const load = () => loadCase('episode');

      // ASSERT
      expect(load).toThrow(expected);
    });
  });

  describe('edge cases', () => {
    it('names a frozen file that is missing', () => {
      // ARRANGE
      const dir = mkdtempSync(path.join(tmpdir(), 'eval-case-'));
      const expected = ['handoff.md is missing'];

      // ACT
      const problems = hashProblems(dir, { 'handoff.md': HASH_OF_FROZEN });

      // ASSERT
      expect(problems).toEqual(expected);
    });

    it('refuses a case the manifest does not list', () => {
      // ARRANGE
      const expected = 'no eval case "nope"; cases: ink, episode';

      // ACT
      const load = () => loadCase('nope');

      // ASSERT
      expect(load).toThrow(expected);
    });
  });
});
