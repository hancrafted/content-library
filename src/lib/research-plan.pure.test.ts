import { describe, expect, it } from 'vitest';
import { checkResearchPlan, readResearchPlan, type ResearchPlanContext } from './research-plan.pure';

/*
 * The research plan retrieval writes, checked against the Research questions of the wiki and every Staging
 * (design-ADR 0016, Pipeline and evidence rules 1 to 6): a reuse names a question that exists, a new or migrate job
 * names the Concepts it informs and a free id, a refresh writes the stale question's own id.
 */

const STAGING = 'docs/episodes/demo';
const FILE = `${STAGING}/research-plan.md`;

const CONTEXT: ResearchPlanContext = {
  staging: STAGING,
  research: [
    { id: 'AIE-0002', path: 'docs/llm-wiki/research/AIE/AIE-0002__why-a-third-claim-holds-up/research.md' },
    { id: 'LLM-0001', path: 'docs/llm-wiki/research/LLM/LLM-0001__llm-output-varies/research.md' },
    {
      id: 'AIE-0014',
      path: 'docs/episodes/ai-gives-you-more-work/research/AIE-0014__llm-non-deterministic-output/research.md',
    },
  ],
  concepts: ['agentic-ai', 'llm-behaviour', 'context-engineering'],
};

function plan(jobs: readonly string[], reuse: readonly string[] = []): string {
  const reuseSection = reuse.length === 0 ? '' : `\n## Reuse\n\n${reuse.map((line) => `- ${line}`).join('\n')}\n`;
  return `# Research plan\n\n## Research jobs\n\n${jobs.map((line) => `- ${line}`).join('\n')}\n${reuseSection}`;
}

function messages(markdown: string, context: ResearchPlanContext = CONTEXT): string[] {
  return checkResearchPlan(FILE, markdown, context).map(({ message }) => message);
}

describe('success cases', () => {
  it('finds nothing in a plan whose jobs name their Concepts and whose reuses name existing questions', () => {
    // ARRANGE
    const markdown = plan(
      ['new: AIE-0016__why-recall-degrades, question 1, informs context-engineering, llm-behaviour.'],
      ['Question 2: reuse AIE-0002, confidence contested, fresh until 2027-04-01.'],
    );
    // ACT
    const findings = messages(markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });
  it("A Brief question that another Run's Staging already answers is reused, not written again", () => {
    // ARRANGE
    const markdown = plan([], ['Question 1: reuse AIE-0014, confidence open, fresh until 2027-04-19.']);
    // ACT
    const findings = messages(markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('A refreshed question keeps its id: a refresh writing the stale id passes', () => {
    // ARRANGE
    const markdown = plan(['refresh: LLM-0001__llm-output-varies, question 1, refreshes LLM-0001.']);
    // ACT
    const findings = messages(markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('reads a migrate job, the Slide its notes sit on and the Concepts it informs', () => {
    // ARRANGE
    const markdown = plan(['migrate: AIE-0016__why-the-old-claim-holds, onboarding, informs agentic-ai.']);
    const expected = [
      { kind: 'migrate', folder: 'AIE-0016__why-the-old-claim-holds', slide: 'onboarding', informs: ['agentic-ai'] },
    ];
    // ACT
    const items = readResearchPlan(markdown);
    // ASSERT
    expect(items).toEqual(expected);
    expect(messages(markdown)).toEqual([]);
  });
});

describe('failure cases', () => {
  it('refuses a new job for a question another Staging already holds, so it is reused, not written again', () => {
    // ARRANGE
    const markdown = plan(['new: AIE-0014__llm-output-differs, question 1, informs llm-behaviour.']);
    const expected = [
      'The research job "new: AIE-0014__llm-output-differs, question 1, informs llm-behaviour." writes AIE-0014, which docs/episodes/ai-gives-you-more-work/research/AIE-0014__llm-non-deterministic-output/research.md already holds: reuse that question, or take the next free number.',
    ];
    // ACT
    const findings = messages(markdown);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('refuses a refresh that takes a new number instead of the stale id, which would orphan the notes citing it', () => {
    // ARRANGE
    const markdown = plan(['refresh: LLM-0011__llm-output-varies, question 1, refreshes LLM-0001.']);
    const expected = [
      '"refresh: LLM-0011__llm-output-varies, question 1, refreshes LLM-0001." writes LLM-0011, not the stale id LLM-0001: a refresh keeps the id, so every note citing it still resolves.',
    ];
    // ACT
    const findings = messages(markdown);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('refuses a reuse of an id no Research question has, and one that does not name its confidence and freshness', () => {
    // ARRANGE
    const markdown = plan(
      [],
      ['Question 1: reuse AIE-0099, confidence open, fresh until 2027-01-01.', 'Question 2: reuse AIE-0002.'],
    );
    const expected = [
      '"Question 1: reuse AIE-0099, confidence open, fresh until 2027-01-01." reuses AIE-0099, which no Research question in the wiki or any Staging has.',
      '"Question 2: reuse AIE-0002." names no confidence or no fresh-until date; write `, confidence <value>, fresh until <date>` from the question\'s frontmatter.',
    ];
    // ACT
    const findings = messages(markdown);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('refuses a job that informs an id that is no Concept', () => {
    // ARRANGE
    const markdown = plan(['new: AIE-0016__why-recall-degrades, question 1, informs memory.']);
    const expected = [
      'The research job "new: AIE-0016__why-recall-degrades, question 1, informs memory." informs memory, which is no Concept.',
    ];
    // ACT
    const findings = messages(markdown);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('A research plan item with no Concepts it informs fails', () => {
    // ARRANGE
    const markdown = plan([
      'new: AIE-0016__why-recall-degrades, question 1.',
      'migrate: AIE-0017__why-the-old-claim-holds, onboarding.',
    ]);
    const expected = [
      'The research job "new: AIE-0016__why-recall-degrades, question 1." names no Concept it informs; end it with `informs <concept-id>, …`, the main Concept first.',
      'The research job "migrate: AIE-0017__why-the-old-claim-holds, onboarding." names no Concept it informs; end it with `informs <concept-id>, …`, the main Concept first.',
    ];
    // ACT
    const findings = messages(markdown);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('accepts a plan with no research job, every question reused: an empty Research Stage is normal', () => {
    // ARRANGE
    const markdown = plan([], ['Question 1: reuse AIE-0002, confidence contested, fresh until 2027-04-13.']);
    // ACT
    const findings = messages(markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts a new job writing its own folder, already staged in this Run', () => {
    // ARRANGE
    const own = { id: 'AIE-0016', path: `${STAGING}/research/AIE-0016__why-recall-degrades/research.md` };
    const markdown = plan(['new: AIE-0016__why-recall-degrades, question 1, informs agentic-ai.']);
    // ACT
    const findings = messages(markdown, { ...CONTEXT, research: [...CONTEXT.research, own] });
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('names an item of no known form, a reuse listed as a job included', () => {
    // ARRANGE
    const markdown = plan(['Question 1: reuse AIE-0002, confidence open, fresh until 2027-04-13.']);
    const expectedStart = '"Question 1: reuse AIE-0002, confidence open, fresh until 2027-04-13." is none of';
    // ACT
    const findings = messages(markdown);
    // ASSERT
    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain(expectedStart);
  });
});
