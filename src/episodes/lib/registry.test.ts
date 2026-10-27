import { episodeRef, resourceRef } from '@/content-store/catalogue/episode-id.pure';
import { hasPage, isEpisodeId, RESOURCE_SLUGS } from '@/content-store/catalogue/record-routes';
import { listEpisodes } from '@/content-store/store';
import { headerModeOf } from '@/episodes/components/slide-master/slide';
import { describe, expect, it } from 'vitest';
import { compositionOf } from './registry';

/*
 * The one composition lookup (FE-002): the Slides and own text a page renders, by the EpisodeRef of an Episode with a
 * page or the ref of a Resource. What every registered Episode shares: a record under its Episode id carrying its
 * folder's slug, its own text from its folder's `i18n/` (what the Title slide, the page metadata and the landing card
 * read), and Sections each opened by the Slide that names it. Each holds for every Episode the registry holds, so
 * adding or publishing one adds no row here. The one per-Episode fact is the header mode, a deliberate content
 * decision: only the Episodes built before the shared Slide header (design-ADR-0012) author their own.
 */

/** Every Episode with a page, by its EpisodeRef, as the store serves it. */
const WITH_PAGE = listEpisodes().flatMap(({ ref }) => (hasPage(ref) ? [ref] : []));

/** The Episodes whose Scenes render their own Slide header, by slug, an Event's copy of one included. */
const AUTHORED_HEADERS = ['ai-token-economy', 'maintaining-markdown-for-ai'];

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

  it('renders the shared Slide header on every Episode but the ones built before it, which author their own', () => {
    // ARRANGE
    const expected = AUTHORED_HEADERS;
    // ACT
    const authored = [
      ...new Set(WITH_PAGE.filter((ref) => headerModeOf(compositionOf(ref)) === 'authored').map(({ slug }) => slug)),
    ].sort();
    // ASSERT
    expect(authored).toEqual(expected);
  });

  it.each(RESOURCE_SLUGS)('finds the Resource %s under its own slug', (slug) => {
    // ARRANGE
    const expected = slug;
    // ACT
    const page = compositionOf(resourceRef(slug));
    // ASSERT
    expect(page.slug).toBe(expected);
  });

  it('composes the Workshop template as hook, agenda, scope, poll with About me, and orga Slides after its Title slide', () => {
    // ARRANGE
    const expected = [['hook'], ['agenda'], ['in-scope', 'out-of-scope'], ['poll', 'about-me'], ['orga']];
    // ACT
    const sections = compositionOf(resourceRef('workshop-template')).sections.map((section) =>
      section.map(({ slug }) => slug),
    );
    // ASSERT
    expect(sections).toEqual(expected);
  });

  it('composes the CyberForum intro as the template does, its hook renamed grounding, then a check-in per theory Episode', () => {
    // ARRANGE
    const expected = [
      ['grounding'],
      ['agenda'],
      ['in-scope', 'out-of-scope'],
      ['poll', 'about-me'],
      ['orga'],
      ['check-in-1'],
      ['check-in-2'],
      ['check-in-3'],
    ];
    // ACT
    const sections = compositionOf(
      episodeRef('intro', '2026-10-28-cyberforum-akademie-intro-agentic-workflow'),
    ).sections.map((section) => section.map(({ slug }) => slug));
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

  it('finds no Resource for an Episode slug', () => {
    // ARRANGE
    const episode = 'ai-attention-span';
    // ACT
    // @ts-expect-error -- an Episode's slug names no Resource
    const lookup = () => compositionOf(resourceRef(episode));
    // ASSERT
    expect(lookup).toThrow(episode);
  });
});

describe('edge cases', () => {
  it.each(RESOURCE_SLUGS)('keeps the Resource %s out of the Episode registry, so it is no Episode', (slug) => {
    // ARRANGE
    const expected = false;
    // ACT
    const valid = isEpisodeId(slug);
    // @ts-expect-error -- a Resource's slug names no Episode
    const lookup = () => compositionOf(episodeRef(slug));
    // ASSERT
    expect(valid).toBe(expected);
    expect(lookup).toThrow(slug);
  });

  it('finds no Resource for the deleted slide-layouts', () => {
    // ARRANGE
    const deleted = 'slide-layouts';
    // ACT
    // @ts-expect-error -- a deleted Resource has no composition
    const lookup = () => compositionOf(resourceRef(deleted));
    // ASSERT
    expect(lookup).toThrow(deleted);
  });

  it.each(WITH_PAGE)('opens each Section of $id with a Slide of its own, never one another Section opens', (ref) => {
    // ARRANGE
    const openers = compositionOf(ref).sections.map(([opener]) => opener.slug);
    // ACT
    const repeated = openers.filter((slug, index) => openers.indexOf(slug) !== index);
    // ASSERT
    expect(repeated).toEqual([]);
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
