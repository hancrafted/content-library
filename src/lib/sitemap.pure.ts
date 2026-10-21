import type { MetadataRoute } from 'next';
import type { EpisodeStatus, IsoDate } from './episode-metadata.pure';
import { DEFAULT_LOCALE } from './locale.pure';
import { isNoindex } from './page-metadata.pure';
import { isEpisodePage, pageLocales, PAGES, routeOf, servedUrl } from './routes';

/**
 * The sitemap: one entry per indexable page and locale, each carrying the full hreflang set, English canonical at
 * the bare root and German at `/de`. Episode entries carry `lastModified` from their publish date. Pages are `PAGES`, minus whatever `pageMetadata` marks `noindex` (the dashboard,
 * an upcoming Episode), so the two cannot disagree.
 */
export function sitemapEntries(
  siteUrl: string,
  statusOf: (slug: string) => EpisodeStatus,
  publishedOnOf: (slug: string) => IsoDate | undefined,
): MetadataRoute.Sitemap {
  const indexable = PAGES.filter((page) => !isNoindex(page, isEpisodePage(page) ? statusOf(page.episode) : undefined));
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
