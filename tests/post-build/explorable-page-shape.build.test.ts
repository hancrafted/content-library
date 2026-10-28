// Explorable page shape (#416): every Explorable page and the page template, in both locales, is a Title slide, the
// Section `about` (one Why, How, What slide whose columns each carry a cited Speaker note) and the Section `play`
// (the Explorable). No Preset gallery Slide remains.

import { existsSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { EXPORTED_EPISODE_SHAPED_PAGES, exportedPage, OUT_DIR } from './exported-pages';

const SHAPED = EXPORTED_EPISODE_SHAPED_PAGES.filter(
  ({ folder }) => folder.startsWith('explorable-pages/') || folder === 'templates/explorable-page',
);
const COLUMNS = ['why', 'how', 'what'];

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
});
