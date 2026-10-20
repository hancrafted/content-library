import { SITE_URL } from '@/lib/site-url';
import { robotsFor } from '@/lib/sitemap.pure';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return robotsFor(SITE_URL);
}
