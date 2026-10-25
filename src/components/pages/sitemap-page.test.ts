import { listEpisodes } from '@/components/episodes/episode-repository';
import { UNLISTED_EPISODE_SLUGS } from '@/lib/routes';
import { TOOLING_SLUGS } from '@/lib/tooling-pages';
import { describe, expect, it } from 'vitest';
import { sitemapPage } from './sitemap-page';

/* The sitemap as the build writes it, over the real content store: the facts each page's treatment turns on. */

const SITE = 'https://hancrafted.net';
const EVENT = '/events/2026-10-23-axel-agentic-workflow/';

describe('success cases', () => {
  it('lists every public Episode at its own URL, in both locales', () => {
    // ARRANGE
    const expected = [`${SITE}/episodes/ai-token-economy/`, `${SITE}/de/episodes/ai-token-economy/`];
    // ACT
    const urls = sitemapPage(SITE).map(({ url }) => url);
    // ASSERT
    expect(urls).toEqual(expect.arrayContaining(expected));
  });
});

describe('failure cases', () => {
  it.each(UNLISTED_EPISODE_SLUGS)(
    'An unlisted Episode never shows in the sitemap, the Episode overview or an Upcoming list: %s',
    (slug) => {
      // ARRANGE
      const absent: string[] = [];
      // ACT
      const inSitemap = sitemapPage(SITE)
        .map(({ url }) => url)
        .filter((url) => url.includes(`/${slug}/`));
      const inOverview = listEpisodes()
        .map((episode) => episode.slug)
        .filter((listed) => listed === slug);
      const inUpcoming = listEpisodes()
        .filter(({ status }) => status === 'upcoming')
        .map((episode) => episode.slug)
        .filter((listed) => listed === slug);
      // ASSERT
      expect({ inSitemap, inOverview, inUpcoming }).toEqual({
        inSitemap: absent,
        inOverview: absent,
        inUpcoming: absent,
      });
    },
  );

  it.each(TOOLING_SLUGS)('A tooling page is never in the sitemap: %s', (slug) => {
    // ARRANGE
    const absent: string[] = [];
    // ACT
    const urls = sitemapPage(SITE)
      .map(({ url }) => url)
      .filter((url) => url.endsWith(`/episodes/${slug}/`));
    // ASSERT
    expect(urls).toEqual(absent);
  });
});

describe('edge cases', () => {
  it('lists no Episode page of an Event: each is unlisted, or credits its own public page', () => {
    // ARRANGE
    const absent: string[] = [];
    // ACT
    const urls = sitemapPage(SITE)
      .map(({ url }) => url)
      .filter((url) => url.includes(`${EVENT}episodes/`));
    // ASSERT
    expect(urls).toEqual(absent);
  });
});
