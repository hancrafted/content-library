import { episodePublishedOn, pageFacts } from '@/content-store/store';
import { sitemapEntries } from '@/lib/sitemap.pure';
import type { MetadataRoute } from 'next';

/** The sitemap's composition root (FE-007 §1): the route reaches the facts of each page (visibility and status), read from the content store, only through here. */
export function sitemapPage(siteUrl: string): MetadataRoute.Sitemap {
  return sitemapEntries(siteUrl, pageFacts, episodePublishedOn);
}
