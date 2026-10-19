// Brand symbol post-build check (`npm run test:build`, after `npm run build`):
// every exported page links the favicon and the Apple touch icon under the base
// path, both files land in `out/`, and the header brand renders the symbol with
// the favicon's geometry. `src/app/icon.svg` is the geometry's source of truth.

import { load } from 'cheerio';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXPORTED_PAGES, exportedPage, OUT_DIR, resolveBasePath } from './exported-pages';

const basePath = resolveBasePath();
const HOME_URL = '/';

describe('brand symbol', () => {
  it.each(EXPORTED_PAGES)('$url links the SVG favicon and the Apple touch icon', ({ url }) => {
    // ARRANGE
    const $ = exportedPage(url);
    const iconHref = `${basePath}/icon.svg`;
    const appleIconHref = `${basePath}/apple-icon.png`;
    // ACT
    const icon = ($('link[rel="icon"][type="image/svg+xml"]').attr('href') ?? '').split('?')[0];
    const appleIcon = ($('link[rel="apple-touch-icon"]').attr('href') ?? '').split('?')[0];
    // ASSERT
    expect(icon).toBe(iconHref);
    expect(appleIcon).toBe(appleIconHref);
  });

  it('writes the favicon, carrying its own dark colours, and the Apple touch icon', () => {
    // ARRANGE
    const iconFile = 'icon.svg';
    const appleIconFile = 'apple-icon.png';
    const darkQuery = 'prefers-color-scheme:dark';
    // ACT
    const written = readdirSync(OUT_DIR);
    const svg = readFileSync(join(OUT_DIR, iconFile), 'utf8');
    // ASSERT
    expect(written).toEqual(expect.arrayContaining([iconFile, appleIconFile]));
    expect(svg).toContain(darkQuery);
  });

  it('draws the header symbol with the favicon geometry', () => {
    // ARRANGE
    const favicon = load(readFileSync(join(OUT_DIR, 'icon.svg'), 'utf8'), { xmlMode: true });
    const faviconShapes = favicon('circle, path')
      .toArray()
      .map((shape) => favicon(shape).attr('d') ?? `${shape.attribs.cx},${shape.attribs.cy},${shape.attribs.r}`);
    // ACT
    const $ = exportedPage(HOME_URL);
    const headerShapes = $('[data-testid="brand-symbol"]')
      .find('circle, path')
      .toArray()
      .map((shape) => $(shape).attr('d') ?? `${shape.attribs.cx},${shape.attribs.cy},${shape.attribs.r}`);
    // ASSERT
    expect(faviconShapes).not.toEqual([]);
    expect(headerShapes).toEqual(faviconShapes);
  });

  it.each(EXPORTED_PAGES)('$url renders the brand symbol beside the name in the header brand', ({ url }) => {
    // ARRANGE
    const $ = exportedPage(url);
    const siteName = 'hancrafted';
    // ACT
    const brand = $('[data-testid="brand"]');
    const symbols = brand.find('svg[data-testid="brand-symbol"][aria-hidden="true"]');
    // ASSERT
    expect(symbols).toHaveLength(1);
    expect(brand.text().trim()).toBe(siteName);
  });
});
