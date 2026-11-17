import { localizePath, type Locale } from './locale.pure';

/*
 * The static routes: the logical paths of the site's own pages, which know nothing of a record. A record's path
 * (an Episode's, an Event's) is the content store's, `src/content-store/catalogue/record-routes.ts`.
 */

export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  episodes: '/episodes',
  events: '/events',
  explorables: '/explorables',
  guides: '/guides',
  resources: '/resources',
} as const;

export function servedUrl(siteUrl: string, route: string, locale: Locale): string {
  const path = localizePath(route, locale);
  return path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`;
}
