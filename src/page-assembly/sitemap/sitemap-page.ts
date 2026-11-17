import { episodePublishedOn, PAGES } from '@/content-store/store';
import { sitemapEntries } from '@/page-assembly/sitemap/sitemap.pure';
import type { MetadataRoute } from 'next';

// decision: FE-007 §1
export function sitemapPage(siteUrl: string): MetadataRoute.Sitemap {
  return sitemapEntries(siteUrl, PAGES, episodePublishedOn);
}
