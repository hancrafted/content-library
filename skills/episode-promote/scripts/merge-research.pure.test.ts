import { describe, expect, it } from 'vitest';
import { mergeResearch } from './merge-research.pure.ts';

const INTO = 'docs/llm-wiki/research/LLM/LLM-0001__llm-output-nondeterminism/research.md';
const RETIRED = 'docs/episodes/ai-gives-you-more-work/research/AIE-0014__llm-non-deterministic-output/research.md';
const SLIDE = 'src/components/episodes/ai-gives-you-more-work/slides/sampling/slide.tsx';
const DOSSIER = 'docs/episodes/ai-gives-you-more-work/dossier.md';
const EXTENDS = 'docs/llm-wiki/research/AIE/AIE-0002__individual-ai-productivity-gap/research.md';

function research(id: string, { supersedes = '' } = {}): string {
  return [
    '---',
    'type: research',
    `title: 'Question ${id}?'`,
    "description: 'Answer.'",
    'confidence: open',
    "confidence_reason: 'One study only.'",
    'informs: [llm-behaviour]',
    `${supersedes}generated:`,
    '  by: claude-code/opus-5.5',
    '  at: 2026-10-19T18:00:00Z',
    'sources:',
    '  - id: 1',
    '    resource: https://arxiv.org/abs/2503.14499',
    "    title: 'Kwa et al., Measuring AI Ability'",
    '---',
    '',
    `# Question ${id}?`,
    '',
  ].join('\n');
}

const FILES = {
  [INTO]: research('LLM-0001'),
  [RETIRED]: research('AIE-0014'),
  [SLIDE]: "sources: [{ slug: 'sampling', research: 'AIE-0014' }]\n",
  [DOSSIER]: 'Models vary their answers [AIE-0014].\n\n- research: AIE-0014\n',
  [EXTENDS]: `sources:\n  - id: 1\n    resource: ${RETIRED}\n`,
};

describe('mergeResearch', () => {
  describe('success cases', () => {
    it('A merge re-points every citation and lists the retired id in a supersedes line', () => {
      // ARRANGE
      const expected = {
        [SLIDE]: "sources: [{ slug: 'sampling', research: 'LLM-0001' }]\n",
        [DOSSIER]: 'Models vary their answers [LLM-0001].\n\n- research: LLM-0001\n',
        [EXTENDS]: `sources:\n  - id: 1\n    resource: ${INTO}\n`,
        [INTO]: research('LLM-0001', { supersedes: 'supersedes: [AIE-0014]\n' }),
      };

      // ACT
      const merged = mergeResearch({ retired: 'AIE-0014', into: 'LLM-0001', files: FILES });

      // ASSERT
      expect(merged.writes).toEqual(expected);
      expect(merged.removes).toEqual([
        'docs/episodes/ai-gives-you-more-work/research/AIE-0014__llm-non-deterministic-output',
      ]);
    });

    it('carries the ids the retired question superseded, so none of them is reused either', () => {
      // ARRANGE
      const files = {
        [INTO]: research('LLM-0001'),
        [RETIRED]: research('AIE-0014', { supersedes: 'supersedes: [AIE-0013]\n' }),
      };

      // ACT
      const merged = mergeResearch({ retired: 'AIE-0014', into: 'LLM-0001', files });

      // ASSERT
      expect(merged.writes[INTO]).toContain('supersedes: [AIE-0013, AIE-0014]\n');
    });
  });

  describe('failure cases', () => {
    it('refuses to retire a promoted question, whose page is public', () => {
      // ARRANGE
      const message = 'LLM-0001 is promoted: its page /research/LLM-0001 is public';

      // ACT
      const attempt = () => mergeResearch({ retired: 'LLM-0001', into: 'AIE-0014', files: FILES });

      // ASSERT
      expect(attempt).toThrow(message);
    });

    it('refuses an id no research file holds', () => {
      // ARRANGE
      const message = 'No research file holds AIE-0099';

      // ACT
      const attempt = () => mergeResearch({ retired: 'AIE-0099', into: 'LLM-0001', files: FILES });

      // ASSERT
      expect(attempt).toThrow(message);
    });
  });
});
