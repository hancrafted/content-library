import { describe, expect, it } from 'vitest';
import { EPISODE_SLUGS, isEventEpisodePage, isEventPage, type PageRef } from './routes';
import { robotsFor, sitemapEntries } from './sitemap.pure';
import type { PageFacts } from './visibility.pure';

const SITE = 'https://hancrafted.net';
const EVENT = '2026-10-23-axel-agentic-workflow';
const FRAME = 'axel-agentic-workflow-agenda';

/** Every Episode public and published, every Event's Playlist public, the agenda Episode unlisted. */
const allPublished = (page: PageRef): PageFacts => {
  if (isEventPage(page)) return { visibility: 'public' };
  const unlisted = isEventEpisodePage(page) && page.episode === FRAME;
  return { visibility: unlisted ? 'unlisted' : 'public', status: 'published' };
};

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
    const entries = sitemapEntries(SITE, allPublished, undated);
    // ASSERT
    expect(entries).toContainEqual(expected);
    expect(entries).toContainEqual(german);
  });

  it('lists the Events page in both locales, and no page of an Event whose Playlist is unlisted', () => {
    // ARRANGE
    const expected = { listed: [`${SITE}/events/`, `${SITE}/de/events/`], absent: [] };
    const unlistedEvent = (page: PageRef): PageFacts =>
      isEventPage(page) ? { visibility: 'unlisted' } : allPublished(page);
    // ACT
    const urls = sitemapEntries(SITE, unlistedEvent, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls).toEqual(expect.arrayContaining(expected.listed));
    expect(urls.filter((url) => url.includes(`/events/${EVENT}/`))).toEqual(expected.absent);
  });

  it('lists the page of an Event whose Playlist is public, and none of its Episode pages', () => {
    // ARRANGE
    const expected = { listed: [`${SITE}/events/${EVENT}/`, `${SITE}/de/events/${EVENT}/`] };
    // ACT
    const urls = sitemapEntries(SITE, allPublished, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls.filter((url) => url.includes(`/events/${EVENT}/`))).toEqual(expected.listed);
  });

  it('writes the home page as the origin with a trailing slash', () => {
    // ARRANGE
    const expected = [`${SITE}/`, `${SITE}/de/`];
    // ACT
    const urls = sitemapEntries(SITE, allPublished, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls).toEqual(expect.arrayContaining(expected));
  });

  it('dates an Episode entry by its publish date and leaves undated pages without one', () => {
    // ARRANGE
    const publishedOn = (slug: string) => (slug === 'ai-attention-span' ? ('2026-10-21' as const) : undefined);
    // ACT
    const entries = sitemapEntries(SITE, allPublished, publishedOn);
    // ASSERT
    expect(entries.find((e) => e.url === `${SITE}/de/episodes/ai-attention-span/`)?.lastModified).toBe('2026-10-21');
    expect(entries.find((e) => e.url === `${SITE}/`)?.lastModified).toBeUndefined();
  });
});

describe('failure cases', () => {
  it('An unlisted Episode never shows in the sitemap', () => {
    // ARRANGE
    const absent: string[] = [];
    // ACT
    const urls = sitemapEntries(SITE, allPublished, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls.filter((url) => url.includes(FRAME))).toEqual(absent);
  });

  it('leaves out an Episode that credits its canonical to a public one', () => {
    // ARRANGE
    const absent: string[] = [];
    const derived = (page: PageRef): PageFacts =>
      isEventEpisodePage(page)
        ? { visibility: 'unlisted', status: 'published', canonicalEpisode: 'onboard-ai-every-time' }
        : allPublished(page);
    // ACT
    const urls = sitemapEntries(SITE, derived, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls.filter((url) => url.includes('/episodes/') && url.includes('/events/'))).toEqual(absent);
  });

  it.each(['slide-layouts', 'slide-master', 'slides'])('A tooling page is never in the sitemap: %s', (slug) => {
    // ARRANGE
    const absent: string[] = [];
    // ACT
    const urls = sitemapEntries(SITE, allPublished, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls.filter((url) => url.endsWith(`/episodes/${slug}/`))).toEqual(absent);
  });

  it('leaves out the dashboard, which is noindex and English-only', () => {
    // ARRANGE
    const dashboard = `${SITE}/dashboard/`;
    // ACT
    const urls = sitemapEntries(SITE, allPublished, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls).not.toContain(dashboard);
  });
});

describe('edge cases', () => {
  it('leaves out an upcoming Episode in both locales and keeps the published ones', () => {
    // ARRANGE
    const upcoming = EPISODE_SLUGS[0];
    const published = EPISODE_SLUGS[1];
    const statusOf = (page: PageRef): PageFacts =>
      typeof page !== 'string' && 'episode' in page && page.episode === upcoming
        ? { visibility: 'public', status: 'upcoming' }
        : allPublished(page);
    // ACT
    const urls = sitemapEntries(SITE, statusOf, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls).not.toContain(`${SITE}/episodes/${upcoming}/`);
    expect(urls).not.toContain(`${SITE}/de/episodes/${upcoming}/`);
    expect(urls).toContain(`${SITE}/episodes/${published}/`);
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
