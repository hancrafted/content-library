// Shared by the post-build tests: the page URLs the app derives and the file
// `next build` writes for each. Derived from the page catalogue the site renders
// from, so no page list is hand-kept.

import { load, type CheerioAPI } from 'cheerio';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import nextConfig from '../../next.config';
import { episodesPathParams, PAGES } from '../../src/content-store/store';
import { localizePath, type Locale } from '../../src/lib/locale.pure';
import { pageLocales, routeOf, type EpisodesPathSlug } from '../../src/lib/routes';

export const OUT_DIR = join(import.meta.dirname, '..', '..', 'out');

export interface ExportedPage {
  locale: Locale;
  url: string;
  /** Whether the page is its own canonical: a public Episode under an Event credits its own `/episodes/` page. */
  selfCanonical: boolean;
}

/** Every slug with a page exported at `/episodes/<slug>/`: each tooling page and each public Episode. */
export const EXPORTED_EPISODES_PATH_SLUGS: readonly EpisodesPathSlug[] = episodesPathParams().map(
  ({ episode }) => episode,
);

/** Every page the catalogue builds, in each locale it is built in: an unlisted Episode has no `/episodes/` page. */
export const EXPORTED_PAGES: readonly ExportedPage[] = PAGES.filter(({ treatment }) => treatment.exported).flatMap(
  ({ page, treatment }) =>
    pageLocales(page).map((locale) => ({
      locale,
      url: localizePath(routeOf(page), locale),
      selfCanonical: treatment.canonical === 'self',
    })),
);

/** The file `next build` writes for a URL: `trailingSlash` puts `/de` at `de/index.html`, else `de.html`. */
export function exportedFile(url: string): string {
  if (url === '/') return 'index.html';
  const path = url.slice(1);
  return nextConfig.trailingSlash ? join(path, 'index.html') : `${path}.html`;
}

const parsedPages = new Map<string, CheerioAPI>();

/**
 * The exported page for a URL, parsed once per test file and shared by every test in it: a page is
 * read dozens of times, and re-parsing it per test dominated the post-build lane. Read only — a test
 * that mutates the document would leak into the next one.
 */
export function exportedPage(url: string): CheerioAPI {
  let page = parsedPages.get(url);
  if (page === undefined) {
    page = load(readFileSync(join(OUT_DIR, exportedFile(url)), 'utf8'));
    parsedPages.set(url, page);
  }
  return page;
}

/** The base path the export was built under: the env override, else `SITE_URL`'s path, else `next.config`. */
export function resolveBasePath(): string {
  if (process.env.NEXT_PUBLIC_BASE_PATH) return process.env.NEXT_PUBLIC_BASE_PATH;
  if (process.env.SITE_URL) {
    try {
      const pathname = new URL(process.env.SITE_URL).pathname.replace(/\/+$/, '');
      if (pathname) return pathname;
    } catch {
      // ignore
    }
  }
  return nextConfig.basePath ?? '';
}

/** The `_redirects` rules as source, target and status, comments and blank lines dropped. */
export function redirectRules(): { from: string; to: string; status: string }[] {
  return readFileSync(join(OUT_DIR, '_redirects'), 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status] = line.trim().split(/\s+/);
      return { from, to, status };
    });
}
