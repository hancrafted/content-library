import { describe, expect, it } from 'vitest';
import { EPISODE_SLUGS, type PageRef } from './routes';
import { robotsFor, sitemapEntries } from './sitemap.pure';
import type { PageFacts } from './visibility.pure';

const SITE = 'https://hancrafted.net';
const allPublished = (): PageFacts => ({ visibility: 'public', status: 'published' });

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

  it('lists the Events page and each Event page in both locales with reciprocal alternates', () => {
    // ARRANGE
    const slug = '2026-10-23-axel-agentic-workflow';
    const route = `/events/${slug}/`;
    const expected = {
      url: `${SITE}/de${route}`,
      alternates: {
        languages: { en: `${SITE}${route}`, de: `${SITE}/de${route}`, 'x-default': `${SITE}${route}` },
      },
    };
    // ACT
    const entries = sitemapEntries(SITE, allPublished, undated);
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
  it('leaves out an unlisted Episode and an Event whose Playlist is unlisted, in both locales', () => {
    // ARRANGE
    const episode = EPISODE_SLUGS[1];
    const event = '2026-10-23-axel-agentic-workflow';
    const factsOf = (page: PageRef): PageFacts => {
      const unlisted = (page.kind === 'episode' && page.episode === episode) || page.kind === 'event';
      return { visibility: unlisted ? 'unlisted' : 'public', status: 'published' };
    };
    const hidden = [
      `${SITE}/episodes/${episode}/`,
      `${SITE}/de/episodes/${episode}/`,
      `${SITE}/events/${event}/`,
      `${SITE}/de/events/${event}/`,
    ];
    // ACT
    const urls = sitemapEntries(SITE, factsOf, undated).map((entry) => entry.url);
    // ASSERT
    expect(urls.filter((url) => hidden.includes(url))).toEqual([]);
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
  it.each(['episode-template', 'workshop-template', 'slide-master', 'explorable-explanations'])(
    'never lists the tooling page %s in either locale',
    (slug) => {
      // ARRANGE
      const tooling = [`${SITE}/episodes/${slug}/`, `${SITE}/de/episodes/${slug}/`];
      // ACT
      const urls = sitemapEntries(SITE, allPublished, undated).map((entry) => entry.url);
      // ASSERT
      expect(urls.filter((url) => tooling.includes(url))).toEqual([]);
    },
  );

  it('leaves out an upcoming Episode in both locales and keeps the published ones', () => {
    // ARRANGE
    const upcoming = EPISODE_SLUGS[0];
    const published = EPISODE_SLUGS[1];
    const factsOf = (page: PageRef): PageFacts => ({
      visibility: 'public',
      status: page.kind === 'episode' && page.episode === upcoming ? 'upcoming' : 'published',
    });
    // ACT
    const urls = sitemapEntries(SITE, factsOf, undated).map((entry) => entry.url);
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
