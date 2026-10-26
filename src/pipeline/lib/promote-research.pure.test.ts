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

function research(title: string, description: string): string {
  return `---\ntype: research\ntitle: '${title}'\ndescription: '${description}'\n---\n\n# ${title}\n`;
}

function promote(staged: Record<string, string | null>, index = INDEX, wiki = WIKI) {
  return promoteResearch({ index, glossary: GLOSSARY, wiki, research: staged });
}
describe('success cases', () => {
  describe('promoteResearch', () => {
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
});

describe('failure cases', () => {
  describe('promoteResearch', () => {
    it('refuses a research ID the llm-wiki already holds, even under another slug', () => {
      // ARRANGE
      const staged = { 'AIE-0003__written-requirements-reduce': research('Why write it down?', 'Write it.') };
      const message = 'The research ID AIE-0003 names 2 folders';

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
      const message = `${folder} is already in the llm-wiki`;

      // ACT
      const attempt = () => promote(staged, INDEX, wiki);

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
      const attempt = () => promote(staged, index);

      // ASSERT
      expect(attempt).toThrow(message);
    });
  });
});

describe('edge cases', () => {
  describe('promoteResearch', () => {
    it('copies a description folded across frontmatter lines as the one line it parses to', () => {
      // ARRANGE
      const folder = 'AIE-0002__llm-resends-the-whole-chat';
      const markdown = `---\ntitle: 'Why resend?'\ndescription: 'The model keeps no state,\n  so each message carries the chat.'\n---\n`;
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
      const promoted = promote(staged, index, []);

      // ASSERT
      expect(promoted.index).toBe(expected);
    });

    it('returns the index unchanged when the Run staged no research', () => {
      // ARRANGE
      const staged = {};

      // ACT
      const promoted = promote(staged);

      // ASSERT
      expect(promoted).toEqual({ moves: [], index: INDEX });
    });
  });
});
