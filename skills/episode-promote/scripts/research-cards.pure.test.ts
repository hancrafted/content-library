import { describe, expect, it } from 'vitest';
import { researchSection } from './research-cards.pure.ts';

const STAGED = 'docs/episodes/ai-gives-you-more-work/research';

function research({ title, confidence, reason, informs }: Record<string, string>): string {
  return [
    '---',
    'type: research',
    `title: '${title}'`,
    "description: 'Answer.'",
    `confidence: ${confidence}`,
    `confidence_reason: '${reason}'`,
    `informs: [${informs}]`,
    'generated:',
    '  by: claude-code/opus-5.5',
    '  at: 2026-10-19T18:00:00Z',
    '---',
    '',
    `# ${title}`,
    '',
  ].join('\n');
}

describe('researchSection', () => {
  describe('success cases', () => {
    it("shows a card per staged question with its proposed confidence, the Concepts it informs and the writer's reason", () => {
      // ARRANGE
      const files = [
        {
          path: `${STAGED}/AIE-0014__llm-non-deterministic-output/research.md`,
          markdown: research({
            title: 'Why do models vary?',
            confidence: 'open',
            reason: 'That this is unlike earlier machines is an untested inference.',
            informs: 'llm-behaviour',
          }),
        },
        {
          path: `${STAGED}/WORK-0001__productivity-tools-increase-work/research.md`,
          markdown: research({
            title: 'Why do tools add work?',
            confidence: 'contested',
            reason: 'The housework case is disputed.',
            informs: 'ai-adoption, sales',
          }),
        },
      ];
      const expected = {
        id: 'Q2',
        title:
          'Confirm that the evidence for "Why do tools add work?" is contested, and that it informs ai-adoption and sales.',
        changes: `${STAGED}/WORK-0001__productivity-tools-increase-work/research.md`,
        happened: 'The writer rated the evidence contested: The housework case is disputed.',
        change:
          'Keep the card to confirm both. Write a different confidence or other Concepts in its note to change them first.',
        gain: 'Only evidence you have checked reaches the wiki.',
        before: { kind: 'quote', text: 'contested, informs ai-adoption and sales (proposed by the writer)' },
        after: { kind: 'quote', text: 'contested, informs ai-adoption and sales (confirmed by you)' },
        evidence: `WORK-0001 · ${STAGED}/WORK-0001__productivity-tools-increase-work/research.md`,
      };

      // ACT
      const section = researchSection(files);

      // ASSERT
      expect(section.key).toBe('research');
      expect(section.cards.map(({ id }) => id)).toEqual(['Q1', 'Q2']);
      expect(section.cards[1]).toEqual(expected);
    });
  });

  describe('edge cases', () => {
    it('shows no card when the Run staged no research', () => {
      // ARRANGE
      const files: { path: string; markdown: string }[] = [];

      // ACT
      const section = researchSection(files);

      // ASSERT
      expect(section.cards).toEqual([]);
    });
  });
});
