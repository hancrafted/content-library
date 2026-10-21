import type { MetadataRoute } from 'next';
import type { EpisodeStatus, IsoDate } from './episode-metadata.pure';
import { DEFAULT_LOCALE, localizePath } from './locale.pure';
import { isNoindex } from './page-metadata.pure';
import { PAGES, pageLocales, routeOf } from './routes';

/** The URL a page is served at: `trailingSlash` makes it the canonical, the origin alone for the home page. */
function servedUrl(siteUrl: string, path: string): string {
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`;
}

/**
 * The sitemap: one entry per indexable page and locale, each carrying the full hreflang set, English canonical at
 * the bare root and German at `/de`. Episode entries carry `lastModified` from their publish date. Pages are `PAGES`, minus whatever `pageMetadata` marks `noindex` (the dashboard,
 * an upcoming Episode), so the two cannot disagree.
 */
export function sitemapEntries(
  siteUrl: string,
  statusOf: (slug: string) => EpisodeStatus,
  publishedOnOf: (slug: string) => IsoDate | undefined = () => undefined,
): MetadataRoute.Sitemap {
  const indexable = PAGES.filter(
    (page) => !isNoindex(page, typeof page === 'string' ? undefined : statusOf(page.episode)),
  );
  return indexable.flatMap((page) => {
    const route = routeOf(page);
    const locales = pageLocales(page);
    const languages = {
      ...Object.fromEntries(locales.map((locale) => [locale, servedUrl(siteUrl, localizePath(route, locale))])),
      'x-default': servedUrl(siteUrl, localizePath(route, DEFAULT_LOCALE)),
    };
    const lastModified = typeof page === 'string' ? undefined : publishedOnOf(page.episode);
    return locales.map((locale) => ({
      url: servedUrl(siteUrl, localizePath(route, locale)),
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages },
    }));
  });
}

/** `robots.txt`: crawl everything, and say where the sitemap is. Page-level `noindex` does the excluding. */
export function robotsFor(siteUrl: string): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${siteUrl}/sitemap.xml` };
}
