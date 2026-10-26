import type { PageRef } from '@/content-store/catalogue/record-routes';
import type { PageTreatment } from '@/content-store/catalogue/visibility.pure';
import { describe, expect, it } from 'vitest';
import { robotsFor, sitemapEntries } from './sitemap.pure';

const SITE = 'https://hancrafted.net';
const EVENT = '2026-10-23-axel-agentic-workflow';

const LISTED: PageTreatment = { exported: true, inSitemap: true, index: true, listed: true, canonical: 'self' };
const HIDDEN: PageTreatment = { exported: true, inSitemap: false, index: false, listed: false, canonical: 'self' };
const ABSENT: PageTreatment = { exported: false, inSitemap: false, index: false, listed: false, canonical: 'self' };

/** Pages with the treatment the page catalogue gives them, as the sitemap reads them. */
function treated(treatment: PageTreatment, ...pages: PageRef[]) {
  return pages.map((page) => ({ page, treatment }));
}

const SITE_PAGES = treated(
  LISTED,
  { kind: 'home' },
  { kind: 'episodes' },
  { kind: 'events' },
  { kind: 'episode', episode: 'ai-attention-span' },
  { kind: 'event', event: EVENT },
);

const undated = () => undefined;

describe('success cases', () => {
  it('lists the English page at the bare root and the German one at /de, each with reciprocal alternates', () => {
    // ARRANGE
    const expected = {
      url: `${SITE}/episodes/`,
      alternates: {
        languages: { en: `${SITE}/episodes/`, de: `${SITE}/de/episodes/`, 'x-default': `${SITE}/episodes/` },
      },
    };
    const german = { ...expected, url: `${SITE}/de/episodes/` };
    // ACT
    const entries = sitemapEntries(SITE, SITE_PAGES, undated);
    // ASSERT
    expect(entries).toContainEqual(expected);
    expect(entries).toContainEqual(german);
  });

  it('lists the Events page and each Event page in both locales with reciprocal alternates', () => {
    // ARRANGE
    const route = `/events/${EVENT}/`;
    const expected = {
      url: `${SITE}/de${route}`,
      alternates: {
        languages: { en: `${SITE}${route}`, de: `${SITE}/de${route}`, 'x-default': `${SITE}${route}` },
      },
    };
    // ACT
    const entries = sitemapEntries(SITE, SITE_PAGES, undated);
    // ASSERT
    expect(entries).toContainEqual(expected);
    expect(entries.map((entry) => entry.url)).toEqual(
      expect.arrayContaining([`${SITE}/events/`, `${SITE}/de/events/`, `${SITE}${route}`]),
    );
  });

  it('writes the home page as the origin with a trailing slash', () => {
    // ARRANGE
    const expected = [`${SITE}/`, `${SITE}/de/`];
    // ACT
    const urls = sitemapEntries(SITE, SITE_PAGES, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls).toEqual(expect.arrayContaining(expected));
  });

  it('dates an Episode entry by its publish date and leaves undated pages without one', () => {
    // ARRANGE
    const publishedOn = (slug: string) => (slug === 'ai-attention-span' ? ('2026-10-21' as const) : undefined);
    const expected = '2026-10-21';
    // ACT
    const entries = sitemapEntries(SITE, SITE_PAGES, publishedOn);
    // ASSERT
    expect(entries.find((e) => e.url === `${SITE}/de/episodes/ai-attention-span/`)?.lastModified).toBe(expected);
    expect(entries.find((e) => e.url === `${SITE}/`)?.lastModified).toBeUndefined();
  });
});

describe('failure cases', () => {
  it('leaves out every page its treatment keeps out of the sitemap, in both locales', () => {
    // ARRANGE
    const pages = [
      ...SITE_PAGES,
      ...treated(ABSENT, { kind: 'episode', episode: `${EVENT}__ai-attention-span` }),
      ...treated(HIDDEN, { kind: 'dashboard' }, { kind: 'tooling', tooling: 'slide-master' }),
      ...treated(HIDDEN, { kind: 'event-episode', event: EVENT, episode: `${EVENT}__ai-attention-span` }),
    ];
    const expected = [
      `${SITE}/`,
      `${SITE}/de/`,
      `${SITE}/episodes/`,
      `${SITE}/de/episodes/`,
      `${SITE}/events/`,
      `${SITE}/de/events/`,
      `${SITE}/episodes/ai-attention-span/`,
      `${SITE}/de/episodes/ai-attention-span/`,
      `${SITE}/events/${EVENT}/`,
      `${SITE}/de/events/${EVENT}/`,
    ];
    // ACT
    const urls = sitemapEntries(SITE, pages, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps the order the pages come in', () => {
    // ARRANGE
    const expected = [`${SITE}/events/${EVENT}/`, `${SITE}/de/events/${EVENT}/`, `${SITE}/`, `${SITE}/de/`];
    const pages = treated(LISTED, { kind: 'event', event: EVENT }, { kind: 'home' });
    // ACT
    const urls = sitemapEntries(SITE, pages, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls).toEqual(expected);
  });

  it('writes robots.txt that allows everything and points at the sitemap under the site URL', () => {
    // ARRANGE
    const expected = { rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE}/sitemap.xml` };
    // ACT
    const robots = robotsFor(SITE);
    // ASSERT
    expect(robots).toEqual(expected);
  });
});
