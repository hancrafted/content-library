// Explorable page shape (#416): every Explorable page and the page template, in both locales, is a Title slide, the
// Section `about` (one Why, How, What slide whose columns each carry a cited Speaker note) and the Section `play`
// (the Explorable). No Preset gallery Slide remains.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { EXPORTED_EPISODE_SHAPED_PAGES, exportedFile, exportedPage, OUT_DIR } from './exported-pages';

const SHAPED = EXPORTED_EPISODE_SHAPED_PAGES.filter(
  ({ folder }) => folder.startsWith('explorable-pages/') || folder === 'templates/explorable-page',
);
const COLUMNS = ['why', 'how', 'what'];
const TEMPLATE_FOLDER = 'templates/explorable-page';
/** What only the page template may ship: its placeholder source URL and its "Replace with ..." words. */
const PLACEHOLDER = /example\.com\/replace-with-a-source|replace with/i;
const exportedHtml = (url: string) => readFileSync(join(OUT_DIR, exportedFile(url)), 'utf8');

const CASES = SHAPED.flatMap(({ slug, route }) =>
  LOCALES.map((locale) => ({ slug, url: localizePath(route, locale) })),
);

describe('explorable page shape', () => {
  beforeAll(() => {
    if (!existsSync(OUT_DIR)) throw new Error('No out/ directory: run `npm run build` before `npm run test:build`.');
  });

  describe.each(CASES)('$url', ({ url }) => {
    it('has exactly a Title slide, #about and #play', () => {
      // ARRANGE
      const $ = exportedPage(url);
      const expected = ['top', 'about', 'play'];
      // ACT
      const ids = $('[data-slot="slides"] [data-slide]')
        .toArray()
        .map((slide) => $(slide).attr('id'));
      // ASSERT
      expect(ids).toEqual(expected);
    });

    it('shows Why, How and What on #about, each column with a Speaker note that cites a source', () => {
      // ARRANGE
      const $ = exportedPage(url);
      // ACT
      const columns = $('#about [data-column]')
        .toArray()
        .map((column) => $(column).attr('data-column'));
      const notes = $('#context-panel-notes [data-context-for="about"]').text();
      // ASSERT
      expect(columns).toEqual(COLUMNS);
      expect(notes.match(/Sources \(\d+\)|Quellen \(\d+\)/g)).toHaveLength(COLUMNS.length);
    });
  });

  describe('placeholders', () => {
    const [template] = SHAPED.filter(({ folder }) => folder === TEMPLATE_FOLDER);
    const pages = SHAPED.filter(({ folder }) => folder !== TEMPLATE_FOLDER);
    const urls = (route: string) => LOCALES.map((locale) => localizePath(route, locale));

    it('is found on the template page, so the check below can fail', () => {
      // ARRANGE
      const expected = [true, true];
      // ACT
      const found = urls(template.route).map((url) => PLACEHOLDER.test(exportedHtml(url)));
      // ASSERT
      expect(found).toEqual(expected);
    });

    it('is shipped by no Explorable page', () => {
      // ARRANGE
      const expected: string[] = [];
      // ACT
      const shipped = pages.flatMap(({ route }) => urls(route)).filter((url) => PLACEHOLDER.test(exportedHtml(url)));
      // ASSERT
      expect(shipped).toEqual(expected);
    });
  });
});
