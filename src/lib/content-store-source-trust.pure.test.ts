import { describe, expect, it } from 'vitest';
import { loadContentStore, type RawContent } from './content-store.pure';

/*
 * A Speaker note cites a Source directly only when it is high trust (design-ADR 0016, Citations rules 8, 9 and 13):
 * its host is on the allowlist, or the source is grandfathered in the Source baseline, which may only shrink.
 */

const AT = { episode: 'never-too-early-sales', slide: 'pipeline', note: 'intro' };
const RECORD = 'never-too-early-sales/pipeline/intro';

const VALID: RawContent = {
  themes: {},
  concepts: [],
  definitionSlides: [],
  episodeSlides: [],
  episodes: [],
  events: [],
  playlists: [],
  research: [],
  slideSources: [{ ...AT, slug: 'docs', url: 'https://docs.anthropic.com/en/docs/context-windows' }],
  sourceBaseline: [],
  slides: [],
  researchPlans: [],
};

function refusalsOf(raw: RawContent) {
  const result = loadContentStore(raw);
  return result.ok ? [] : result.refusals.map(({ kind, record, message }) => ({ kind, record, message }));
}

function withSource(url: string, sourceBaseline: RawContent['sourceBaseline'] = []): RawContent {
  return { ...VALID, slideSources: [{ ...AT, slug: 'claim', url }], sourceBaseline };
}

describe('success cases', () => {
  it.each([
    ['Anthropic documentation', 'https://docs.anthropic.com/en/docs/context-windows'],
    ['Claude documentation', 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching'],
    ['the law itself', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj'],
    ['a paper by DOI', 'https://doi.org/10.1145/3442188.3445922'],
    ['a preprint', 'https://arxiv.org/abs/2307.03172'],
    ['a working paper', 'https://www.nber.org/papers/w31161'],
    ['a journal article', 'https://www.aeaweb.org/articles?id=10.1257/jep.29.3.3'],
  ])('lets a Speaker note cite a high-trust Source directly: %s', (_, url) => {
    // ARRANGE
    const raw = withSource(url);
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual([]);
  });

  it('lets a grandfathered source in the baseline pass', () => {
    // ARRANGE
    const url = 'https://hbr.org/2023/05/a-practitioner-essay';
    const raw = withSource(url, [{ source: `${RECORD}/claim`, url }]);
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual([]);
  });
});

describe('failure cases', () => {
  it("A new Speaker note source from a blog fails; one from Anthropic's documentation passes", () => {
    // ARRANGE
    const raw = {
      ...VALID,
      slideSources: [
        { ...AT, slug: 'blog', url: 'https://paulgraham.com/startupideas.html' },
        { ...AT, slug: 'docs', url: 'https://docs.anthropic.com/en/docs/context-windows' },
      ],
    };
    const expected = [
      {
        kind: 'slide-source',
        record: `${RECORD}/blog`,
        message:
          'https://paulgraham.com/startupideas.html is no high-trust Source and not in the Source baseline: cite a Research question that weighs it',
      },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toEqual(expected);
  });

  it('A look-alike host such as docs.anthropic.com.evil.example is not trusted', () => {
    // ARRANGE
    const lookAlikes = [
      'https://docs.anthropic.com.evil.example/en/docs',
      'https://evilanthropic.com/docs',
      'https://docs.anthropic.com@evil.example/docs',
      'http://docs.anthropic.com/en/docs',
    ];
    const expected = lookAlikes.map(() => ({ kind: 'slide-source', record: `${RECORD}/claim` }));
    // ACT
    const refusals = lookAlikes.flatMap((url) => refusalsOf(withSource(url)));
    // ASSERT
    expect(refusals).toMatchObject(expected);
  });

  it('Fixing a grandfathered source removes it from the baseline, and a baseline entry for a source that is gone fails', () => {
    // ARRANGE
    const grandfathered = 'https://hbr.org/2023/05/a-practitioner-essay';
    const fixed = { ...VALID, slideSources: [{ ...AT, slug: 'claim', research: 'SALES-0001' }] };
    const raw = { ...fixed, sourceBaseline: [{ source: `${RECORD}/claim`, url: grandfathered }] };
    const expected = [
      {
        kind: 'source-baseline',
        record: `${RECORD}/claim`,
        message: `no Speaker note cites ${grandfathered} here any more: delete the entry from src/lib/source-baseline.json`,
      },
    ];
    // ACT
    const refusals = refusalsOf(raw).filter(({ kind }) => kind === 'source-baseline');
    // ASSERT
    expect(refusals).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lets no baseline entry vouch for another url at the same place', () => {
    // ARRANGE
    const raw = withSource('https://steveblank.com/a-new-essay', [
      { source: `${RECORD}/claim`, url: 'https://steveblank.com/the-old-essay' },
    ]);
    const expected = [
      { kind: 'slide-source', record: `${RECORD}/claim` },
      { kind: 'source-baseline', record: `${RECORD}/claim` },
    ];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toMatchObject(expected);
  });

  it('refuses a baseline entry for a source that is already high trust, since it grandfathers nothing', () => {
    // ARRANGE
    const url = 'https://arxiv.org/abs/2307.03172';
    const raw = withSource(url, [{ source: `${RECORD}/claim`, url }]);
    const expected = [{ kind: 'source-baseline', record: `${RECORD}/claim` }];
    // ACT
    const refusals = refusalsOf(raw);
    // ASSERT
    expect(refusals).toMatchObject(expected);
  });
});
