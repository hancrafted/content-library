import { loadContentStore } from '@/lib/content-store.pure';
import { describe, expect, it } from 'vitest';
import { contentStore, rawContent } from './content-store';

/*
 * The content store against the records the site renders today: it returns them all, and a broken copy is refused
 * by name instead of throwing.
 */

describe('success cases', () => {
  it('returns the same Episodes, Tags, Workshop and research records the site renders today', () => {
    // ARRANGE
    const expected = {
      episodes: [
        'maintaining-markdown-for-ai',
        'ai-token-economy',
        'never-too-early-sales',
        'onboard-ai-every-time',
        'ai-attention-span',
        'ai-gives-you-more-work',
      ],
      tags: ['context-engineering', 'agentic-ai', 'markdown', 'cost', 'sales', 'workflow'],
      workshops: ['axel-agentic-workflow-2026-10-23'],
      researchCount: 37,
    };
    // ACT
    const store = contentStore();
    // ASSERT
    expect({
      episodes: store.episodes.map(({ slug }) => slug),
      tags: Object.keys(store.tags),
      workshops: store.workshops.map(({ slug }) => slug),
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
