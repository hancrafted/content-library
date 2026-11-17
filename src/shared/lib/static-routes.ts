import { localizePath, type Locale } from './locale.pure';

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
