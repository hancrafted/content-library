import { episodePublishedOn, PAGES } from '@/content-store/store';
import { sitemapEntries } from '@/page-assembly/sitemap/sitemap.pure';
import type { MetadataRoute } from 'next';

/**
 * The sitemap's composition root (FE-007 §1): the route reaches the page catalogue and each Episode's release date,
 * read from the content store, only through here.
 */
export function sitemapPage(siteUrl: string): MetadataRoute.Sitemap {
  return sitemapEntries(siteUrl, PAGES, episodePublishedOn);
}
