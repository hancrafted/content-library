import { describe, expect, it } from 'vitest';
import { nextFreeId, researchCatalogue, type CatalogueEntry } from './research-catalogue.pure';

/*
 * What retrieval and categorize-research read instead of the folders (design-ADR 0016, Pipeline and evidence rules 1
 * to 3): every Research question of the wiki and of every Staging, narrowed by a Concept, each with its confidence and
 * whether it is still fresh; and the next free id of a prefix across both.
 */

const TODAY = '2026-10-25';

const WIKI_ONE: CatalogueEntry = {
  id: 'LLM-0001',
  path: 'docs/llm-wiki/research/LLM/LLM-0001__llm-output-nondeterminism/research.md',
  title: 'Why do large language models give different answers to the same prompt?',
  description: 'Sampling makes the output vary.',
  confidence: 'settled',
  informs: ['llm-behaviour'],
  stale_after: '2027-04-19T00:00:00Z',
  staged: false,
};

const STAGED_ONE: CatalogueEntry = {
  id: 'AIE-0014',
  path: 'docs/episodes/ai-gives-you-more-work/research/AIE-0014__llm-non-deterministic-output/research.md',
  title: 'Why do language models produce different output each time?',
  description: 'Sampling, again.',
  confidence: 'open',
  informs: ['llm-behaviour'],
  stale_after: '2027-04-19T00:00:00Z',
  staged: true,
};

const STALE_ONE: CatalogueEntry = {
  id: 'SALES-0001',
  path: 'docs/llm-wiki/research/SALES/SALES-0001__b2b-sales-cycle-length/research.md',
  title: 'Why do typical B2B sales cycles take as long as they do?',
  description: 'Committees.',
  confidence: 'contested',
  informs: ['sales'],
  stale_after: '2026-10-01T00:00:00Z',
  staged: false,
};

const ALL = [WIKI_ONE, STAGED_ONE, STALE_ONE];

describe('success cases', () => {
  it('lists the questions of the wiki and of every Staging that inform a Concept, with confidence and freshness', () => {
    // ARRANGE
    const expected = [
      `LLM-0001 · settled · fresh until 2027-04-19 · informs llm-behaviour · wiki\n  Why do large language models give different answers to the same prompt?\n  Sampling makes the output vary.\n  ${WIKI_ONE.path}`,
      `AIE-0014 · open · fresh until 2027-04-19 · informs llm-behaviour · staged in ai-gives-you-more-work\n  Why do language models produce different output each time?\n  Sampling, again.\n  ${STAGED_ONE.path}`,
    ];
    // ACT
    const listing = researchCatalogue(ALL, { concept: 'llm-behaviour', today: TODAY });
    // ASSERT
    expect(listing).toEqual(expected);
  });

  it('takes the next free number of a prefix across the wiki and every Staging', () => {
    // ARRANGE
    const ids = ['AIE-0001', 'AIE-0013', 'LLM-0010', 'AIE-0014', 'AIE-0002'];
    const expected = 'AIE-0015';
    // ACT
    const next = nextFreeId('AIE', ids);
    // ASSERT
    expect(next).toBe(expected);
  });
});

describe('failure cases', () => {
  it('marks a question past its stale_after as stale, a refresh and not a reuse', () => {
    // ARRANGE
    const expectedHead = 'SALES-0001 · contested · stale since 2026-10-01 · informs sales · wiki';
    // ACT
    const listing = researchCatalogue(ALL, { concept: 'sales', today: TODAY });
    // ASSERT
    expect(listing).toHaveLength(1);
    expect(listing[0].split('\n')[0]).toBe(expectedHead);
  });

  it('refuses a prefix that is not upper-case letters', () => {
    // ARRANGE
    const expected =
      'The prefix "aie-1" is not upper-case letters, the part before the dash of a Research question id.';
    // ACT
    const attempt = () => nextFreeId('aie-1', []);
    // ASSERT
    expect(attempt).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('lists every question when no Concept narrows it, and starts a prefix nobody used at 0001', () => {
    // ARRANGE
    const expected = { count: 3, next: 'COG-0001' };
    // ACT
    const listing = researchCatalogue(ALL, { today: TODAY });
    const next = nextFreeId('COG', ['AIE-0001']);
    // ASSERT
    expect({ count: listing.length, next }).toEqual(expected);
  });
});
