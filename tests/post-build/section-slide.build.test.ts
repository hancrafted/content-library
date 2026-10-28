// FE-002 post-build check: a Section may declare it has no section slide. The Explorable pages do; their table of
// contents still lists the Section and its anchor opens the first Slide, while an Episode that keeps its section
// slides renders as before.

import { existsSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { EXPORTED_EPISODE_SHAPED_PAGES, exportedPage, OUT_DIR } from './exported-pages';

const EXPLORABLE_PAGES = EXPORTED_EPISODE_SHAPED_PAGES.filter(({ folder }) => folder.startsWith('explorable-pages/'));
/** The Explorable page template switches the section slide off in only two of its Sections. */
const MIXED = 'templates/explorable-page';
const WITH_SECTION_SLIDE = EXPORTED_EPISODE_SHAPED_PAGES.filter(
  ({ folder }) => !folder.startsWith('explorable-pages/') && folder !== MIXED,
);
const MIXED_PAGES = EXPORTED_EPISODE_SHAPED_PAGES.filter(({ folder }) => folder === MIXED);

const CASES = (pages: typeof EXPLORABLE_PAGES) =>
  pages.flatMap(({ slug, route }) => LOCALES.map((locale) => ({ slug, url: localizePath(route, locale) })));

describe('section slide opt-out', () => {
  beforeAll(() => {
    if (!existsSync(OUT_DIR)) throw new Error('No out/ directory: run `npm run build` before `npm run test:build`.');
  });

  describe.each(CASES(EXPLORABLE_PAGES))('Explorable page $url', ({ url }) => {
    it('renders no section slide: its Section opens on a page Slide that no band sets apart', () => {
      // ARRANGE
      const $ = exportedPage(url);
      // ACT
      const sizes = $('[data-slot="slides"] > section[data-section] > [data-slide]')
        .toArray()
        .map((slide) => $(slide).attr('data-size'));
      // ASSERT
      expect(sizes.length).toBeGreaterThan(0);
      expect(sizes.filter((size) => size === 'section')).toEqual([]);
    });

    it('still lists the Section in the table of contents, its anchor opening the first Slide', () => {
      // ARRANGE
      const $ = exportedPage(url);
      const section = $('[data-slot="slides"] > section[data-section]').first();
      const anchor = section.attr('data-section') ?? '';
      // ACT
      const firstSlide = section.children('[data-slide]').first().attr('id');
      const fragments = $('[data-slot="toc"] [data-testid="toc"] a[href*="#"]')
        .toArray()
        .map((link) => ($(link).attr('href') ?? '').split('#')[1]);
      // ASSERT
      expect(firstSlide).toBe(anchor);
      expect(fragments).toContain(anchor);
    });
  });

  describe.each(CASES(WITH_SECTION_SLIDE))('Episode page $url', ({ url }) => {
    it('renders every Section with its section slide, set apart by its size', () => {
      // ARRANGE
      const $ = exportedPage(url);
      // ACT
      const firsts = $('[data-slot="slides"] > section[data-section]')
        .toArray()
        .map((section) => $(section).children('[data-slide]').first().attr('data-size'));
      // ASSERT
      expect(firsts.length).toBeGreaterThan(0);
      expect(firsts.every((size) => size === 'section')).toBe(true);
    });
  });

  describe.each(CASES(MIXED_PAGES))('Explorable page template $url', ({ url }) => {
    it('switches the section slide off in its hook and how-to-use Sections only', () => {
      // ARRANGE
      const $ = exportedPage(url);
      const expected = [
        ['hook', false],
        ['what-it-is', true],
        ['why-it-matters', true],
        ['how-to-use-it', false],
      ];
      // ACT
      const sections = $('[data-slot="slides"] > section[data-section]')
        .toArray()
        .map((section) => [
          $(section).attr('data-section'),
          $(section).children('[data-slide]').first().attr('data-size') === 'section',
        ]);
      // ASSERT
      expect(sections).toEqual(expected);
    });
  });
});
