import type { MetadataRoute } from 'next';
import type { IsoDate } from '../content-store/schemas/fields';
import { DEFAULT_LOCALE } from './locale.pure';
import { isEpisodePage, pageLocales, PAGES, routeOf, servedUrl, type EpisodeSlug, type PageRef } from './routes';
import { pageTreatment, type PageFacts } from './visibility.pure';

/**
 * The sitemap: one entry per indexable page and locale, each carrying the full hreflang set, English canonical at
 * the bare root and German at `/de`. Episode entries carry `lastModified` from their publish date. Pages are the
 * `PAGES` the visibility predicate (`pageTreatment`) puts in the sitemap, the one `pageMetadata` asks too, so the two
 * cannot disagree: no dashboard, tooling page, upcoming or unlisted Episode, or Event whose Playlist is unlisted.
 */
export function sitemapEntries(
  siteUrl: string,
  factsOf: (page: PageRef) => PageFacts,
  publishedOnOf: (slug: EpisodeSlug) => IsoDate | undefined,
): MetadataRoute.Sitemap {
  const indexable = PAGES.filter((page) => pageTreatment(page, factsOf(page)).inSitemap);
  return indexable.flatMap((page) => {
    const route = routeOf(page);
    const locales = pageLocales(page);
    const languages = {
      ...Object.fromEntries(locales.map((locale) => [locale, servedUrl(siteUrl, route, locale)])),
      'x-default': servedUrl(siteUrl, route, DEFAULT_LOCALE),
    };
    const lastModified = isEpisodePage(page) ? publishedOnOf(page.episode) : undefined;
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
