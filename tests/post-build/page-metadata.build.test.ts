// FE-008 post-build check: every exported page carries one canonical pointing at
// itself, and hreflang alternates that resolve to exported files and link back.
// Reads the built HTML, so it judges what crawlers see, not what the code meant.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { resolveSiteUrl } from '../../src/lib/page-metadata.pure';
import { EXPORTED_PAGES, exportedFile, OUT_DIR } from './exported-pages';

// The deploy passes the configure-pages URL here too, so a build that lost its
// SITE_URL — and emitted localhost canonicals — fails against the workflow's value.
const SITE_URL = resolveSiteUrl(process.env);

interface PageLinks {
  file: string;
  canonicals: string[];
  /** hreflang → absolute href. */
  alternates: Record<string, string>;
}

const LINK_TAG_RE = /<link\b[^>]*>/g;

function attribute(tag: string, name: string): string | undefined {
  return new RegExp(`\\b${name}="([^"]*)"`, 'i').exec(tag)?.[1];
}

function readLinks(file: string): PageLinks {
  const html = readFileSync(join(OUT_DIR, file), 'utf8');
  const links: PageLinks = { file, canonicals: [], alternates: {} };
  for (const [tag] of html.matchAll(LINK_TAG_RE)) {
    const rel = attribute(tag, 'rel');
    const href = attribute(tag, 'href');
    const lang = attribute(tag, 'hreflang');
    if (href === undefined) continue;
    if (rel === 'canonical') links.canonicals.push(href);
    if (rel === 'alternate' && lang !== undefined) links.alternates[lang] = href;
  }
  return links;
}

/** The exported file an absolute same-site URL lands on, or undefined when it leaves the site. */
function fileForHref(href: string): string | undefined {
  if (!href.startsWith(`${SITE_URL}/`)) return undefined;
  const path = href.slice(SITE_URL.length).replace(/\/+$/, '') || '/';
  return exportedFile(path);
}

/** The alternates of a page whose target does not name the page back under the page's own language. */
function oneWayAlternates(page: PageLinks, byFile: ReadonlyMap<string, PageLinks>): string[] {
  const self = page.canonicals[0];
  const ownLang = Object.entries(page.alternates).find(([lang, href]) => lang !== 'x-default' && href === self)?.[0];
  return Object.entries(page.alternates)
    .filter(([lang]) => lang !== 'x-default')
    .filter(([, href]) => {
      const target = byFile.get(fileForHref(href) ?? '');
      return ownLang === undefined || target?.alternates[ownLang] !== self;
    })
    .map(([lang, href]) => `${page.file} → ${lang} ${href}`);
}

/** The absolute URL a crawler should see for a page: trailing slash, as GitHub Pages serves it unredirected. */
function servedUrl(url: string): string {
  return url === '/' ? `${SITE_URL}/` : `${SITE_URL}${url}/`;
}

describe('page metadata', () => {
  let pages: PageLinks[] = [];

  beforeAll(() => {
    if (!existsSync(OUT_DIR)) {
      throw new Error(`No out/ directory at ${OUT_DIR} — run \`npm run build\` before \`npm run test:build\`.`);
    }
    pages = EXPORTED_PAGES.map((page) => readLinks(exportedFile(page.url)));
    // A reciprocity walk over zero pages passes silently, so the count is printed as a diagnostic.
    const alternateCount = pages.reduce((sum, page) => sum + Object.keys(page.alternates).length, 0);
    console.info(`page metadata: walked ${pages.length} pages, ${alternateCount} alternates, site ${SITE_URL}`);
  });

  it('gives every page exactly one canonical, pointing at the page itself', () => {
    // ARRANGE
    const expected = EXPORTED_PAGES.map((page) => ({
      file: exportedFile(page.url),
      canonicals: [servedUrl(page.url)],
    }));
    // ACT
    const actual = pages.map(({ file, canonicals }) => ({ file, canonicals }));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('lists every locale and x-default as an alternate on every page', () => {
    // ARRANGE
    const expectedLangs = [...new Set(EXPORTED_PAGES.map((page) => page.locale)), 'x-default'].sort();
    // ACT
    const actual = pages.map(({ file, alternates }) => ({ file, langs: Object.keys(alternates).sort() }));
    // ASSERT
    expect(actual).toEqual(pages.map(({ file }) => ({ file, langs: expectedLangs })));
  });

  it('points every alternate at an exported file', () => {
    // ARRANGE
    const dangling: string[] = [];
    // ACT
    for (const page of pages) {
      for (const [lang, href] of Object.entries(page.alternates)) {
        const target = fileForHref(href);
        if (target === undefined || !existsSync(join(OUT_DIR, target))) dangling.push(`${page.file} → ${lang} ${href}`);
      }
    }
    // ASSERT
    expect(dangling).toEqual([]);
  });

  it('has every alternate link back to the page that names it', () => {
    // ARRANGE
    const byFile = new Map(pages.map((page) => [page.file, page]));
    // ACT
    const oneWay = pages.flatMap((page) => oneWayAlternates(page, byFile));
    // ASSERT
    expect(oneWay).toEqual([]);
  });
});
