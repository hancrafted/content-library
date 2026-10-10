// FE-002 post-build check: every exported Episode page, in every locale, has
// the structure EpisodePageContainer promises. It is the final net under the
// typed record, the derivation test and the heading lint, and reads the HTML
// exactly as a visitor or crawler receives it.

import { load, type CheerioAPI } from 'cheerio';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { TITLE_ANCHOR } from '../../src/lib/episode.pure';
import { DEFAULT_LOCALE, LOCALES, localizePath } from '../../src/lib/locale.pure';
import { EPISODE_SLUGS, episodeRoute } from '../../src/lib/routes';
import { exportedFile, OUT_DIR } from './exported-pages';
import { cssFiles, printBlocks } from './stylesheets';

const PAGES = EPISODE_SLUGS.flatMap((slug) =>
  LOCALES.map((locale) => ({ slug, locale, url: localizePath(episodeRoute(slug), locale) })),
);

/** Slides an Episode leaves untitled on purpose (FE-002 §2): rendered, never listed. */
const UNTITLED: Readonly<Record<string, readonly string[]>> = {
  'page-template': ['next-steps--what-comes-next'],
  'amnesiac-freelancer': ['where-it-breaks--one-line'],
};

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

  describe.each(PAGES)('$url', ({ slug, locale, url }) => {
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

    it('gives the Title slide wrapper the reserved id top, and links the table of contents heading to it', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const wrapper = $('[data-slot="title-slide"]');
      const heading = $('[data-slot="toc"] [data-testid="toc"] [data-testid="toc-top"]');
      // ASSERT
      expect(wrapper.attr('id')).toBe(TITLE_ANCHOR);
      expect(wrapper.attr('data-slide')).toBe('top');
      expect((heading.attr('href') ?? '').split('#')[1]).toBe('top');
    });

    it("explains the Context drawer on both tabs of the Title slide's item, in the page's locale", () => {
      // ARRANGE
      const $ = page(url);
      const translation = JSON.parse(
        readFileSync(join(import.meta.dirname, '..', '..', 'src', 'messages', `${locale}.json`), 'utf8'),
      );
      const expected = String(translation.contextDrawer.explainer).replace('{shortcut}', 'Alt+N');
      // ACT
      const item = (tab: string) => $(`#context-panel-${tab} [data-context-for="top"]`);
      const notes = item('notes').find('[role="note"]');
      const script = item('script').find('[role="note"]');
      const others = $('[data-slot="context"] [data-context-for]:not([data-context-for="top"]) [role="note"]');
      // ASSERT
      expect([notes.text().trim(), script.text().trim()]).toEqual([expected, expected]);
      expect($('[data-slot="context"] [role="alert"]').length).toBe(0);
      expect(others.length).toBe(0);
    });

    it('gives each section slide one h2, each titled page slide one h3, an untitled one none, and h2/h3 nowhere else', () => {
      // ARRANGE
      const $ = page(url);
      const untitled = UNTITLED[slug] ?? [];
      const sectionSlide = { h2: 1, h3: 0 };
      const titledSlide = { h2: 0, h3: 1 };
      const untitledSlide = { h2: 0, h3: 0 };
      // ACT
      const sections = headingsBySlide($);
      const ids = wrapperIdsBySection($);
      const expected = ids.map(({ ids: wrappers }) =>
        wrappers.map((id, index) => (index === 0 ? sectionSlide : untitled.includes(id) ? untitledSlide : titledSlide)),
      );
      const totals = { h2: $('h2').length, h3: $('h3').length };
      const slideTotals = {
        h2: sections.length,
        h3: sections.flat().length - sections.length - untitled.length,
      };
      // ASSERT
      expect(sections.length).toBeGreaterThan(0);
      expect(sections).toEqual(expected);
      expect(totals).toEqual(slideTotals);
    });

    it('heads each Slide written as a Slide file at the level its position gives it: h2 first in its Section, else h3', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const levels = $('[data-slot="slides"] > section[data-section]')
        .toArray()
        .map((section) =>
          $(section)
            .children('[data-slide]')
            .toArray()
            .map((slide) => $(slide).find('[data-target="title"]').first().prop('tagName')?.toLowerCase() ?? 'none'),
        );
      const untitled = UNTITLED[slug] ?? [];
      const expected = wrapperIdsBySection($).map(({ ids }) =>
        ids.map((id, index) => (index === 0 ? 'h2' : untitled.includes(id) ? 'none' : 'h3')),
      );
      // ASSERT
      expect(levels).toEqual(expected);
    });

    it('links the table of contents to every titled slide anchor, in page order', () => {
      // ARRANGE
      const $ = page(url);
      const untitled = UNTITLED[slug] ?? [];
      // ACT
      const fragments = tocFragments($);
      const anchors = slideAnchors($).filter((anchor) => !untitled.includes(anchor));
      // ASSERT: the heading's link to the Title slide comes first
      expect(fragments).toEqual(anchors);
      expect(fragments[0]).toBe(TITLE_ANCHOR);
    });

    it('renders an untitled Slide with its content, and lists it nowhere in the table of contents', () => {
      // ARRANGE
      const $ = page(url);
      const untitled = UNTITLED[slug] ?? [];
      // ACT
      const wrappers = untitled.map((id) => $(`[data-slot="slides"] [data-slide="${id}"]`));
      const fragments = tocFragments($);
      // ASSERT
      for (const wrapper of wrappers) {
        expect(wrapper.attr('id')).toBeTruthy();
        expect(wrapper.text().trim().length).toBeGreaterThan(0);
        expect(wrapper.find('h1, h2, h3').length).toBe(0);
      }
      for (const id of untitled) expect(fragments).not.toContain(id);
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

    it('lays out the page as overlays over a full-width Content area, with no three-column grid', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const container = ($('[data-slot="episode-page"]').attr('class') ?? '').split(/\s+/);
      const toc = ($('[data-slot="toc"]').attr('class') ?? '').split(/\s+/);
      const area = ($('[data-slot="slides"]').attr('class') ?? '').split(/\s+/);
      // ASSERT
      expect(container.some((name) => /grid-cols|^md:grid$/.test(name))).toBe(false);
      expect(container).toEqual(expect.arrayContaining(['[--inset-l:1rem]', '[--inset-r:1rem]']));
      expect(toc).toEqual(expect.arrayContaining(['md:fixed']));
      expect(area).toEqual(
        expect.arrayContaining(['[&_[data-slide]]:pl-(--inset-l)', '[&_[data-slide]]:pr-(--inset-r)']),
      );
      expect(area).not.toContain('md:ml-12');
    });

    it('isolates every Slide wrapper, so a Backdrop stays inside its own Slide', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const wrappers = $('[data-slot="slides"] [data-slide]').toArray();
      const missing = wrappers.filter((wrapper) => !($(wrapper).attr('class') ?? '').split(/\s+/).includes('isolate'));
      // ASSERT
      expect(wrappers.length).toBeGreaterThan(0);
      expect(missing).toEqual([]);
    });

    it('hides every Backdrop from assistive technology inside its own Slide wrapper, and the Title slide has one', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const backdrops = $('[data-slot="slide-backdrop"]').toArray();
      const outside = backdrops.filter((backdrop) => $(backdrop).closest('[data-slide]').length === 0);
      const visible = backdrops.filter((backdrop) => $(backdrop).attr('aria-hidden') !== 'true');
      const inTitle = $('[data-slot="title-slide"] [data-slot="slide-backdrop"]');
      // ASSERT
      expect(outside).toEqual([]);
      expect(visible).toEqual([]);
      expect(inTitle).toHaveLength(1);
      expect((inTitle.attr('class') ?? '').split(/\s+/)).not.toContain('hidden');
    });

    it('holds one talk slot in the Title slide, beside the launcher, when the Episode has a recording, and no iframe', () => {
      // ARRANGE
      const $ = page(url);
      const launchers = $('[data-slot="title-slide"] #talk-launcher').length;
      // ACT
      const slots = $('[data-slot="title-slide"] [data-slot="talk-slot"]');
      const everywhere = $('[data-slot="talk-slot"]').length;
      // ASSERT: a recording shows as the launcher; the slot is hidden until the player opens, and nothing loads with the page
      expect(slots).toHaveLength(launchers);
      expect(everywhere).toBe(launchers);
      expect(slots.attr('hidden')).toBe(launchers ? 'hidden' : undefined);
      expect($('iframe')).toHaveLength(0);
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

    it('gives the section slide its Section as id and each page Slide `<section>--<slide>`, and no wrapper clips', () => {
      // ARRANGE
      const $ = page(url);
      // ACT
      const sections = wrapperIdsBySection($);
      const misplaced = sections.flatMap(({ section, ids }) =>
        ids.filter((id, index) => (index === 0 ? id !== section : !id.startsWith(`${section}--`))),
      );
      const clipping = $('[data-slide]')
        .toArray()
        .filter((wrapper) => /\boverflow-/.test($(wrapper).attr('class') ?? ''));
      // ASSERT
      expect(sections.length).toBeGreaterThan(0);
      expect(misplaced).toEqual([]);
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
      const youtube = /youtube(-nocookie)?\.com|youtu\.be/;
      // ACT: a plain link (the header's channel link) requests nothing; embeds, sources and stylesheets do
      const $page = load(html(url));
      const iframes = $page('iframe').length;
      const requested = $page('[src], link[href]')
        .toArray()
        .map((element) => [$page(element).attr('src'), $page(element).attr('href')].join(' '));
      // ASSERT
      expect(iframes).toBe(0);
      requested.forEach((reference) => expect(reference).not.toMatch(youtube));
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

describe('print stylesheet', () => {
  it('leaves decorative Backdrops off the page', () => {
    // ARRANGE
    const blocks = cssFiles(join(OUT_DIR, '_next', 'static')).flatMap((file) =>
      printBlocks(readFileSync(file, 'utf8')),
    );
    // ACT
    const hidesBackdrop = blocks.some((b) => b.includes('[data-slot=slide-backdrop]') && b.includes('display:none'));
    // ASSERT
    expect(hidesBackdrop).toBe(true);
  });
});

describe('talk player stylesheet', () => {
  it('emits the rule that reserves the table of contents room while the player is docked', () => {
    // ARRANGE
    const css = cssFiles(join(OUT_DIR, '_next', 'static'))
      .map((file) => readFileSync(file, 'utf8'))
      .join('')
      .replace(/\s+/g, '');
    // ACT
    const hasRule = /\[data-talk-docked=(["']?)true\1\][^{}]*\{[^}]*--toc-reserve:12\.5625rem/.test(css);
    // ASSERT: Tailwind only emits a class it can read written out, so interpolating it would silently drop the rule
    expect(hasRule).toBe(true);
  });
});
