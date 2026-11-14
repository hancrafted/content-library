import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CASES, hashProblems, keyProblems, loadCase, qualityKeys, readManifest, referenceOf } from './cases.ts';

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
        {
          id: 'architecture-round',
          mode: 'decide',
          prompt: 'architecture-round/prompt.md',
          inputs: [
            'architecture-round/decisions.md',
            'architecture-round/review-engine.html',
            'architecture-round/review-explorable.html',
            'architecture-round/calibration.md',
          ],
        },
        {
          id: 'episode-spec',
          mode: 'decide',
          prompt: 'episode-spec/prompt.md',
          inputs: [
            'episode-spec/decisions.md',
            'episode-spec/visual-language.html',
            'episode-spec/episode-page.html',
            'episode-spec/design.css',
            'episode-spec/calibration.md',
          ],
        },
      ];

      // ACT
      const loaded = ['after-grill', 'ticket', 'architecture-round', 'episode-spec']
        .map(loadCase)
        .map(({ id, mode, prompt, inputs }) => ({ id, mode, prompt, inputs }));

      // ASSERT
      expect(loaded).toEqual(expected);
    });

    it('asks prototype fidelity of every ink item, diagram of every architecture-round item, mock of every episode-spec item, and no single rung of the others', () => {
      // ARRANGE
      const expected = [{ fidelity: 'prototype' }, {}, {}, { fidelity: 'diagram' }, { fidelity: 'mock' }];

      // ACT
      const asked = ['ink', 'after-grill', 'ticket', 'architecture-round', 'episode-spec'].map(
        (id) => loadCase(id).asked,
      );

      // ASSERT
      expect(asked).toEqual(expected);
    });

    it("draws every case's checklist and probe keys verbatim from what its run sees", () => {
      // ARRANGE
      const keyed = readManifest().cases.filter((entry) => qualityKeys(entry.id) !== null);

      // ACT
      const problems = keyed.flatMap((entry) => keyProblems(CASES, loadCase(entry.id), qualityKeys(entry.id)!));

      // ASSERT
      expect(keyed.map((entry) => entry.id)).toEqual([
        'ink',
        'after-grill',
        'ticket',
        'architecture-round',
        'episode-spec',
      ]);
      expect(problems).toEqual([]);
    });
    it('gives architecture-round and episode-spec their frozen reference pages, and the other three cases none', () => {
      // ARRANGE
      const ids = ['ink', 'after-grill', 'ticket', 'architecture-round', 'episode-spec'];
      const expected = [null, null, null, 'architecture-round/reference.html', 'episode-spec/reference.html'];

      // ACT
      const references = ids.map(referenceOf);

      // ASSERT
      expect(references).toEqual(expected);
      expect(existsSync(path.join(CASES, references[3]!))).toBe(true);
      expect(existsSync(path.join(CASES, references[4]!))).toBe(true);
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
  });

  describe('edge cases', () => {
    it("names a key quoted from outside the run's inputs, or not found in its file", () => {
      // ARRANGE
      const ink = loadCase('ink');
      const keys = qualityKeys('ink')!;
      const [first, ...rest] = keys.probe;
      const broken = {
        checklist: keys.checklist,
        probe: [
          { ...first, source: { file: 'source.md', quote: 'magnetic' } },
          { ...rest[0], source: { file: 'handoff.md', quote: 'a quote the handoff never makes' } },
          ...rest.slice(1),
        ],
      };
      const expected = [
        'probe approach-count quotes source.md, which the run never sees',
        'probe bounded-shared-space quotes text not in handoff.md: "a quote the handoff never makes"',
      ];

      // ACT
      const problems = keyProblems(CASES, ink, broken);

      // ASSERT
      expect(problems).toEqual(expected);
    });

    it("names a ruling whose quote is not in the case's rounds.md", () => {
      // ARRANGE
      const episodeSpec = loadCase('episode-spec');
      const keys = qualityKeys('episode-spec')!;
      const [first, ...rest] = keys.checklist;
      const unquoted = 'a sentence Han never said';
      const broken = {
        checklist: [{ ...first, source: { session: 'd4eeec02', round: 1, quote: unquoted } }, ...rest],
        probe: keys.probe,
      };
      const expected = [`checklist ${first.id} quotes text not in rounds.md: "${unquoted}"`];

      // ACT
      const problems = keyProblems(CASES, episodeSpec, broken);

      // ASSERT
      expect(problems).toEqual(expected);
    });

    it('names an answer key outside its choices, and a checklist of the wrong size', () => {
      // ARRANGE
      const ink = loadCase('ink');
      const keys = qualityKeys('ink')!;
      const [first, ...rest] = keys.probe;
      const broken = {
        checklist: keys.checklist.slice(0, 2),
        probe: [{ ...first, answer: ['z'] }, ...rest],
      };
      const expected = [
        'checklist has 2 items; a case has 3 to 12',
        'probe approach-count keys z, which is not one of its choices',
      ];

      // ACT
      const problems = keyProblems(CASES, ink, broken);

      // ASSERT
      expect(problems).toEqual(expected);
    });

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
