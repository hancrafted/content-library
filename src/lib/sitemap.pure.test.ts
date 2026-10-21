import { describe, expect, it } from 'vitest';
import { EPISODE_SLUGS } from './routes';
import { robotsFor, sitemapEntries } from './sitemap.pure';

const SITE = 'https://hancrafted.net';
const allPublished = () => 'published' as const;

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
    const entries = sitemapEntries(SITE, allPublished);
    // ASSERT
    expect(entries).toContainEqual(expected);
    expect(entries).toContainEqual(german);
  });

  it('writes the home page as the origin with a trailing slash', () => {
    // ARRANGE
    const expected = [`${SITE}/`, `${SITE}/de/`];
    // ACT
    const urls = sitemapEntries(SITE, allPublished).map((entry) => entry.url);
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
  it('leaves out the dashboard, which is noindex and English-only', () => {
    // ARRANGE
    const dashboard = `${SITE}/dashboard/`;
    // ACT
    const urls = sitemapEntries(SITE, allPublished).map((entry) => entry.url);
    // ASSERT
    expect(urls).not.toContain(dashboard);
  });
});

describe('edge cases', () => {
  it('leaves out an upcoming Episode in both locales and keeps the published ones', () => {
    // ARRANGE
    const upcoming = EPISODE_SLUGS[0];
    const published = EPISODE_SLUGS[1];
    const statusOf = (slug: string) => (slug === upcoming ? ('upcoming' as const) : ('published' as const));
    // ACT
    const urls = sitemapEntries(SITE, statusOf).map((entry) => entry.url);
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
