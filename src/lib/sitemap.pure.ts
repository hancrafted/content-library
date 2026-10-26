import type { MetadataRoute } from 'next';
import type { IsoDate } from '../content-store/schemas/fields';
import { DEFAULT_LOCALE } from './locale.pure';
import { matchPage, pageLocales, routeOf, servedUrl, type EpisodeId, type PageRef } from './routes';
import type { TreatedPage } from './visibility.pure';

/** A sitemap entry's `lastModified`: an Episode's own page carries its publish date, no other page one. */
function lastModifiedOf(page: PageRef, publishedOnOf: (id: EpisodeId) => IsoDate | undefined): IsoDate | undefined {
  const none = () => undefined;
  return matchPage<PageRef, IsoDate | undefined>(page, {
    home: none,
    dashboard: none,
    episodes: none,
    events: none,
    episode: ({ episode }) => publishedOnOf(episode),
    tooling: none,
    event: none,
    'event-episode': none,
  });
}

/**
 * The sitemap: one entry per page and locale whose treatment puts it in the sitemap, in the order given, each carrying
 * the full hreflang set, English canonical at the bare root and German at `/de`. Episode entries carry `lastModified`
 * from their publish date. The pages and treatments are the page catalogue's (`PAGES` in the content store), which
 * `pageMetadata` reads too, so the two cannot disagree: no dashboard, tooling page, upcoming or unlisted Episode,
 * Episode under an Event, or Event whose Playlist is unlisted.
 */
export function sitemapEntries(
  siteUrl: string,
  pages: readonly TreatedPage[],
  publishedOnOf: (id: EpisodeId) => IsoDate | undefined,
): MetadataRoute.Sitemap {
  const indexable = pages.filter(({ treatment }) => treatment.inSitemap).map(({ page }) => page);
  return indexable.flatMap((page) => {
    const route = routeOf(page);
    const locales = pageLocales(page);
    const languages = {
      ...Object.fromEntries(locales.map((locale) => [locale, servedUrl(siteUrl, route, locale)])),
      'x-default': servedUrl(siteUrl, route, DEFAULT_LOCALE),
    };
    const lastModified = lastModifiedOf(page, publishedOnOf);
    return locales.map((locale) => ({
      url: servedUrl(siteUrl, route, locale),
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages },
    }));
  });
}

/** `robots.txt`: crawl everything, and say where the sitemap is. Page-level `noindex` does the excluding. */
export function robotsFor(siteUrl: string): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${siteUrl}/sitemap.xml` };
}
