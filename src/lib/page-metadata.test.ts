import { describe, expect, it } from 'vitest';
import { pageMetadata, resolveSiteUrl, siteMetadata } from './page-metadata.pure';

/** An Episode's copy as its record hands it to the route. */
const COPY = {
  title: 'Seitenvorlage',
  description: 'Diese Episode kopieren.',
  facts: { visibility: 'public', status: 'published' },
} as const;

const EVENT = '2026-10-23-axel-agentic-workflow';
const UNLISTED = { ...COPY, facts: { visibility: 'unlisted', status: 'published' } } as const;

describe('success cases', () => {
  it('exports English-only dashboard metadata without a nonexistent German alternate', () => {
    // ARRANGE
    const expectedCanonical = '/dashboard';
    const expectedLanguages = { en: '/dashboard', 'x-default': '/dashboard' };
    const expectedTitle = 'Content pipeline';
    const expectedRobots = { index: false };
    // ACT
    const metadata = pageMetadata('dashboard', 'en');
    // ASSERT
    expect(metadata.alternates?.canonical).toBe(expectedCanonical);
    expect(metadata.alternates?.languages).toEqual(expectedLanguages);
    expect(metadata.title).toBe(expectedTitle);
    expect(metadata.robots).toEqual(expectedRobots);
  });

  it('points the canonical at the page in its own locale', () => {
    // ARRANGE
    const expected = '/de/episodes/page-template';
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, 'de', COPY);
    // ASSERT
    expect(metadata.alternates?.canonical).toBe(expected);
  });

  it('lists every locale and x-default as alternates, identical from either locale', () => {
    // ARRANGE
    const expected = {
      en: '/episodes/page-template',
      de: '/de/episodes/page-template',
      'x-default': '/episodes/page-template',
    };
    // ACT
    const fromEnglish = pageMetadata({ episode: 'page-template' }, 'en', COPY).alternates?.languages;
    const fromGerman = pageMetadata({ episode: 'page-template' }, 'de', COPY).alternates?.languages;
    // ASSERT
    expect(fromEnglish).toEqual(expected);
    expect(fromGerman).toEqual(expected);
  });

  it("takes an Episode's title and description from the copy its record hands in", () => {
    // ARRANGE
    const expected = { title: 'Seitenvorlage', description: 'Diese Episode kopieren.' };
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, 'de', COPY);
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
    const english = pageMetadata('events', 'en');
    const german = pageMetadata('events', 'de');
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
    const metadata = pageMetadata({ event: slug }, 'de', { ...COPY, facts: { visibility: 'public' } });
    // ASSERT
    expect({
      canonical: metadata.alternates?.canonical,
      type: (metadata.openGraph as { type?: string } | null | undefined)?.type,
      title: metadata.title,
    }).toEqual(expected);
  });

  it('keeps the page of an Event whose Playlist is unlisted out of search', () => {
    // ARRANGE
    const expected = { index: false };
    // ACT
    const metadata = pageMetadata({ event: EVENT }, 'en', { ...COPY, facts: { visibility: 'unlisted' } });
    // ASSERT
    expect(metadata.robots).toEqual(expected);
  });

  it('An unlisted Episode page tells search engines not to index it', () => {
    // ARRANGE
    const expected = { robots: { index: false }, canonical: `/events/${EVENT}/episodes/axel-agentic-workflow-agenda` };
    // ACT
    const metadata = pageMetadata({ event: EVENT, episode: 'axel-agentic-workflow-agenda' }, 'en', UNLISTED);
    // ASSERT
    expect({ robots: metadata.robots, canonical: metadata.alternates?.canonical }).toEqual(expected);
  });

  it('An Episode I derived from a public one points its canonical at the public page', () => {
    // ARRANGE
    const copy = { ...COPY, facts: { ...UNLISTED.facts, canonicalEpisode: 'onboard-ai-every-time' } } as const;
    const expected = { canonical: '/de/episodes/onboard-ai-every-time', robots: undefined, languages: undefined };
    // ACT
    const metadata = pageMetadata({ event: EVENT, episode: 'axel-agentic-workflow-agenda' }, 'de', copy);
    // ASSERT
    expect({
      canonical: metadata.alternates?.canonical,
      robots: metadata.robots,
      languages: metadata.alternates?.languages,
    }).toEqual(expected);
    expect(metadata.openGraph?.url).toBe(expected.canonical);
  });

  it("credits a public Episode seen at its Event's URL to the Episode's own page", () => {
    // ARRANGE
    const expected = { canonical: '/episodes/ai-token-economy', robots: undefined };
    // ACT
    const metadata = pageMetadata({ event: EVENT, episode: 'ai-token-economy' }, 'en', COPY);
    // ASSERT
    expect({ canonical: metadata.alternates?.canonical, robots: metadata.robots }).toEqual(expected);
  });

  it('keeps a tooling page out of search at its own URL', () => {
    // ARRANGE
    const expected = { robots: { index: false }, canonical: '/de/episodes/slide-master' };
    // ACT
    const metadata = pageMetadata({ tooling: 'slide-master' }, 'de', {
      title: COPY.title,
      description: COPY.description,
    });
    // ASSERT
    expect({ robots: metadata.robots, canonical: metadata.alternates?.canonical }).toEqual(expected);
  });

  it("takes the landing page's title and description from the locale Translation file", () => {
    // ARRANGE
    const expectedTitle = 'Visualised theory · hancrafted';
    // ACT
    const metadata = pageMetadata('home', 'en');
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

  it('uses SITE_URL when the deploy sets it', () => {
    // ARRANGE
    const env = { SITE_URL: 'https://example.com/content-library/' };
    const expected = 'https://example.com/content-library';
    // ACT
    const url = resolveSiteUrl(env);
    // ASSERT
    expect(url).toBe(expected);
  });

  it.each(['en', 'de'] as const)('keeps an upcoming Episode page out of search in %s', (locale) => {
    // ARRANGE
    const expected = { index: false };
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, locale, {
      ...COPY,
      facts: { visibility: 'public', status: 'upcoming' },
    });
    // ASSERT
    expect(metadata.robots).toEqual(expected);
  });

  it('leaves a public, published Episode page indexable', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, 'en', COPY);
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
    const card = pageMetadata('home', 'de').openGraph;
    // ASSERT
    expect(card).toMatchObject(expected);
  });

  it('gives an Episode an article card carrying its publish date', () => {
    // ARRANGE
    const copy = { ...COPY, publishedOn: '2026-10-20' as const };
    // ACT
    const card = pageMetadata({ episode: 'page-template' }, 'en', copy).openGraph as Record<string, unknown>;
    // ASSERT
    expect(card).toMatchObject({ type: 'article', url: '/episodes/page-template', publishedTime: '2026-10-20' });
  });

  it('repeats title and description on the card and falls back to the site-wide 1200x630 image', () => {
    // ARRANGE
    const expectedImage = { url: '/og-image.png', width: 1200, height: 630 };
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, 'de', COPY);
    // ASSERT
    expect(metadata.openGraph).toMatchObject({ title: 'Seitenvorlage', description: 'Diese Episode kopieren.' });
    expect(metadata.openGraph?.images).toEqual([expect.objectContaining(expectedImage)]);
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', title: 'Seitenvorlage' });
    expect(metadata.twitter?.images).toEqual(['/og-image.png']);
  });

  it('names no alternate locale on an English-only page', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const card = pageMetadata('dashboard', 'en').openGraph as Record<string, unknown>;
    // ASSERT
    expect(card.alternateLocale).toBe(expected);
  });
});

describe('failure cases', () => {
  it('rejects a SITE_URL that is not an absolute URL', () => {
    // ARRANGE
    const env = { SITE_URL: 'hancrafted.github.io/content-library' };
    const expected = /SITE_URL/;
    // ACT
    const resolve = () => resolveSiteUrl(env);
    // ASSERT
    expect(resolve).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('falls back to localhost under the base path when SITE_URL is unset', () => {
    // ARRANGE
    const env = { NEXT_PUBLIC_BASE_PATH: '/content-library' };
    const expected = 'http://localhost:3000/content-library';
    // ACT
    const url = resolveSiteUrl(env);
    // ASSERT
    expect(url).toBe(expected);
  });

  it('treats an empty SITE_URL as unset', () => {
    // ARRANGE
    const env = { SITE_URL: '' };
    const expected = 'http://localhost:3000';
    // ACT
    const url = resolveSiteUrl(env);
    // ASSERT
    expect(url).toBe(expected);
  });

  it('keeps the bare root as the home canonical of the default locale', () => {
    // ARRANGE
    const expected = '/';
    // ACT
    const metadata = pageMetadata('home', 'en');
    // ASSERT
    expect(metadata.alternates?.canonical).toBe(expected);
  });

  it('keeps an Episode page whose facts are missing out of search', () => {
    // ARRANGE
    const expected = { index: false };
    // ACT
    const metadata = pageMetadata({ episode: 'page-template' }, 'en', {
      title: COPY.title,
      description: COPY.description,
    });
    // ASSERT
    expect(metadata.robots).toEqual(expected);
  });
});
