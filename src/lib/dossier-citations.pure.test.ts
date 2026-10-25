import { describe, expect, it } from 'vitest';
import { checkStagingFolder, type KnownVisuals } from './episode-staging.pure';

/*
 * A Dossier's Speaker notes cite a Research question by id (design-ADR 0016, Pipeline and evidence rules 5 and 8): an
 * item `[AIE-0002]` with a nested `research: AIE-0002` line, the id one the research plan names. A Run whose every
 * question is reused writes no research and still cites each reused question.
 */

const KNOWN: KnownVisuals = { masters: ['basic-page'], motions: [] };
const REVIEW_ASSET = '';

function dossier(notes: string): string {
  return `---
type: dossier
status: draft
locale: en
brief: ./brief.md
---

# Budget {#budget}

## Why it forgets {#why}

#### Voice script

1. **Forgetting** — budget, spending

### Spent attention {#spent}

#### Visual

master: basic-page · motion: none

#### Speaker notes

${notes}

#### Voice script

1. **Whole window** — read, share
`;
}

const ALL_REUSED = `# Research plan

## Research jobs

## Reuse

- Question 1: reuse AIE-0002, confidence contested, fresh until 2027-04-13.
- Question 2: reuse LLM-0001, confidence settled, fresh until 2027-04-19.
`;

const CITES_BOTH = `1. **Not the tool** — individuals miss the promised gain [AIE-0002].
   - research: AIE-0002
2. **Same prompt, new answer** — sampling makes output vary [LLM-0001].
   - research: LLM-0001`;

function findingsOf(files: Record<string, string>): { kind: string; message: string }[] {
  return checkStagingFolder(files, KNOWN, REVIEW_ASSET).map(({ kind, message }) => ({ kind, message }));
}

describe('success cases', () => {
  it('A Run whose every Research question already has a fresh answer writes no research and still cites each one', () => {
    // ARRANGE
    const files = { 'research-plan.md': ALL_REUSED, 'dossier.md': dossier(CITES_BOTH) };
    // ACT
    const findings = findingsOf(files);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names a question the plan reuses that no Speaker note cites', () => {
    // ARRANGE
    const notes = `1. **Not the tool** — individuals miss the promised gain [AIE-0002].
   - research: AIE-0002`;
    const files = { 'research-plan.md': ALL_REUSED, 'dossier.md': dossier(notes) };
    const expected = [
      {
        kind: 'speaker-note',
        message:
          'The research plan reuses LLM-0001 for question 2, which no Speaker note cites by `research: LLM-0001`; cite it where the Slide makes its claim, or retrieval should not have reused it.',
      },
    ];
    // ACT
    const findings = findingsOf(files);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('names a cited id the research plan does not name, and a marker with no research line', () => {
    // ARRANGE
    const notes = `${CITES_BOTH}
3. **Elsewhere** — another claim [AIE-0009].
   - research: AIE-0009
4. **Unbacked** — a claim [AIE-0003].
   - research: AIE-0009`;
    const files = { 'research-plan.md': ALL_REUSED, 'dossier.md': dossier(notes) };
    const expected = [
      {
        kind: 'speaker-note',
        message:
          'The Speaker notes of {#spent}: "**Unbacked** — a claim [AIE-0003]." cites [AIE-0003], which resolves to no nested source.',
      },
      {
        kind: 'speaker-note',
        message:
          'The Speaker notes of {#spent} cite AIE-0009, which the research plan neither reuses nor writes; the Dossier cites only the research the plan names.',
      },
    ];
    // ACT
    const findings = findingsOf(files);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lets a note cite a question a research job of this Run writes, before it is promoted', () => {
    // ARRANGE
    const plan = `# Research plan\n\n## Research jobs\n\n- new: AIE-0016__why-recall-degrades, question 1, informs llm-behaviour.\n`;
    const notes = `1. **Recall** — the middle goes quiet [AIE-0016].\n   - research: AIE-0016`;
    const files = { 'research-plan.md': plan, 'dossier.md': dossier(notes) };
    // ACT
    const findings = findingsOf(files);
    // ASSERT
    expect(findings).toEqual([]);
  });
});
