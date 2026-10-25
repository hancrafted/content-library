import { loadContentStore } from '@/lib/content-store.pure';
import { CONCEPT_THEMES } from '@/lib/episode-overview';
import { pageLocales, PAGES, routeOf } from '@/lib/routes';
import { describe, expect, it } from 'vitest';
import { contentStore, rawContent } from './content-store';

/*
 * The content store against the records the site renders today: it returns them all, and a broken copy is refused
 * by name instead of throwing.
 */

describe('success cases', () => {
  it('returns the same Episodes, Events, Playlists and research records the site renders, and the seven top Concepts', () => {
    // ARRANGE
    const expected = {
      episodes: [
        'maintaining-markdown-for-ai',
        'ai-token-economy',
        'never-too-early-sales',
        'onboard-ai-every-time',
        'ai-attention-span',
        'ai-gives-you-more-work',
        'axel-agentic-workflow-agenda',
      ],
      concepts: [
        'agentic-ai',
        'ai-adoption',
        'ai-cost',
        'context-engineering',
        'llm-behaviour',
        'markdown-documentation',
        'sales',
      ],
      events: ['2026-10-23-axel-agentic-workflow'],
      playlists: ['axel-agentic-workflow'],
      researchCount: 37,
    };
    // ACT
    const store = contentStore();
    // ASSERT
    expect({
      episodes: store.episodes.map(({ slug }) => slug),
      concepts: store.concepts.map(({ id }) => id),
      events: store.events.map(({ slug }) => slug),
      playlists: store.playlists.map(({ id }) => id),
      researchCount: store.research.length,
    }).toEqual(expected);
  });

  it('returns each Episode exactly as its own metadata file declares it', () => {
    // ARRANGE
    const expected = rawContent().episodes;
    // ACT
    const episodes = contentStore().episodes;
    // ASSERT
    expect(episodes).toEqual(expected);
  });

  it('returns a source for every one a Speaker note cites', () => {
    // ARRANGE
    const expectedAtLeast = 100;
    // ACT
    const count = contentStore().slideSources.length;
    // ASSERT
    expect(count).toBeGreaterThan(expectedAtLeast);
  });

  it('A Concept page exists at /concepts/<id> for each of the seven', () => {
    // ARRANGE
    const expected = [
      '/concepts/agentic-ai en',
      '/concepts/ai-adoption en',
      '/concepts/ai-cost en',
      '/concepts/context-engineering en',
      '/concepts/llm-behaviour en',
      '/concepts/markdown-documentation en',
      '/concepts/sales en',
    ];
    const paged = new Map(PAGES.map((page) => [routeOf(page), pageLocales(page).join(' ')]));
    // ACT
    const pages = contentStore().concepts.map(({ id }) => `/concepts/${id} ${paged.get(`/concepts/${id}`)}`);
    // ASSERT
    expect(pages).toEqual(expected);
  });

  it('themes the cards by exactly the top Concepts the wiki holds', () => {
    // ARRANGE
    const expected = Object.keys(CONCEPT_THEMES).sort();
    // ACT
    const top = contentStore()
      .concepts.filter(({ broader }) => broader.length === 0)
      .map(({ id }) => id);
    // ASSERT
    expect(top).toEqual(expected);
  });

  it("gathers every Slide folder of every Episode, marking each Episode's Title slide", () => {
    // ARRANGE
    const expectedTitles = [
      'src/components/episodes/ai-attention-span/slides/hero',
      'src/components/episodes/ai-gives-you-more-work/slides/hero',
      'src/components/episodes/never-too-early-sales/slides/hero',
      'src/components/episodes/onboard-ai-every-time/slides/hero',
      'src/components/episodes/page-template/slides/hero',
    ];
    const expectedSlide = {
      path: 'src/components/episodes/onboard-ai-every-time/slides/one-prompt',
      slug: 'one-prompt',
      title: false,
    };
    // ACT
    const slides = contentStore().slides;
    // ASSERT
    expect(slides.filter(({ title }) => title).map(({ path }) => path)).toEqual(expectedTitles);
    expect(slides).toContainEqual(expectedSlide);
  });
});

describe('failure cases', () => {
  it('keeps no Concept page whose Concept file is gone', () => {
    // ARRANGE
    const expected = contentStore().concepts.map(({ id }) => `/concepts/${id}`);
    // ACT
    const pages = PAGES.map(routeOf).filter((route) => route.startsWith('/concepts/'));
    // ASSERT
    expect(pages).toEqual(expected);
  });

  it('names the research file whose frontmatter is broken, without throwing', () => {
    // ARRANGE
    const raw = rawContent();
    const [first, ...rest] = raw.research;
    const broken = {
      ...raw,
      research: [{ ...first, markdown: first.markdown.replace('type: research', 'type: note') }, ...rest],
    };
    const expected = { kind: 'research', record: first.path };
    // ACT
    const result = loadContentStore(broken);
    // ASSERT
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.refusals[0]).toMatchObject(expected);
  });
});

describe('edge cases', () => {
  it('loads the store once, so every caller reads the same records', () => {
    // ARRANGE
    const first = contentStore();
    // ACT
    const second = contentStore();
    // ASSERT
    expect(second).toBe(first);
  });
});
