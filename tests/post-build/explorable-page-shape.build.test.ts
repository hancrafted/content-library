import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { EXPORTED_EPISODE_SHAPED_PAGES, exportedFile, exportedPage, OUT_DIR } from './exported-pages';

const SHAPED = EXPORTED_EPISODE_SHAPED_PAGES.filter(
  ({ folder }) => folder.startsWith('explorable-pages/') || folder === 'templates/explorable-page',
);
const COLUMNS = ['why', 'how', 'what'];
type ColumnNotes = Readonly<Record<'why' | 'how' | 'what', number>>;
const DEFAULT_NOTES: ColumnNotes = { why: 1, how: 1, what: 1 };
const COLUMN_NOTES: Readonly<Record<string, ColumnNotes>> = {
  'ai-capability': { why: 2, how: 1, what: 1 },
  'software-ecology': { why: 2, how: 0, what: 2 },
};
const GLOW_ONLY_PAGES: readonly string[] = ['software-ecology', 'brief-or-pay-the-price'];
const ABOUT_PENDING: readonly string[] = ['brief-or-pay-the-price'];
const TEMPLATE_FOLDER = 'templates/explorable-page';
const PLACEHOLDER = /example\.com\/replace-with-a-source|replace with/i;
const exportedHtml = (url: string) => readFileSync(join(OUT_DIR, exportedFile(url)), 'utf8');

const CASES = SHAPED.flatMap(({ slug, route }) =>
  LOCALES.map((locale) => ({ slug, url: localizePath(route, locale) })),
);

describe('explorable page shape', () => {
  beforeAll(() => {
    if (!existsSync(OUT_DIR)) throw new Error('No out/ directory: run `npm run build` before `npm run test:build`.');
  });

  describe.each(CASES)('$url', ({ url, slug }) => {
    it('shows play as the first slide and about afterwards', () => {
      // ARRANGE
      const $ = exportedPage(url);
      const expected = ABOUT_PENDING.includes(slug) ? ['top', 'play'] : ['top', 'play', 'about'];
      // ACT
      const ids = $('[data-slot="slides"] [data-slide]')
        .toArray()
        .map((slide) => $(slide).attr('id'));
      // ASSERT
      expect(ids).toEqual(expected);
    });

    it.skipIf(ABOUT_PENDING.includes(slug))(
      'shows Why, How and What on #about, each column with the cited Speaker notes its page expects',
      () => {
        // ARRANGE
        const $ = exportedPage(url);
        const expected = COLUMN_NOTES[slug] ?? DEFAULT_NOTES;
        // ACT
        const columns = $('#about [data-column]')
          .toArray()
          .map((column) => $(column).attr('data-column'));
        const cited = $('#context-panel-notes [data-context-for="about"] li[data-note-target]')
          .toArray()
          .filter((note) => /Sources \(\d+\)|Quellen \(\d+\)/.test($(note).find('summary').text()));
        const notes = Object.fromEntries(
          COLUMNS.map((column) => [column, cited.filter((note) => $(note).attr('data-note-target') === column).length]),
        );
        // ASSERT
        expect(columns).toEqual(COLUMNS);
        expect(notes).toEqual(expected);
      },
    );
  });

  describe.each(
    SHAPED.filter(({ folder }) => folder !== TEMPLATE_FOLDER).flatMap(({ slug, route }) =>
      LOCALES.map((locale) => ({ slug, locale, url: localizePath(route, locale) })),
    ),
  )('hero of $url', ({ url, slug }) => {
    const play = `${url.replace(/\/$/, '')}/#play`;
    const about = ABOUT_PENDING.includes(slug) ? play : `${url.replace(/\/$/, '')}/#about`;

    it('links Try it to the Explorable and Why it matters to Why, How and What by their registered Slide anchors', () => {
      // ARRANGE
      const $ = exportedPage(url);
      const expected = [play, about];
      // ACT
      const links = $('[data-slot="title-slide"] a')
        .toArray()
        .map((link) => $(link).attr('href'));
      // ASSERT
      expect(links).toEqual(expected);
    });

    it('states the payoff as its h1 while the page title stays the Explorable name', () => {
      // ARRANGE
      const $ = exportedPage(url);
      // ACT
      const heading = $('[data-slot="title-slide"] h1').text();
      const title = $('title').text();
      // ASSERT
      expect(heading.length).toBeGreaterThan(title.split(' · ')[0].length);
      expect(title).not.toContain(heading);
    });

    it('keeps its pause button outside the decorative Backdrop, named and pressed-state ready', () => {
      // ARRANGE
      const $ = exportedPage(url);
      const button = $('[data-slot="title-slide"] [data-hero-motion-button]');
      // ACT
      const inside = button.closest('[aria-hidden="true"]').length;
      const pressed = button.attr('aria-pressed');
      const name = button.attr('aria-label');
      // ASSERT
      expect(inside).toBe(0);
      expect(pressed).toBe('false');
      expect(name).toBeTruthy();
    });

    it('draws its background on its three canvas layers inside the Backdrop, none on a glow-only hero, and requests nothing from the network', () => {
      // ARRANGE
      const $ = exportedPage(url);
      const layers = GLOW_ONLY_PAGES.includes(slug) ? 0 : 3;
      // ACT
      const canvases = $('[data-slot="title-slide"] [data-slot="slide-backdrop"] canvas').length;
      const remote = $('[data-slot="title-slide"] [src^="http"], [data-slot="title-slide"] [srcset]').length;
      // ASSERT
      expect(canvases).toBe(layers);
      expect(remote).toBe(0);
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
