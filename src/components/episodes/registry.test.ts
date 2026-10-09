import { pageMetadata } from '@/lib/page-metadata.pure';
import { EPISODE_SLUGS, isEpisodeSlug } from '@/lib/routes';
import { describe, expect, it } from 'vitest';
import { findEpisode } from './registry';

/*
 * What every registered Episode shares (FE-002): a record under its own slug,
 * page metadata in both locales, and the Section list its manuscript fixes.
 * Per-Episode facts sit in the tables below, written out by hand.
 */

/** The Section openers and page-Slide counts each Episode composes, in manuscript order. */
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
] as const;

/** The recorded YouTube video of the Episodes that have one asserted here. */
const RECORDINGS = [
  { slug: 'ai-token-economy', en: 'S0Nx4faEebY', de: 'S0Nx4faEebY' },
  { slug: 'maintaining-markdown-for-ai', en: 'YxCVw4bUbW0', de: 'YxCVw4bUbW0' },
] as const;

describe('success cases', () => {
  it.each(EPISODE_SLUGS)('registers %s as a valid slug whose record carries that slug', (slug) => {
    // ARRANGE
    const expectedSlug = slug;
    // ACT
    const valid = isEpisodeSlug(slug);
    const episode = findEpisode(slug);
    // ASSERT
    expect(valid).toBe(true);
    expect(episode.slug).toBe(expectedSlug);
  });

  it.each(EPISODE_SLUGS)('produces page metadata for %s in en and de, canonical per locale', (slug) => {
    // ARRANGE
    const expectedCanonicalEn = `/episode/${slug}`;
    const expectedCanonicalDe = `/de/episode/${slug}`;
    // ACT
    const metaEn = pageMetadata({ episode: slug }, 'en');
    const metaDe = pageMetadata({ episode: slug }, 'de');
    // ASSERT
    expect(metaEn.title).toBeTruthy();
    expect(metaEn.description).toBeTruthy();
    expect(metaDe.title).toBeTruthy();
    expect(metaDe.description).toBeTruthy();
    expect(metaEn.alternates?.canonical).toBe(expectedCanonicalEn);
    expect(metaDe.alternates?.canonical).toBe(expectedCanonicalDe);
  });

  it.each(COMPOSITION)('composes $slug in manuscript order, each Section opened by the Slide that names it', (c) => {
    // ARRANGE
    const expectedSections = c.sections;
    // ACT
    const composed = findEpisode(c.slug).sections.map(([opener, ...pages]) => ({
      opener: opener.slug,
      pageSlides: pages.length,
    }));
    // ASSERT
    expect(composed).toEqual(expectedSections);
  });

  it.each(RECORDINGS)('keeps the recorded YouTube video of $slug', ({ slug, en, de }) => {
    // ARRANGE
    const expected = { en, de };
    // ACT
    const youtube = findEpisode(slug).youtube;
    // ASSERT
    expect(youtube).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects an unlisted slug in the route check and in the registry lookup', () => {
    // ARRANGE
    const unlisted = 'non-existent-episode';
    // ACT
    const valid = isEpisodeSlug(unlisted);
    const lookup = () => findEpisode(unlisted);
    // ASSERT
    expect(valid).toBe(false);
    expect(lookup).toThrow();
  });
});

describe('edge cases', () => {
  it.each(EPISODE_SLUGS)('gives %s at least one Section, each holding at least its opener', (slug) => {
    // ARRANGE
    const { sections } = findEpisode(slug);
    // ACT
    const emptySections = sections.filter((section) => section.length === 0);
    // ASSERT
    expect(sections.length).toBeGreaterThan(0);
    expect(emptySections).toEqual([]);
  });
});
