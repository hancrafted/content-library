// FE-002 post-build check: every exported Episode page, in every locale, has
// the structure EpisodePageContainer promises. It is the final net under the
// typed record, the derivation test and the heading lint, and reads the HTML
// exactly as a visitor or crawler receives it.

import { load, type CheerioAPI } from 'cheerio';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { sectionAnchor, slideAnchor } from '../../src/lib/episode.pure';
import { DEFAULT_LOCALE, LOCALES, localizePath } from '../../src/lib/locale.pure';
import { EPISODE_SLUGS, episodeRoute } from '../../src/lib/routes';
import { exportedFile, OUT_DIR } from './exported-pages';

const PAGES = EPISODE_SLUGS.flatMap((slug) =>
  LOCALES.map((locale) => ({ slug, locale, url: localizePath(episodeRoute(slug), locale) })),
);

function html(url: string): string {
  return readFileSync(join(OUT_DIR, exportedFile(url)), 'utf8');
}

function page(url: string): CheerioAPI {
  return load(html(url));
}

function slotsOf($: CheerioAPI, selector: string): (string | undefined)[] {
  return $(selector)
    .children()
    .toArray()
    .map((child) => $(child).attr('data-slot'));
}

/** Each slide's `h2` and `h3` counts, section by section, in page order. */
function headingsBySlide($: CheerioAPI): { h2: number; h3: number }[][] {
  return $('[data-slot="slides"] > section[data-section]')
    .toArray()
    .map((section) =>
      $(section)
        .children('[data-slide]')
        .toArray()
        .map((slide) => ({ h2: $(slide).find('h2').length, h3: $(slide).find('h3').length })),
    );
}

function slideAnchors($: CheerioAPI): string[] {
  return $('[data-slide]')
    .toArray()
    .map((slide) => $(slide).attr('id') ?? '');
}

function tocFragments($: CheerioAPI): string[] {
  return $('[data-slot="toc"] [data-testid="toc"] a[href*="#"]')
    .toArray()
    .map((link) => ($(link).attr('href') ?? '').split('#')[1]);
}

/** Every Slide wrapper under one Section, with its id: the Section's own slide first. */
function wrapperIdsBySection($: CheerioAPI): { section: string; ids: string[] }[] {
  return $('[data-slot="slides"] > section[data-section]')
    .toArray()
    .map((section) => ({
      section: $(section).attr('data-section') ?? '',
      ids: $(section)
        .children('[data-slide]')
        .toArray()
        .map((wrapper) => $(wrapper).attr('id') ?? ''),
    }));
}

describe('episode structure', () => {
  beforeAll(() => {
    if (!existsSync(OUT_DIR)) {
      throw new Error(`No out/ directory at ${OUT_DIR} — run \`npm run build\` before \`npm run test:build\`.`);
    }
    // A walk over zero pages passes silently, so the count is printed as a diagnostic.
    console.info(`episode structure: walking ${PAGES.length} Episode pages`);
  });

  describe.each(PAGES)('$url', ({ slug, url }) => {
    it('holds the table of contents, then the slides', () => {
      // ARRANGE
      const expected = ['toc', 'slides', 'context'];
      // ACT
      const slots = slotsOf(page(url), '[data-slot="episode-page"]');
      // ASSERT
      expect(slots).toEqual(expected);
    });

    it("opens the slides with the Title slide, which holds the page's only h1", () => {
      // ARRANGE
      const $ = page(url);
      const titleSlide = 'title-slide';
      // ACT
      const first = slotsOf($, '[data-slot="slides"]')[0];
      const h1Total = $('h1').length;
      const h1InTitleSlide = $('[data-slot="title-slide"] h1').length;
      // ASSERT
      expect(first).toBe(titleSlide);
      expect(h1Total).toBe(1);
      expect(h1InTitleSlide).toBe(1);
    });

    it('gives each section slide one h2, each page slide one h3, and h2/h3 nowhere else', () => {
      // ARRANGE
      const $ = page(url);
      const sectionSlide = { h2: 1, h3: 0 };
      const pageSlide = { h2: 0, h3: 1 };
      // ACT
      const sections = headingsBySlide($);
      const expected = sections.map((slides) => slides.map((_, index) => (index === 0 ? sectionSlide : pageSlide)));
      const totals = { h2: $('h2').length, h3: $('h3').length };
      const slideTotals = { h2: sections.length, h3: sections.flat().length - sections.length };
      // ASSERT
      expect(sections.length).toBeGreaterThan(0);
      expect(sections).toEqual(expected);
      expect(totals).toEqual(slideTotals);
    });

    it('links the table of contents to every slide anchor, in page order', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const fragments = tocFragments($);
      const anchors = slideAnchors($);
      // ASSERT
      expect(fragments).toEqual(anchors);
    });

    it('lays the slides out in a single-column grid that hosts the portal root', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const area = $('[data-slot="slides"]');
      const portalRoots = area.children('[data-slot="portal-root"]').length;
      // ASSERT
      expect(area.is('main')).toBe(true);
      expect((area.attr('class') ?? '').split(/\s+/)).toEqual(expect.arrayContaining(['grid', 'grid-cols-1']));
      expect(portalRoots).toBe(1);
    });

    it('keeps every Section a display:contents group, so each wrapper is a grid cell', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const groups = $('[data-slot="slides"] > section[data-section]').toArray();
      const classes = groups.map((group) => ($(group).attr('class') ?? '').split(/\s+/));
      // ASSERT
      expect(groups.length).toBeGreaterThan(0);
      for (const list of classes) expect(list).toContain('contents');
    });

    it('gives each Slide wrapper the id slideAnchor() derives, and no wrapper clips', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const sections = wrapperIdsBySection($);
      const derived = sections.map(({ section, ids }) => ({
        section,
        ids: ids.map((id, index) =>
          index === 0 ? sectionAnchor(section) : slideAnchor(section, id.slice(slideAnchor(section, '').length)),
        ),
      }));
      const clipping = $('[data-slide]')
        .toArray()
        .filter((wrapper) => /\boverflow-/.test($(wrapper).attr('class') ?? ''));
      // ASSERT
      expect(sections).toEqual(derived);
      expect(clipping).toEqual([]);
    });

    it('prerenders every Slide with its content mounted, inside one mount per wrapper', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const wrappers = $('[data-slide]').toArray();
      const mounts = wrappers.map((wrapper) => $(wrapper).children('[data-slot="slide-mount"]'));
      // ASSERT: no Slide is far in the static HTML, so deep links, print and crawlers see everything
      expect(wrappers.length).toBeGreaterThan(0);
      for (const mount of mounts) {
        expect(mount.length).toBe(1);
        expect(mount.attr('data-zone')).toBe('near');
        expect(mount.children().length).toBeGreaterThan(0);
      }
    });

    it('carries no id twice', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const ids = $('[id]')
        .toArray()
        .map((element) => $(element).attr('id'));
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      // ASSERT
      expect(duplicates).toEqual([]);
    });

    it('requests nothing from YouTube before the reader presses play', () => {
      // ARRANGE
      const source = html(url);
      const youtube = /youtube(-nocookie)?\.com|youtu\.be/;
      // ACT
      const iframes = load(source)('iframe').length;
      // ASSERT
      expect(iframes).toBe(0);
      expect(source).not.toMatch(youtube);
    });

    it('carries the same slide anchors as the default locale', () => {
      // ARRANGE
      const reference = slideAnchors(page(localizePath(episodeRoute(slug), DEFAULT_LOCALE)));
      // ACT
      const anchors = slideAnchors(page(url));
      // ASSERT
      expect(anchors).toEqual(reference);
    });
  });
});
