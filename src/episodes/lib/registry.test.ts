import { episodeRef, toolingRef } from '@/content-store/catalogue/episode-id.pure';
import { hasPage, isEpisodeId, TOOLING_SLUGS } from '@/content-store/catalogue/record-routes';
import { listEpisodes } from '@/content-store/store';
import { headerModeOf } from '@/episodes/components/slide-master/slide';
import { describe, expect, it } from 'vitest';
import { compositionOf } from './registry';

/*
 * The one composition lookup (FE-002): the Slides and own text a page renders, by the EpisodeRef of an Episode with a
 * page or the ref of a tooling page. What every registered Episode shares: a record under its Episode id carrying its folder's slug,
 * its own text from its folder's `i18n/` (what the Title slide, the page
 * metadata and the landing card read) and the Section list its Dossier fixes.
 * Every Episode comes from the Episode registry. The per-Episode facts in the tables below are written out by hand from
 * each published public Episode's Dossier, and every one has its rows, written at publication; an Episode still in the
 * pipeline gains Slides Section by Section, and an unlisted Episode is a copy made for one Event and left to drift
 * (product vision, rule 4), so neither has a fixed composition to pin.
 */

/** The published public Episodes, by id: the ones the tables below must cover, no more, no less. */
const PUBLISHED_PUBLIC = listEpisodes()
  .filter(({ ref, status, visibility }) => status === 'published' && visibility === 'public' && hasPage(ref))
  .map(({ ref }) => ref.id)
  .sort();

/** Every Episode with a page, by its EpisodeRef, as the store serves it. */
const WITH_PAGE = listEpisodes().flatMap(({ ref }) => (hasPage(ref) ? [ref] : []));

/** The Section openers and page-Slide counts each Episode composes, in Dossier (or approved Spec) order. */
const COMPOSITION = [
  {
    slug: 'ai-token-economy',
    sections: [
      { opener: 'motivation', pageSlides: 4 },
      { opener: 'what-is-a-token', pageSlides: 2 },
      { opener: 'managing-context', pageSlides: 2 },
      { opener: 'cost-of-agentic-ai', pageSlides: 1 },
      { opener: 'model-tiers', pageSlides: 0 },
      { opener: 'tools-and-tips', pageSlides: 0 },
    ],
  },
  {
    slug: 'maintaining-markdown-for-ai',
    sections: [
      { opener: 'markdown-in-ai-workflows', pageSlides: 0 },
      { opener: 'volume-outruns-review', pageSlides: 0 },
      { opener: 'where-the-effort-goes', pageSlides: 3 },
      { opener: 'google-okf', pageSlides: 0 },
      { opener: 'steering-the-ai', pageSlides: 3 },
      { opener: 'the-verifying-half-is-yours', pageSlides: 0 },
    ],
  },
  {
    slug: 'ai-gives-you-more-work',
    sections: [{ opener: 'from-execution-to-management', pageSlides: 3 }],
  },
  {
    slug: 'never-too-early-sales',
    sections: [
      { opener: 'why-watching-cashflow-is-mission-critical', pageSlides: 1 },
      { opener: 'why-sales-is-more-than-just-selling', pageSlides: 1 },
      { opener: 'how-to-start-doing-sales', pageSlides: 4 },
      { opener: 'why-building-an-effective-sales-pipeline-takes-time', pageSlides: 3 },
      { opener: 'start-before-you-need-the-money', pageSlides: 1 },
    ],
  },
  {
    slug: 'onboard-ai-every-time',
    sections: [
      { opener: 'the-thought-experiment', pageSlides: 3 },
      { opener: 'five-moves-to-brief-a-freelancer', pageSlides: 2 },
    ],
  },
  {
    // Section openers only until each Section job adds its page Slides at its placement marker.
    slug: 'ai-attention-span',
    sections: [
      { opener: 'thought-experiment', pageSlides: 2 },
      { opener: 'the-ais-attention-span', pageSlides: 4 },
      { opener: 'what-fills-the-window', pageSlides: 3 },
      { opener: 'managing-the-attention-span', pageSlides: 4 },
    ],
  },
] as const;

/** Who renders each Slide header (design-ADR-0012): the Slide wrapper (`shared`) or each Scene (`authored`). */
const HEADER_MODES = [
  { slug: 'ai-token-economy', header: 'authored' },
  { slug: 'maintaining-markdown-for-ai', header: 'authored' },
  { slug: 'never-too-early-sales', header: 'shared' },
  { slug: 'onboard-ai-every-time', header: 'shared' },
  { slug: 'ai-attention-span', header: 'shared' },
  { slug: 'ai-gives-you-more-work', header: 'shared' },
] as const;

describe('success cases', () => {
  it.each(WITH_PAGE)("registers $id with a record carrying its folder's slug", (ref) => {
    // ARRANGE
    const expectedSlug = ref.slug;
    // ACT
    const episode = compositionOf(ref);
    // ASSERT
    expect(episode.slug).toBe(expectedSlug);
  });

  it.each(WITH_PAGE)('gives $id its own title, caption and description in en and de', (ref) => {
    // ARRANGE
    // A Title slide's optional Speaker notes and Voice script may sit beside them.
    const expected = expect.objectContaining({
      title: expect.any(String),
      caption: expect.any(String),
      description: expect.any(String),
    });
    // ACT
    const texts = (['en', 'de'] as const).map((locale) => compositionOf(ref).messages[locale]);
    // ASSERT
    expect(texts).toEqual([expected, expected]);
    expect(texts.flatMap(({ title, caption, description }) => [title, caption, description])).not.toContain('');
  });

  it("reads an Episode's German text from its own folder", () => {
    // ARRANGE
    const expected = 'Warum KI eine seltsame Aufmerksamkeitsspanne hat, die Du managen lernen musst';
    // ACT
    const { title } = compositionOf(episodeRef('ai-attention-span')).messages.de;
    // ASSERT
    expect(title).toBe(expected);
  });

  it.each(COMPOSITION)('composes $slug in Dossier order, each Section opened by the Slide that names it', (c) => {
    // ARRANGE
    const expectedSections = c.sections;
    // ACT
    const composed = compositionOf(episodeRef(c.slug)).sections.map(([opener, ...pages]) => ({
      opener: opener.slug,
      pageSlides: pages.length,
    }));
    // ASSERT
    expect(composed).toEqual(expectedSections);
  });

  it.each(HEADER_MODES)('renders the Slide headers of $slug in the $header mode', ({ slug, header }) => {
    // ARRANGE
    const expected = header;
    // ACT
    const mode = headerModeOf(compositionOf(episodeRef(slug)));
    // ASSERT
    expect(mode).toBe(expected);
  });

  it.each(TOOLING_SLUGS)('finds the tooling page %s under its own slug', (slug) => {
    // ARRANGE
    const expected = slug;
    // ACT
    const page = compositionOf(toolingRef(slug));
    // ASSERT
    expect(page.slug).toBe(expected);
  });

  it('composes the Workshop template as agenda, in scope, out of scope and orga Slides after its Title slide', () => {
    // ARRANGE
    const expected = [['agenda'], ['in-scope', 'out-of-scope'], ['orga']];
    // ACT
    const sections = compositionOf(toolingRef('workshop-template')).sections.map((section) =>
      section.map(({ slug }) => slug),
    );
    // ASSERT
    expect(sections).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects an unregistered slug in the route check, in the types and in the lookup', () => {
    // ARRANGE
    const unregistered = 'non-existent-episode';
    // ACT
    const valid = isEpisodeId(unregistered);
    // @ts-expect-error -- an Episode the registry does not hold has no composition
    const lookup = () => compositionOf(episodeRef(unregistered));
    // ASSERT
    expect(valid).toBe(false);
    expect(lookup).toThrow(unregistered);
  });

  it('finds no tooling page for an Episode slug', () => {
    // ARRANGE
    const episode = 'ai-attention-span';
    // ACT
    // @ts-expect-error -- an Episode's slug names no tooling page
    const lookup = () => compositionOf(toolingRef(episode));
    // ASSERT
    expect(lookup).toThrow(episode);
  });
});

describe('edge cases', () => {
  it('writes the composition and the header mode of every published public Episode by hand, and of no other', () => {
    // ARRANGE
    const expected = { composition: PUBLISHED_PUBLIC, header: PUBLISHED_PUBLIC };
    // ACT
    const covered = {
      composition: COMPOSITION.map(({ slug }) => slug).sort(),
      header: HEADER_MODES.map(({ slug }) => slug).sort(),
    };
    // ASSERT
    expect(covered).toEqual(expected);
  });

  it.each(TOOLING_SLUGS)('keeps the tooling page %s out of the Episode registry, so it is no Episode', (slug) => {
    // ARRANGE
    const expected = false;
    // ACT
    const valid = isEpisodeId(slug);
    // @ts-expect-error -- a tooling page's slug names no Episode
    const lookup = () => compositionOf(episodeRef(slug));
    // ASSERT
    expect(valid).toBe(expected);
    expect(lookup).toThrow(slug);
  });

  it('finds no tooling page for the deleted slide-layouts', () => {
    // ARRANGE
    const deleted = 'slide-layouts';
    // ACT
    // @ts-expect-error -- a deleted tooling page has no composition
    const lookup = () => compositionOf(toolingRef(deleted));
    // ASSERT
    expect(lookup).toThrow(deleted);
  });

  it.each(WITH_PAGE)('gives $id at least one Section, each holding at least its opener', (ref) => {
    // ARRANGE
    const { sections } = compositionOf(ref);
    // ACT
    const emptySections = sections.filter((section) => section.length === 0);
    // ASSERT
    expect(sections.length).toBeGreaterThan(0);
    expect(emptySections).toEqual([]);
  });
});
