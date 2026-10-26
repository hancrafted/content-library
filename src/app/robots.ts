import { robotsFor } from '@/page-assembly/sitemap/sitemap.pure';
import { SITE_URL } from '@/shared/lib/site-url';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return robotsFor(SITE_URL);
}
