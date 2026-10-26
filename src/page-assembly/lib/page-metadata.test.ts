import { episodeRef, toolingRef } from '@/content-store/catalogue/episode-id.pure';
import type { PageTreatment } from '@/content-store/catalogue/visibility.pure';
import { describe, expect, it } from 'vitest';
import { pageMetadata, siteMetadata } from './page-metadata.pure';

/** An Episode's own page, as the page catalogue hands it: carrying the Episode's EpisodeRef. */
const OWN_PAGE = { kind: 'episode', episode: episodeRef('ai-token-economy') } as const;

const UNDER_EVENT = {
  kind: 'event-episode',
  event: '2026-10-23-axel-agentic-workflow',
  episode: episodeRef('ai-attention-span'),
} as const;

const LISTED: PageTreatment = { exported: true, inSitemap: true, index: true, listed: true, canonical: 'self' };
const HIDDEN: PageTreatment = { exported: true, inSitemap: false, index: false, listed: false, canonical: 'self' };

/** An Episode's copy as its record hands it to the route, with the treatment the page catalogue gives its page. */
const COPY = { title: 'Seitenvorlage', description: 'Diese Episode kopieren.', treatment: LISTED };

describe('success cases', () => {
  it('exports English-only dashboard metadata without a nonexistent German alternate', () => {
    // ARRANGE
    const expectedCanonical = '/dashboard';
    const expectedLanguages = { en: '/dashboard', 'x-default': '/dashboard' };
    const expectedTitle = 'Content pipeline';
    const expectedRobots = { index: false };
    // ACT
    const metadata = pageMetadata({ kind: 'dashboard' }, 'en');
    // ASSERT
    expect(metadata.alternates?.canonical).toBe(expectedCanonical);
    expect(metadata.alternates?.languages).toEqual(expectedLanguages);
    expect(metadata.title).toBe(expectedTitle);
    expect(metadata.robots).toEqual(expectedRobots);
  });

  it('points the canonical at the page in its own locale', () => {
    // ARRANGE
    const expected = '/de/episodes/ai-token-economy';
    // ACT
    const metadata = pageMetadata(OWN_PAGE, 'de', COPY);
    // ASSERT
    expect(metadata.alternates?.canonical).toBe(expected);
  });

  it('lists every locale and x-default as alternates, identical from either locale', () => {
    // ARRANGE
    const expected = {
      en: '/episodes/ai-token-economy',
      de: '/de/episodes/ai-token-economy',
      'x-default': '/episodes/ai-token-economy',
    };
    // ACT
    const fromEnglish = pageMetadata(OWN_PAGE, 'en', COPY).alternates?.languages;
    const fromGerman = pageMetadata(OWN_PAGE, 'de', COPY).alternates?.languages;
    // ASSERT
    expect(fromEnglish).toEqual(expected);
    expect(fromGerman).toEqual(expected);
  });

  it("takes an Episode's title and description from the copy its record hands in", () => {
    // ARRANGE
    const expected = { title: 'Seitenvorlage', description: 'Diese Episode kopieren.' };
    // ACT
    const metadata = pageMetadata(OWN_PAGE, 'de', COPY);
    // ASSERT
    expect({ title: metadata.title, description: metadata.description }).toEqual(expected);
  });

  it('builds the Events list metadata from the Translation file with reciprocal alternates', () => {
    // ARRANGE
    const expected = {
      title: 'Events',
      canonical: '/de/events',
      languages: { en: '/events', de: '/de/events', 'x-default': '/events' },
    };
    // ACT
    const english = pageMetadata({ kind: 'events' }, 'en');
    const german = pageMetadata({ kind: 'events' }, 'de');
    // ASSERT
    expect(english.title).toBe(expected.title);
    expect(german.alternates?.canonical).toBe(expected.canonical);
    expect(german.alternates?.languages).toEqual(expected.languages);
  });

  it("points an Event page's canonical at its own slug and locale, with the copy its route hands in", () => {
    // ARRANGE
    const slug = '2026-10-23-axel-agentic-workflow';
    const expected = { canonical: `/de/events/${slug}`, type: 'website', title: COPY.title };
    // ACT
    const metadata = pageMetadata({ kind: 'event', event: slug }, 'de', COPY);
    // ASSERT
    expect({
      canonical: metadata.alternates?.canonical,
      type: (metadata.openGraph as { type?: string } | null | undefined)?.type,
      title: metadata.title,
    }).toEqual(expected);
  });

  it("takes the landing page's title and description from the locale Translation file", () => {
    // ARRANGE
    const expectedTitle = 'Visualised theory · hancrafted';
    // ACT
    const metadata = pageMetadata({ kind: 'home' }, 'en');
    // ASSERT
    expect(metadata.title).toBe(expectedTitle);
    expect(metadata.description).toEqual(expect.any(String));
  });

  it('gives the layout the site name and the absolute base, nothing page-specific', () => {
    // ARRANGE
    const siteUrl = 'https://hancrafted.github.io/content-library';
    const expectedBase = 'https://hancrafted.github.io/content-library/';
    const expectedTitle = { default: 'hancrafted', template: '%s · hancrafted' };
    // ACT
    const metadata = siteMetadata('en', siteUrl);
    // ASSERT
    expect(String(metadata.metadataBase)).toBe(expectedBase);
    expect(metadata.title).toEqual(expectedTitle);
    expect(metadata).not.toHaveProperty('alternates');
    expect(metadata).not.toHaveProperty('description');
  });

  it.each(['en', 'de'] as const)('keeps an Episode page its treatment hides out of search in %s', (locale) => {
    // ARRANGE
    const expected = { index: false };
    // ACT
    const metadata = pageMetadata(OWN_PAGE, locale, {
      ...COPY,
      treatment: { ...HIDDEN, listed: true },
    });
    // ASSERT
    expect(metadata.robots).toEqual(expected);
  });

  it('leaves a public, published Episode page indexable', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const metadata = pageMetadata(OWN_PAGE, 'en', COPY);
    // ASSERT
    expect(metadata.robots).toBe(expected);
  });

  it('gives the landing page a website Open Graph card at its canonical, with locale and alternate locale', () => {
    // ARRANGE
    const expected = {
      type: 'website',
      url: '/de',
      siteName: 'hancrafted',
      locale: 'de_DE',
      alternateLocale: ['en_US'],
    };
    // ACT
    const card = pageMetadata({ kind: 'home' }, 'de').openGraph;
    // ASSERT
    expect(card).toMatchObject(expected);
  });

  it('gives an Episode an article card carrying its publish date', () => {
    // ARRANGE
    const copy = { ...COPY, publishedOn: '2026-10-20' as const };
    // ACT
    const card = pageMetadata(OWN_PAGE, 'en', copy).openGraph as Record<string, unknown>;
    // ASSERT
    expect(card).toMatchObject({ type: 'article', url: '/episodes/ai-token-economy', publishedTime: '2026-10-20' });
  });

  it('repeats title and description on the card and falls back to the site-wide 1200x630 image', () => {
    // ARRANGE
    const expectedImage = { url: '/og-image.png', width: 1200, height: 630 };
    // ACT
    const metadata = pageMetadata(OWN_PAGE, 'de', COPY);
    // ASSERT
    expect(metadata.openGraph).toMatchObject({ title: 'Seitenvorlage', description: 'Diese Episode kopieren.' });
    expect(metadata.openGraph?.images).toEqual([expect.objectContaining(expectedImage)]);
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', title: 'Seitenvorlage' });
    expect(metadata.twitter?.images).toEqual(['/og-image.png']);
  });

  it('keeps a tooling page out of search, canonical at its own URL under /episodes/', () => {
    // ARRANGE
    const expected = { canonical: '/de/episodes/slide-master', robots: { index: false } };
    // ACT
    const metadata = pageMetadata({ kind: 'tooling', tooling: toolingRef('slide-master') }, 'de', {
      ...COPY,
      treatment: HIDDEN,
    });
    // ASSERT
    expect({ canonical: metadata.alternates?.canonical, robots: metadata.robots }).toEqual(expected);
  });

  it('names no alternate locale on an English-only page', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const card = pageMetadata({ kind: 'dashboard' }, 'en').openGraph as Record<string, unknown>;
    // ASSERT
    expect(card.alternateLocale).toBe(expected);
  });
  it('A public Episode under an Event points its canonical at its own /episodes/ page', () => {
    // ARRANGE
    const expected = {
      canonical: '/de/episodes/ai-attention-span',
      languages: undefined,
      robots: undefined,
      card: '/de/episodes/ai-attention-span',
    };
    const credited: PageTreatment = { ...HIDDEN, index: true, canonical: { episode: 'ai-attention-span' } };
    // ACT
    const metadata = pageMetadata(UNDER_EVENT, 'de', { ...COPY, treatment: credited });
    // ASSERT
    expect({
      canonical: metadata.alternates?.canonical,
      languages: metadata.alternates?.languages,
      robots: metadata.robots,
      card: metadata.openGraph?.url,
    }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps an Event-scoped Episode page its treatment hides out of search, canonical to itself', () => {
    // ARRANGE
    const expected = {
      canonical: '/events/2026-10-23-axel-agentic-workflow/episodes/ai-attention-span',
      robots: { index: false },
    };
    // ACT
    const metadata = pageMetadata(UNDER_EVENT, 'en', { ...COPY, treatment: HIDDEN });
    // ASSERT
    expect({ canonical: metadata.alternates?.canonical, robots: metadata.robots }).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps the bare root as the home canonical of the default locale', () => {
    // ARRANGE
    const expected = '/';
    // ACT
    const metadata = pageMetadata({ kind: 'home' }, 'en');
    // ASSERT
    expect(metadata.alternates?.canonical).toBe(expected);
  });
});
