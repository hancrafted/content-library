// Shared by the post-build tests: the page URLs the app derives and the file
// `next build` writes for each. Derived from the modules the site renders from,
// so no page list is hand-kept.

import { join } from 'node:path';
import nextConfig from '../../next.config';
import { localizePath, type Locale } from '../../src/lib/locale.pure';
import { EPISODE_SLUGS, pageLocales, routeOf, type PageRef } from '../../src/lib/routes';

export const OUT_DIR = join(import.meta.dirname, '..', '..', 'out');

export interface ExportedPage {
  locale: Locale;
  url: string;
}

const PAGES: readonly PageRef[] = ['home', 'dashboard', 'episodes', ...EPISODE_SLUGS.map((episode) => ({ episode }))];

export const EXPORTED_PAGES: readonly ExportedPage[] = PAGES.flatMap((page) =>
  pageLocales(page).map((locale) => ({ locale, url: localizePath(routeOf(page), locale) })),
);

/** The file `next build` writes for a URL: `trailingSlash` puts `/de` at `de/index.html`, else `de.html`. */
export function exportedFile(url: string): string {
  if (url === '/') return 'index.html';
  const path = url.slice(1);
  return nextConfig.trailingSlash ? join(path, 'index.html') : `${path}.html`;
}
