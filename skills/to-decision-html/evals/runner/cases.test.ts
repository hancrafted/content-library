import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { answerKeyProblems, CASES, hashProblems, loadCase, readManifest } from './cases.ts';

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

    it('gives each new case its mode, prompt, attachments and frozen calibration answers', () => {
      // ARRANGE
      const expected = [
        {
          id: 'after-grill',
          mode: 'decide',
          prompt: 'after-grill/prompt.md',
          inputs: ['after-grill/grill.md', 'after-grill/calibration.md'],
        },
        {
          id: 'ticket',
          mode: 'explain',
          prompt: 'ticket/prompt.md',
          inputs: ['ticket/issue.md', 'ticket/calibration.md'],
        },
      ];

      // ACT
      const loaded = ['after-grill', 'ticket']
        .map(loadCase)
        .map(({ id, mode, prompt, inputs }) => ({ id, mode, prompt, inputs }));

      // ASSERT
      expect(loaded).toEqual(expected);
    });

    it("freezes every answer key on a quote from the case's own inputs", () => {
      // ARRANGE
      const { cases } = readManifest();

      // ACT
      const problems = cases.flatMap((entry) => answerKeyProblems(entry));

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

    it("names an answer key whose quote is not in the case's inputs", () => {
      // ARRANGE
      const dir = mkdtempSync(path.join(tmpdir(), 'eval-case-'));
      writeFileSync(path.join(dir, 'issue.md'), 'A failed write is caught.\n');
      writeFileSync(
        path.join(dir, 'probe.json'),
        JSON.stringify({
          questions: [{ id: 'failed-write', source: { file: 'issue.md', quote: 'The page retries.' } }],
        }),
      );
      writeFileSync(
        path.join(dir, 'checklist.json'),
        JSON.stringify({ items: [{ id: 'leak', source: { file: 'notes.md', quote: 'x' } }] }),
      );
      const entry = {
        id: 'demo',
        prompt: 'prompt.md',
        attachments: ['issue.md'],
        checklist: 'checklist.json',
        probe: 'probe.json',
      };
      const expected = [
        'checklist.json leak quotes notes.md, which is not an input of case "demo"',
        'probe.json failed-write quotes text that issue.md does not hold',
      ];

      // ACT
      const problems = answerKeyProblems(entry, dir);

      // ASSERT
      expect(problems).toEqual(expected);
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
      const expected = 'no eval case "nope"; cases: ink, after-grill, ticket';

      // ACT
      const load = () => loadCase('nope');

      // ASSERT
      expect(load).toThrow(expected);
    });
  });
});
