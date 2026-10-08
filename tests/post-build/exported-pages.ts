// Shared by the post-build tests: the page URLs the app derives and the file
// `next build` writes for each. Derived from the modules the site renders from,
// so no page list is hand-kept.

import { join } from 'node:path';
import nextConfig from '../../next.config';
import { LOCALES, localizePath, type Locale } from '../../src/lib/locale.pure';
import { EPISODE_SLUGS, episodeRoute, ROUTES } from '../../src/lib/routes';

export const OUT_DIR = join(import.meta.dirname, '..', '..', 'out');

// ROUTES.episodes is only a prefix; every Episode is exported under it, one per registry slug (FE-002).
const PAGE_ROUTES = [ROUTES.home, ...EPISODE_SLUGS.map(episodeRoute)];

export interface ExportedPage {
  locale: Locale;
  url: string;
}

export const EXPORTED_PAGES: readonly ExportedPage[] = LOCALES.flatMap((locale) =>
  PAGE_ROUTES.map((route) => ({ locale, url: localizePath(route, locale) })),
);

/** The file `next build` writes for a URL: `trailingSlash` puts `/de` at `de/index.html`, else `de.html`. */
export function exportedFile(url: string): string {
  if (url === '/') return 'index.html';
  const path = url.slice(1);
  return nextConfig.trailingSlash ? join(path, 'index.html') : `${path}.html`;
}
