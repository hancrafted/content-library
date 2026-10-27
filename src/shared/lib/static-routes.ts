import { localizePath, type Locale } from './locale.pure';

/*
 * The static routes: the logical paths of the site's own pages, which know nothing of a record. A record's path
 * (an Episode's, an Event's) is the content store's, `src/content-store/catalogue/record-routes.ts`.
 */

/** Locale-neutral logical paths. Turn one into a URL with `localizePath`. */
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  /** Prefix every Episode route sits under; there is an index page at this path. */
  episodes: '/episodes',
  /** The Events list; each Event's page sits under this path. */
  events: '/events',
  /** The Resources list; each Resource's page sits under its type's plural, `record-routes.ts`. */
  resources: '/resources',
} as const;

/** The URL a logical path is served at under `siteUrl`: `trailingSlash` makes it the canonical, the origin alone for the home page. */
export function servedUrl(siteUrl: string, route: string, locale: Locale): string {
  const path = localizePath(route, locale);
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`;
}
