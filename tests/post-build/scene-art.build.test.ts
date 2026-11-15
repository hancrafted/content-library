// Scene art in the export (FE-005 §5, FE-009 §4, design-ADR 0025): `npm run art` wrote every drawing to out/art/
// under a content hash, every page's `<use>` points at a file that is there, reaches the static HTML without an `href`
// so its Scene's client root loads it, and every file is the cross-browser form: no stylesheet, no class, no hook.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXPORTED_PAGES, exportedPage, OUT_DIR, resolveBasePath } from './exported-pages';

const ART_DIR = join(OUT_DIR, 'art');
const manifest = JSON.parse(readFileSync(join(ART_DIR, 'manifest.json'), 'utf8')) as Record<string, string | null>;
const files = readdirSync(ART_DIR).filter((file) => file.endsWith('.svg'));
/** The art file a `<use>` URL names, without the base path and the fragment. */
const fileOf = (url: string) =>
  url
    .slice(resolveBasePath().length)
    .replace(/^\/art\//, '')
    .replace(/#.*$/, '');

/** Every art `<use>` of every exported page: its page, its URL, its `href`, and whether a Scene root loads it. */
const uses = EXPORTED_PAGES.flatMap(({ url }) => {
  const $ = exportedPage(url);
  return $('use[data-art]')
    .toArray()
    .map((use) => ({
      page: url,
      art: $(use).attr('data-art') ?? '',
      href: $(use).attr('href'),
      loaded: $(use).closest('[data-art-root]').length > 0,
    }));
});

describe('success cases', () => {
  it('writes every file the manifest names into out/art/', () => {
    // ARRANGE
    const named = Object.values(manifest).filter((url): url is string => url !== null);
    // ACT
    const missing = named.filter((url) => !existsSync(join(ART_DIR, fileOf(url))));
    // ASSERT
    expect(missing).toEqual([]);
  });

  it('points every <use> of every page at a file in out/art/, under a Scene root that loads it', () => {
    // ARRANGE
    const expected: typeof uses = [];
    // ACT
    const broken = uses.filter(({ art, loaded }) => !loaded || !files.includes(fileOf(art)));
    // ASSERT
    expect(uses.length).toBeGreaterThan(0);
    expect(broken).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('ships no <use> with an href in the static HTML, so far art waits for its Slide', () => {
    // ARRANGE
    const expected: typeof uses = [];
    // ACT
    const eager = uses.filter(({ href }) => href !== undefined);
    // ASSERT
    expect(eager).toEqual(expected);
  });

  it('ships every file in the form WebKit and Firefox paint: no stylesheet, no class, no paint hook', () => {
    // ARRANGE
    const stylable = /<style|\sclass=|\sdata-/;
    // ACT
    const styled = files.filter((file) => stylable.test(readFileSync(join(ART_DIR, file), 'utf8')));
    // ASSERT
    expect(styled).toEqual([]);
  });
});

describe('edge cases', () => {
  it('serves the art folder immutable, so a remount after a scroll asks the server nothing', () => {
    // ARRANGE
    const rule = '/art/*\n  Cache-Control: public, max-age=31536000, immutable';
    // ACT
    const headers = readFileSync(join(OUT_DIR, '_headers'), 'utf8');
    // ASSERT
    expect(headers).toContain(rule);
  });
});
