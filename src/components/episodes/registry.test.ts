import { headerModeOf } from '@/components/slide-master/slide';
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
  // The unlisted copies the AXEL seminar presented: `cp -r` of the three above, unedited so far.
  {
    slug: 'axel-onboard-ai-every-time',
    sections: [
      { opener: 'the-thought-experiment', pageSlides: 3 },
      { opener: 'five-moves-to-brief-a-freelancer', pageSlides: 2 },
    ],
  },
  {
    slug: 'axel-ai-attention-span',
    sections: [
      { opener: 'thought-experiment', pageSlides: 2 },
      { opener: 'the-ais-attention-span', pageSlides: 4 },
      { opener: 'what-fills-the-window', pageSlides: 3 },
      { opener: 'managing-the-attention-span', pageSlides: 4 },
    ],
  },
  {
    slug: 'axel-ai-gives-you-more-work',
    sections: [{ opener: 'from-execution-to-management', pageSlides: 3 }],
  },
  // The CyberForum Akademie webinar's: the Workshop template's copy, then `cp -r` of the same three, unedited so far.
  {
    slug: 'cyberforum-intro',
    sections: [
      { opener: 'agenda', pageSlides: 0 },
      { opener: 'in-scope', pageSlides: 1 },
      { opener: 'orga', pageSlides: 0 },
    ],
  },
  {
    slug: 'cyberforum-onboard-ai-every-time',
    sections: [
      { opener: 'the-thought-experiment', pageSlides: 3 },
      { opener: 'five-moves-to-brief-a-freelancer', pageSlides: 2 },
    ],
  },
  {
    slug: 'cyberforum-ai-attention-span',
    sections: [
      { opener: 'thought-experiment', pageSlides: 2 },
      { opener: 'the-ais-attention-span', pageSlides: 4 },
      { opener: 'what-fills-the-window', pageSlides: 3 },
      { opener: 'managing-the-attention-span', pageSlides: 4 },
    ],
  },
  {
    slug: 'cyberforum-ai-gives-you-more-work',
    sections: [{ opener: 'from-execution-to-management', pageSlides: 3 }],
  },
] as const;

/** Who renders each Slide header (design-ADR-0012): the Slide wrapper (`shared`) or each Scene (`authored`). */
const HEADER_MODES = [
  { slug: 'ai-token-economy', header: 'authored' },
  { slug: 'never-too-early-sales', header: 'shared' },
  { slug: 'onboard-ai-every-time', header: 'shared' },
  { slug: 'ai-attention-span', header: 'shared' },
  { slug: 'ai-gives-you-more-work', header: 'shared' },
  { slug: 'axel-onboard-ai-every-time', header: 'shared' },
  { slug: 'axel-ai-attention-span', header: 'shared' },
  { slug: 'axel-ai-gives-you-more-work', header: 'shared' },
  { slug: 'cyberforum-intro', header: 'shared' },
  { slug: 'cyberforum-onboard-ai-every-time', header: 'shared' },
  { slug: 'cyberforum-ai-attention-span', header: 'shared' },
  { slug: 'cyberforum-ai-gives-you-more-work', header: 'shared' },
] as const;

/** The recorded YouTube video of the Episodes that have one asserted here. */
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
    // A Title slide's optional Speaker notes and Voice script may sit beside them.
    const expected = expect.objectContaining({
      title: expect.any(String),
      caption: expect.any(String),
      description: expect.any(String),
    });
    // ACT
    const texts = (['en', 'de'] as const).map((locale) => findEpisode(slug).messages[locale]);
    // ASSERT
    expect(texts).toEqual([expected, expected]);
    expect(texts.flatMap(({ title, caption, description }) => [title, caption, description])).not.toContain('');
  });

  it.each(EPISODE_SLUGS)('produces page metadata for %s in en and de, canonical per locale', (slug) => {
    // ARRANGE
    const expectedCanonical = { en: `/episodes/${slug}`, de: `/de/episodes/${slug}` };
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
    const expected = 'Warum KI eine seltsame Aufmerksamkeitsspanne hat, die Du managen lernen musst';
    // ACT
    const { title } = findEpisode('ai-attention-span').messages.de;
    // ASSERT
    expect(title).toBe(expected);
  });

  it('hands the page metadata and the landing card one Episode text in the locale asked for', () => {
    // ARRANGE
    const expectedTitle = 'Warum KI eine seltsame Aufmerksamkeitsspanne hat, die Du managen lernen musst';
    const expectedKeys = ['caption', 'description', 'title'];
    // ACT
    const copy = episodeCopy('ai-attention-span', 'de');
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

  it.each(HEADER_MODES)('renders the Slide headers of $slug in the $header mode', ({ slug, header }) => {
    // ARRANGE
    const expected = header;
    // ACT
    const mode = headerModeOf(findEpisode(slug));
    // ASSERT
    expect(mode).toBe(expected);
  });
});

describe('failure cases', () => {
  it('rejects an unregistered slug in the route check and in the registry lookup', () => {
    // ARRANGE
    const unregistered = 'non-existent-episode';
    // ACT
    const valid = isEpisodeSlug(unregistered);
    const lookup = () => findEpisode(unregistered);
    // ASSERT
    expect(valid).toBe(false);
    expect(lookup).toThrow();
  });

  it('finds no Episode text for an unregistered slug', () => {
    // ARRANGE
    const unregistered = 'non-existent-episode';
    // ACT
    const read = () => episodeCopy(unregistered, 'en');
    // ASSERT
    expect(read).toThrow();
  });
});

describe('edge cases', () => {
  it.each(['episode-template', 'workshop-template', 'slide-master', 'explorable-explanations'])(
    'keeps the tooling page %s out of the Episode registry, so it is no Episode',
    (slug) => {
      // ARRANGE
      const expected = false;
      // ACT
      const valid = isEpisodeSlug(slug);
      const lookup = () => findEpisode(slug);
      // ASSERT
      expect(valid).toBe(expected);
      expect(lookup).toThrow();
    },
  );

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
