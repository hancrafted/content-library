import { pageMetadata } from '@/lib/page-metadata.pure';
import { EPISODE_SLUGS, isEpisodeSlug } from '@/lib/routes';
import { describe, expect, it } from 'vitest';
import { episodeCopy, findEpisode } from './registry';

/*
 * What every registered Episode shares (FE-002): a record under its own slug,
 * its own text from its folder's `i18n/` (what the Title slide, the page
 * metadata and the landing card read) and the Section list its Dossier fixes.
 * Per-Episode facts sit in the tables below, written out by hand.
 */

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
    // Section openers only until each Section job adds its page Slides at its placement marker.
    slug: 'never-too-early-sales-run-3',
    sections: [
      { opener: 'why-watching-cashflow-is-mission-critical', pageSlides: 1 },
      { opener: 'why-sales-is-more-than-just-selling', pageSlides: 1 },
      { opener: 'how-to-start-doing-sales', pageSlides: 4 },
      { opener: 'why-building-an-effective-sales-pipeline-takes-time', pageSlides: 3 },
      { opener: 'start-before-you-need-the-money', pageSlides: 1 },
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

  it.each(EPISODE_SLUGS)('gives %s its own title, caption and description in en and de', (slug) => {
    // ARRANGE
    const expected = { title: expect.any(String), caption: expect.any(String), description: expect.any(String) };
    // ACT
    const texts = (['en', 'de'] as const).map((locale) => findEpisode(slug).messages[locale]);
    // ASSERT
    expect(texts).toEqual([expected, expected]);
    expect(texts.flatMap(Object.values)).not.toContain('');
  });

  it.each(EPISODE_SLUGS)('produces page metadata for %s in en and de, canonical per locale', (slug) => {
    // ARRANGE
    const expectedCanonical = { en: `/episode/${slug}`, de: `/de/episode/${slug}` };
    // ACT
    const meta = (['en', 'de'] as const).map((locale) =>
      pageMetadata({ episode: slug }, locale, findEpisode(slug).messages[locale]),
    );
    // ASSERT
    expect({ en: meta[0].alternates?.canonical, de: meta[1].alternates?.canonical }).toEqual(expectedCanonical);
    expect(meta.map(({ title }) => title)).not.toContain('');
  });

  it("reads an Episode's German text from its own folder", () => {
    // ARRANGE
    const expected = 'Seitenvorlage';
    // ACT
    const { title } = findEpisode('page-template').messages.de;
    // ASSERT
    expect(title).toBe(expected);
  });

  it('hands the page metadata and the landing card one Episode text in the locale asked for', () => {
    // ARRANGE
    const expectedTitle = 'Seitenvorlage';
    const expectedKeys = ['caption', 'description', 'title'];
    // ACT
    const copy = episodeCopy('page-template', 'de');
    // ASSERT
    expect(copy.title).toBe(expectedTitle);
    expect(Object.keys(copy).sort()).toEqual(expectedKeys);
  });

  it.each(COMPOSITION)('composes $slug in Dossier order, each Section opened by the Slide that names it', (c) => {
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

  it('finds no Episode text for an unlisted slug', () => {
    // ARRANGE
    const unlisted = 'non-existent-episode';
    // ACT
    const read = () => episodeCopy(unlisted, 'en');
    // ASSERT
    expect(read).toThrow();
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
