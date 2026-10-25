import { describe, expect, it } from 'vitest';
import { promoteResearch } from './promote-research.pure.ts';

const GLOSSARY = `## Research categories

**AIE**: AI Enablement: how people learn to work with AI.

**LLM**: Large language models: how a model works.

**SALES**: Sales: how a company wins customers.

## Localization
`;

const INDEX = `# LLM wiki

## Research

### AI Enablement (AIE)

- [Why onboard AI?](research/AIE/AIE-0001__ai-as-onboarding-a-colleague/research.md) — Onboard it.
- [Why brief AI?](research/AIE/AIE-0003__context-and-brief-improve-output/research.md) — Brief it.

### Sales (SALES)

- [Why sell early?](research/SALES/SALES-0001__b2b-sales-cycle-length/research.md) — Sell early.
`;

const WIKI = [
  'docs/llm-wiki/research/AIE/AIE-0001__ai-as-onboarding-a-colleague',
  'docs/llm-wiki/research/AIE/AIE-0003__context-and-brief-improve-output',
  'docs/llm-wiki/research/SALES/SALES-0001__b2b-sales-cycle-length',
];

const STAGING = 'docs/episodes/ai-gives-you-more-work';
const CONCEPTS = ['agentic-ai', 'ai-adoption', 'llm-behaviour'];
const CONFIRMED = 'verified:\n  by: human:han\n  at: 2026-10-20T09:00:00Z\n';

/** A research file that passes the research schema; Han has confirmed it unless `verified` says otherwise. */
function research(title: string, description: string, { verified = CONFIRMED, informs = 'agentic-ai' } = {}): string {
  return [
    '---',
    'type: research',
    `title: '${title}'`,
    `description: '${description}'`,
    'confidence: open',
    "confidence_reason: 'One study only.'",
    `informs: [${informs}]`,
    'generated:',
    '  by: claude-code/opus-5.5',
    '  at: 2026-10-19T18:00:00Z',
    `${verified}sources:`,
    '  - id: 1',
    '    resource: https://arxiv.org/abs/2503.14499',
    "    title: 'Kwa et al., Measuring AI Ability'",
    '---',
    '',
    `# ${title}`,
    '',
  ].join('\n');
}

/** A narrower Concept a Run staged; Han has accepted it unless `verified` says otherwise. */
function concept(title: string, { verified = CONFIRMED } = {}): string {
  return [
    '---',
    'type: concept',
    `title: '${title}'`,
    `description: '${title}, scoped against its neighbours.'`,
    'broader: [llm-behaviour]',
    'generated:',
    '  by: claude-code/opus-5.5',
    '  at: 2026-10-19T18:00:00Z',
    `${verified}---`,
    '',
    `# ${title}`,
    '',
  ].join('\n');
}

interface Around {
  index?: string;
  wiki?: string[];
  plan?: string | null;
  stagedConcepts?: Record<string, string | null>;
}

function promote(staged: Record<string, string | null>, around: Around = {}) {
  const { index = INDEX, wiki = WIKI, plan = null, stagedConcepts = {} } = around;
  return promoteResearch({
    index,
    glossary: GLOSSARY,
    wiki,
    research: staged,
    staging: STAGING,
    plan,
    concepts: CONCEPTS,
    stagedConcepts,
  });
}

describe('promoteResearch', () => {
  describe('success cases', () => {
    it("lists a staged file under its category's heading, in number order", () => {
      // ARRANGE
      const folder = 'AIE-0002__task-decomposition-improves';
      const staged = { [folder]: research('Why decompose?', 'Decompose it.') };
      const expected = `# LLM wiki

## Research

### AI Enablement (AIE)

- [Why onboard AI?](research/AIE/AIE-0001__ai-as-onboarding-a-colleague/research.md) — Onboard it.
- [Why decompose?](research/AIE/AIE-0002__task-decomposition-improves/research.md) — Decompose it.
- [Why brief AI?](research/AIE/AIE-0003__context-and-brief-improve-output/research.md) — Brief it.

### Sales (SALES)

- [Why sell early?](research/SALES/SALES-0001__b2b-sales-cycle-length/research.md) — Sell early.
`;
      const move = { folder, to: `research/AIE/${folder}` };

      // ACT
      const promoted = promote(staged);

      // ASSERT
      expect(promoted.index).toBe(expected);
      expect(promoted.moves).toEqual([move]);
    });

    it('replaces the wiki question a refresh in the research plan lists, keeping its id', () => {
      // ARRANGE
      const folder = 'AIE-0003__context-and-brief-improve-output';
      const staged = { [folder]: research('Why brief AI now?', 'Brief it well.') };
      const plan = `# Research plan\n\n## Research jobs\n\n- refresh: ${folder}, question 1, refreshes AIE-0003\n\n## Reuse\n`;
      const line = `- [Why brief AI now?](research/AIE/${folder}/research.md) — Brief it well.`;

      // ACT
      const promoted = promote(staged, { plan });

      // ASSERT
      expect(promoted.removes).toEqual([`research/AIE/${folder}`]);
      expect(promoted.moves).toEqual([{ folder, to: `research/AIE/${folder}` }]);
      expect(promoted.index.split('\n')).toContain(line);
      expect(promoted.index).not.toContain('Why brief AI?]');
    });

    it('promotes a staged Concept Han accepted with the question that informs it', () => {
      // ARRANGE
      const folder = 'AIE-0014__llm-non-deterministic-output';
      const staged = { [folder]: research('Why vary?', 'Sampling.', { informs: 'sampling' }) };
      const stagedConcepts = { sampling: concept('Sampling') };

      // ACT
      const promoted = promote(staged, { stagedConcepts });

      // ASSERT
      expect(promoted.concepts).toEqual(['sampling']);
    });

    it('opens a missing category under the heading the glossary names, in alphabetical order', () => {
      // ARRANGE
      const staged = { 'LLM-0001__llm-resends-whole-chat': research('Why resend the chat?', 'It keeps no state.') };
      const expected = `### Large language models (LLM)

- [Why resend the chat?](research/LLM/LLM-0001__llm-resends-whole-chat/research.md) — It keeps no state.

### Sales (SALES)`;

      // ACT
      const promoted = promote(staged);

      // ASSERT
      expect(promoted.index).toContain(expected);
    });
  });

  describe('failure cases', () => {
    it('Promotion refuses a research question whose confidence Han has not confirmed', () => {
      // ARRANGE
      const folder = 'AIE-0014__llm-non-deterministic-output';
      const staged = { [folder]: research('Why vary?', 'Sampling.', { verified: '' }) };
      const message = `${folder}: Han has not confirmed its confidence and informs`;

      // ACT
      const attempt = () => promote(staged);

      // ASSERT
      expect(attempt).toThrow(message);
    });

    it('refuses a research question that informs no Concept the llm-wiki holds', () => {
      // ARRANGE
      const folder = 'AIE-0014__llm-non-deterministic-output';
      const staged = { [folder]: research('Why vary?', 'Sampling.', { informs: 'human-memory' }) };
      const message = `${folder}: informs names human-memory, which is no Concept`;

      // ACT
      const attempt = () => promote(staged);

      // ASSERT
      expect(attempt).toThrow(message);
    });

    it('refuses a staged Concept Han has not accepted', () => {
      // ARRANGE
      const stagedConcepts = { sampling: concept('Sampling', { verified: '' }) };
      const message = 'The staged Concept sampling: Han has not accepted it';

      // ACT
      const attempt = () => promote({}, { stagedConcepts });

      // ASSERT
      expect(attempt).toThrow(message);
    });

    it('refuses a research ID the llm-wiki already holds, even under another slug', () => {
      // ARRANGE
      const staged = { 'AIE-0003__written-requirements-reduce': research('Why write it down?', 'Write it.') };
      const message = 'AIE-0003 is in the llm-wiki, and the research plan lists no refresh of it';

      // ACT
      const attempt = () => promote(staged);

      // ASSERT
      expect(attempt).toThrow(message);
    });

    it('refuses a folder already on disk in the llm-wiki though the index does not list it', () => {
      // ARRANGE
      const folder = 'AIE-0004__checking-intermediate-steps';
      const staged = { [folder]: research('Why check steps?', 'Check them.') };
      const wiki = [...WIKI, `docs/llm-wiki/research/AIE/${folder}`];
      const message = 'AIE-0004 is in the llm-wiki, and the research plan lists no refresh of it';

      // ACT
      const attempt = () => promote(staged, { wiki });

      // ASSERT
      expect(attempt).toThrow(message);
    });

    it('refuses a category the glossary does not name, so no heading is invented', () => {
      // ARRANGE
      const staged = { 'ORG-0001__tacit-knowledge-onboarding': research('Why is know-how tacit?', 'Unwritten.') };
      const message = 'names the category ORG, which GLOSSARY.md does not list';

      // ACT
      const attempt = () => promote(staged);

      // ASSERT
      expect(attempt).toThrow(message);
    });

    it('refuses a staged folder with no research.md, so Staging deletion loses nothing silently', () => {
      // ARRANGE
      const staged = { 'AIE-0005__risks-of-unchecked-output': null };
      const message = 'AIE-0005__risks-of-unchecked-output holds no research.md';

      // ACT
      const attempt = () => promote(staged);

      // ASSERT
      expect(attempt).toThrow(message);
    });

    it('refuses an index with content after its category sections, so nothing is dropped', () => {
      // ARRANGE
      const index = `${INDEX}\n## Notes\n\nHand-written prose.\n`;
      const staged = { 'AIE-0002__task-decomposition-improves': research('Why decompose?', 'Decompose it.') };
      const message = 'index.md holds "## Notes" among its categories';

      // ACT
      const attempt = () => promote(staged, { index });

      // ASSERT
      expect(attempt).toThrow(message);
    });
  });

  describe('edge cases', () => {
    it('copies a description folded across frontmatter lines as the one line it parses to', () => {
      // ARRANGE
      const folder = 'AIE-0002__llm-resends-the-whole-chat';
      const markdown = research('Why resend?', 'The model keeps no state,\n  so each message carries the chat.');
      const line = `- [Why resend?](research/AIE/${folder}/research.md) — The model keeps no state, so each message carries the chat.`;

      // ACT
      const promoted = promote({ [folder]: markdown });

      // ASSERT
      expect(promoted.index.split('\n')).toContain(line);
    });

    it('opens the first category of an index that has none yet, keeping every line above it', () => {
      // ARRANGE
      const index = '# LLM wiki\n\n## Research\n';
      const staged = { 'SALES-0001__b2b-sales-cycle-length': research('Why so long?', 'Groups decide.') };
      const expected = `# LLM wiki

## Research

### Sales (SALES)

- [Why so long?](research/SALES/SALES-0001__b2b-sales-cycle-length/research.md) — Groups decide.
`;

      // ACT
      const promoted = promote(staged, { index, wiki: [] });

      // ASSERT
      expect(promoted.index).toBe(expected);
    });

    it('returns the index unchanged when the Run staged no research', () => {
      // ARRANGE
      const staged = {};

      // ACT
      const promoted = promote(staged);

      // ASSERT
      expect(promoted).toEqual({ moves: [], removes: [], concepts: [], index: INDEX });
    });
  });
});
