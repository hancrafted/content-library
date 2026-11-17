// decision: FE-005 §5
// decision: FE-009 §4
// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXPORTED_PAGES, exportedPage, OUT_DIR, resolveBasePath } from './exported-pages';

const ART_DIR = join(OUT_DIR, 'art');
const manifest = JSON.parse(readFileSync(join(ART_DIR, 'manifest.json'), 'utf8')) as Record<string, string | null>;
const files = readdirSync(ART_DIR).filter((file) => file.endsWith('.svg'));
const fileOf = (url: string) =>
  url
    .slice(resolveBasePath().length)
    .replace(/^\/art\//, '')
    .replace(/#.*$/, '');

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
