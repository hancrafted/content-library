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

- [Why onboard AI?](research/AIE/AIE-0001__onboard/research.md) — Onboard it.
- [Why brief AI?](research/AIE/AIE-0003__brief/research.md) — Brief it.

### Sales (SALES)

- [Why sell early?](research/SALES/SALES-0001__sell-early/research.md) — Sell early.
`;

function research(title: string, description: string): string {
  return `---\ntype: research\ntitle: '${title}'\ndescription: '${description}'\n---\n\n# ${title}\n`;
}

describe('promoteResearch', () => {
  describe('success cases', () => {
    it("lists a staged file under its category's heading, in number order", () => {
      // ARRANGE
      const staged = { 'AIE-0002__decompose': research('Why decompose?', 'Decompose it.') };
      const expected = `# LLM wiki

## Research

### AI Enablement (AIE)

- [Why onboard AI?](research/AIE/AIE-0001__onboard/research.md) — Onboard it.
- [Why decompose?](research/AIE/AIE-0002__decompose/research.md) — Decompose it.
- [Why brief AI?](research/AIE/AIE-0003__brief/research.md) — Brief it.

### Sales (SALES)

- [Why sell early?](research/SALES/SALES-0001__sell-early/research.md) — Sell early.
`;
      const move = { folder: 'AIE-0002__decompose', to: 'research/AIE/AIE-0002__decompose' };

      // ACT
      const promoted = promoteResearch({ index: INDEX, glossary: GLOSSARY, research: staged });

      // ASSERT
      expect(promoted.index).toBe(expected);
      expect(promoted.moves).toEqual([move]);
    });

    it('opens a missing category under the heading the glossary names, in alphabetical order', () => {
      // ARRANGE
      const staged = { 'LLM-0001__resends-chat': research('Why resend the chat?', 'It keeps no state.') };
      const expected = `### Large language models (LLM)

- [Why resend the chat?](research/LLM/LLM-0001__resends-chat/research.md) — It keeps no state.

### Sales (SALES)`;

      // ACT
      const promoted = promoteResearch({ index: INDEX, glossary: GLOSSARY, research: staged });

      // ASSERT
      expect(promoted.index).toContain(expected);
    });
  });

  describe('failure cases', () => {
    it('refuses a staged folder the llm-wiki already holds, so nothing is overwritten', () => {
      // ARRANGE
      const staged = { 'AIE-0003__brief': research('Why brief AI?', 'Brief it again.') };
      const message = 'AIE-0003__brief is already in the llm-wiki';

      // ACT
      const promote = () => promoteResearch({ index: INDEX, glossary: GLOSSARY, research: staged });

      // ASSERT
      expect(promote).toThrow(message);
    });

    it('refuses a category the glossary does not name, so no heading is invented', () => {
      // ARRANGE
      const staged = { 'ORG-0001__tacit': research('Why is know-how tacit?', 'Nobody writes it down.') };
      const message = 'ORG-0001__tacit has category ORG, which GLOSSARY.md does not name';

      // ACT
      const promote = () => promoteResearch({ index: INDEX, glossary: GLOSSARY, research: staged });

      // ASSERT
      expect(promote).toThrow(message);
    });
  });

  describe('edge cases', () => {
    it('copies a description folded across frontmatter lines as the one line it parses to', () => {
      // ARRANGE
      const markdown = `---\ntitle: 'Why resend?'\ndescription: 'The model keeps no state,\n  so each message carries the chat.'\n---\n`;
      const line =
        '- [Why resend?](research/AIE/AIE-0002__resend/research.md) — The model keeps no state, so each message carries the chat.';

      // ACT
      const promoted = promoteResearch({
        index: INDEX,
        glossary: GLOSSARY,
        research: { 'AIE-0002__resend': markdown },
      });

      // ASSERT
      expect(promoted.index.split('\n')).toContain(line);
    });

    it('returns the index unchanged when the Run staged no research', () => {
      // ARRANGE
      const staged = {};

      // ACT
      const promoted = promoteResearch({ index: INDEX, glossary: GLOSSARY, research: staged });

      // ASSERT
      expect(promoted).toEqual({ moves: [], index: INDEX });
    });
  });
});
