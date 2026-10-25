import { describe, expect, it } from 'vitest';
import { loadContentStore, type RawContent } from './content-store.pure';

/*
 * Speaker note citations through the content store (design-ADR 0016, Citations rules 7, 8 and 12): each source item
 * holds exactly one of a Research question id or a URL; a cited id must exist; a published Episode cites no research
 * that is still in Staging.
 */

const WIKI_FOLDER = 'docs/llm-wiki/research/SALES/SALES-0001__b2b-sales-cycle-length';
const STAGED_FOLDER = 'docs/episodes/never-too-early-sales/research/SALES-0007__staged-question';

function research(folder: string) {
  return {
    path: `${folder}/research.md`,
    markdown: [
      '---',
      'type: research',
      "title: 'Why does it happen?'",
      "description: 'Because it does.'",
      'confidence: contested',
      "confidence_reason: 'The Sources disagree.'",
      'informs: [sales]',
      'generated:',
      '  by: claude-code/opus-5.5',
      '  at: 2026-10-13T00:00:00Z',
      'sources:',
      '  - id: 1',
      '    resource: https://a.example/x',
      "    title: 'A'",
      '---',
      '',
      'It does [1].',
    ].join('\n'),
  };
}

const SALES = {
  path: 'docs/llm-wiki/concepts/sales/concept.md',
  markdown: [
    '---',
    'type: concept',
    "title: 'Sales'",
    "description: 'Winning paying customers.'",
    'broader: []',
    'generated:',
    '  by: someone',
    '  at: 2026-10-25T00:00:00Z',
    '---',
    '',
    'Sales is winning paying customers.',
  ].join('\n'),
};

const PUBLISHED = {
  slug: 'never-too-early-sales',
  type: 'standard',
  visibility: 'public',
  status: 'published',
  format: 'foundations',
  concepts: ['sales'],
  applyThemeFromConcept: 'sales',
  publishedOn: '2026-10-19',
};

const AT = { episode: 'never-too-early-sales', slide: 'pipeline', note: 'intro' };

const VALID: RawContent = {
  themes: { sales: { icon: 'handshake', accent: 'emerald' } },
  concepts: [SALES],
  definitionSlides: [],
  episodeSlides: [],
  episodes: [PUBLISHED],
  events: [],
  playlists: [],
  research: [research(WIKI_FOLDER), research(STAGED_FOLDER)],
  slideSources: [
    { ...AT, slug: 'cycle', research: 'SALES-0001' },
    { ...AT, slug: 'docs', url: 'https://docs.anthropic.com/x' },
  ],
  slides: [],
  researchPlans: [],
};

function refusalsOf(raw: RawContent) {
  const result = loadContentStore(raw);
  return result.ok ? [] : result.refusals.map(({ kind, record, message }) => ({ kind, record, message }));
}

describe('success cases', () => {
  it('loads a source item that cites a Research question and one that cites a URL', () => {
    // ARRANGE
    const expected = [
      { slug: 'cycle', research: 'SALES-0001' },
      { slug: 'docs', url: 'https://docs.anthropic.com/x' },
    ];
    // ACT
    const result = loadContentStore(VALID);
    // ASSERT
    expect(result.ok && result.store.slideSources).toMatchObject(expected);
  });
});

describe('failure cases', () => {
  it.each([
    ['both research and url', { research: 'SALES-0001', url: 'https://docs.anthropic.com/x' }],
    ['neither research nor url', {}],
  ])('A source item with both research and url, or neither, fails: %s', (_, fields) => {
    // ARRANGE
    const raw = { ...VALID, slideSources: [{ ...AT, slug: 'cycle', ...fields }] };
    const expected = { kind: 'slide-source', record: 'cycle' };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toHaveLength(1);
    expect(refusals[0]).toMatchObject(expected);
    expect(refusals[0].message).toMatch(/exactly one of research or url/);
  });

  it('A Speaker note that cites a Research question that does not exist fails', () => {
    // ARRANGE
    const raw = { ...VALID, slideSources: [{ ...AT, slug: 'cycle', research: 'SALES-0099' }] };
    const expected = [
      {
        kind: 'slide-source',
        record: 'never-too-early-sales/pipeline/intro/cycle',
        message: 'research names SALES-0099, which is no Research question',
      },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });

  it('A published Episode that cites research still in staging fails', () => {
    // ARRANGE
    const raw = { ...VALID, slideSources: [{ ...AT, slug: 'staged', research: 'SALES-0007' }] };
    const expected = [
      {
        kind: 'slide-source',
        record: 'never-too-early-sales/pipeline/intro/staged',
        message: 'the published Episode cites SALES-0007, which is still in Staging: promote it before publishing',
      },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lets a Speaker note cite staged research while its Episode is not published', () => {
    // ARRANGE
    const raw = {
      ...VALID,
      slideSources: [{ ...AT, episode: 'a-run-in-progress', slug: 'staged', research: 'SALES-0007' }],
    };
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual([]);
  });
});
