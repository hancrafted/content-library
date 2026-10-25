import { describe, expect, it } from 'vitest';
import { researchInforming, type ResearchSummary } from './research-questions.pure';

/*
 * Which Research questions a Concept page lists: every promoted one that informs the Concept, those whose main
 * Concept it is first. A staged question has no page yet, so no Concept page links it.
 */

function question(id: string, informs: readonly string[], staged = false): ResearchSummary {
  return { id, informs, staged };
}

describe('success cases', () => {
  it('A Concept page lists every Research question that informs it', () => {
    // ARRANGE
    const research = [
      question('AIE-0004', ['context-engineering']),
      question('LLM-0002', ['context-engineering', 'ai-cost']),
      question('SALES-0001', ['sales']),
      question('AIE-0011', ['context-engineering']),
    ];
    const expected = ['AIE-0004', 'LLM-0002', 'AIE-0011'];
    // ACT
    const listed = researchInforming(research, 'context-engineering').map(({ id }) => id);
    // ASSERT
    expect(listed).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('lists no staged Research question, since it has no page until Promotion', () => {
    // ARRANGE
    const research = [
      question('AIE-0004', ['context-engineering']),
      question('LLM-0008', ['context-engineering'], true),
    ];
    const expected = ['AIE-0004'];
    // ACT
    const listed = researchInforming(research, 'context-engineering').map(({ id }) => id);
    // ASSERT
    expect(listed).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lists the questions whose main Concept it is before those it only also informs', () => {
    // ARRANGE
    const research = [question('LLM-0002', ['context-engineering', 'ai-cost']), question('LLM-0009', ['ai-cost'])];
    const expected = ['LLM-0009', 'LLM-0002'];
    // ACT
    const listed = researchInforming(research, 'ai-cost').map(({ id }) => id);
    // ASSERT
    expect(listed).toEqual(expected);
  });
});
