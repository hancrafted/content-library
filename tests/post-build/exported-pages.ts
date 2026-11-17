import { load, type CheerioAPI } from 'cheerio';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import nextConfig from '../../next.config';
import { pageLocales, routeOf, type EpisodesPathSlug } from '../../src/content-store/catalogue/record-routes';
import { episodesPathParams, PAGES } from '../../src/content-store/store';
import { localizePath, type Locale } from '../../src/shared/lib/locale.pure';

export const OUT_DIR = join(import.meta.dirname, '..', '..', 'out');

export interface ExportedPage {
  locale: Locale;
  url: string;
  selfCanonical: boolean;
}

export const EXPORTED_EPISODES_PATH_SLUGS: readonly EpisodesPathSlug[] = episodesPathParams().map(
  ({ episode }) => episode,
);

export interface EpisodeShapedPage {
  readonly slug: string;
  readonly route: string;
  readonly folder: string;
  readonly isNotEpisode: boolean;
}

export const EXPORTED_EPISODE_SHAPED_PAGES: readonly EpisodeShapedPage[] = PAGES.flatMap(
  ({ page, treatment }): EpisodeShapedPage[] => {
    if (!treatment.exported) return [];
    if (page.kind === 'episode') {
      return [{ slug: page.episode.slug, route: routeOf(page), folder: page.episode.slug, isNotEpisode: false }];
    }
    if (page.kind === 'explorable-page') {
      const { slug } = page.explorablePage;
      return [{ slug, route: routeOf(page), folder: `explorable-pages/${slug}`, isNotEpisode: true }];
    }
    if (page.kind === 'guide') {
      const { slug } = page.guide;
      return [{ slug, route: routeOf(page), folder: `guides/${slug}`, isNotEpisode: true }];
    }
    if (page.kind === 'template') {
      const { slug } = page.template;
      return [{ slug, route: routeOf(page), folder: `templates/${slug}`, isNotEpisode: true }];
    }
    return [];
  },
);

export const EXPORTED_PAGES: readonly ExportedPage[] = PAGES.filter(({ treatment }) => treatment.exported).flatMap(
  ({ page, treatment }) =>
    pageLocales(page).map((locale) => ({
      locale,
      url: localizePath(routeOf(page), locale),
      selfCanonical: treatment.canonical === 'self',
    })),
);

export function exportedFile(url: string): string {
  if (url === '/') return 'index.html';
  const path = url.slice(1);
  return nextConfig.trailingSlash ? join(path, 'index.html') : `${path}.html`;
}

const pagesParsedOncePerTestFileAndSharedReadOnly = new Map<string, CheerioAPI>();

export function exportedPage(url: string): CheerioAPI {
  let page = pagesParsedOncePerTestFileAndSharedReadOnly.get(url);
  if (page === undefined) {
    page = load(readFileSync(join(OUT_DIR, exportedFile(url)), 'utf8'));
    pagesParsedOncePerTestFileAndSharedReadOnly.set(url, page);
  }
  return page;
}

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

export function redirectRules(): { from: string; to: string; status: string }[] {
  return readFileSync(join(OUT_DIR, '_redirects'), 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status] = line.trim().split(/\s+/);
      return { from, to, status };
    });
}
