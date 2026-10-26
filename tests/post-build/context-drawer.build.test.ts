// FE-010 post-build check: every exported Episode carries its Speaker notes and
// Voice script in the static HTML, drawer closed, and the stylesheet prints
// them. Reads the files exactly as a visitor, a crawler or a print job gets them.

import { type CheerioAPI } from 'cheerio';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { episodeRoute } from '../../src/content-store/catalogue/routes';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { EXPORTED_EPISODES_PATH_SLUGS, exportedPage, OUT_DIR } from './exported-pages';
import { cssFiles, printBlocks } from './stylesheets';

const PAGES = EXPORTED_EPISODES_PATH_SLUGS.flatMap((slug) =>
  LOCALES.map((locale) => ({ slug, locale, url: localizePath(episodeRoute(slug), locale) })),
);

/**
 * Whether the page holds a page Slide: one whose anchor is `<section>--<slide>`. A page of the Title slide and
 * section slides alone, as an Episode built Section by Section starts, carries no Speaker note yet.
 */
function holdsPageSlide($: CheerioAPI): boolean {
  return $('[data-slot="slides"] [data-slide*="--"]').length > 0;
}

function entry($: CheerioAPI, panel: 'notes' | 'script', anchor: string) {
  return $(`#context-panel-${panel} [data-context-for="${anchor}"]`);
}

/** The elements a note's short target names inside its own Slide: its scoped `data-target`. */
function targetsOf($: CheerioAPI, owner: string, target: string) {
  return $(`[data-slot="slides"] [data-slide="${owner}"]`).find(`[data-target="${target}"]`);
}

describe.each(PAGES)('$url', ({ slug, url }) => {
  it('holds one context slot, after the slides, with an entry per Slide in page order', () => {
    // ARRANGE
    const $ = exportedPage(url);
    const expected = $('[data-slide]')
      .toArray()
      .map((slide) => $(slide).attr('id'));
    // ACT
    const slot = $('[data-slot="episode-page"] > [data-slot="context"]');
    const anchors = slot
      .find('#context-panel-notes [data-context-for]')
      .toArray()
      .map((e) => $(e).attr('data-context-for'));
    // ASSERT
    expect(slot).toHaveLength(1);
    expect(anchors).toEqual(expected);
  });

  it('keeps the closed drawer in the DOM with no hidden attribute, inline display or inert', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const slot = $('[data-slot="context"]');
    const offenders = slot.find('[hidden], [inert], [style*="display"]').length;
    // ASSERT
    expect(offenders).toBe(0);
    expect(slot.find('#context-panel').attr('class')).toContain('invisible');
  });

  it('resolves every note target to exactly one element inside the note’s own Slide', () => {
    // ARRANGE
    const $ = exportedPage(url);
    const notes = $('#context-panel-notes [data-note-target]').toArray();
    const fewestNotes = holdsPageSlide($) ? 1 : 0;
    // ACT
    const unresolved = notes
      .map((note) => ({
        owner: $(note).closest('[data-context-for]').attr('data-context-for') ?? '',
        target: $(note).attr('data-note-target') ?? '',
      }))
      .filter(({ owner, target }) => targetsOf($, owner, target).length !== 1)
      .map(({ owner, target }) => `${owner} → ${target}`);
    // ASSERT
    expect(notes.length).toBeGreaterThanOrEqual(fewestNotes);
    expect(unresolved).toEqual([]);
  });

  it('gives every note a short target, never a full element id', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const full = $('[data-note-target]')
      .toArray()
      .map((note) => $(note).attr('data-note-target') ?? '')
      .filter((target) => target.includes('--'));
    // ASSERT
    expect(full).toEqual([]);
  });

  it('resolves every context reference to exactly one note of its own Slide, by slug', () => {
    // ARRANGE
    const $ = exportedPage(url);
    const refs = $('[data-slot="slides"] button[data-context-ref]').toArray();
    // ACT
    const unresolved = refs
      .map((ref) => ({
        owner: $(ref).closest('[data-slide]').attr('data-slide') ?? '',
        note: $(ref).attr('data-context-ref') ?? '',
      }))
      .filter(({ owner, note }) => entry($, 'notes', owner).find(`[data-note="${note}"]`).length !== 1)
      .map(({ owner, note }) => `${owner} → ${note}`);
    // ASSERT
    expect(unresolved).toEqual([]);
  });

  it('shows no raw Translation key as text', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const text = $('[data-slot="context"]').text();
    // ASSERT
    expect(text).not.toMatch(/\bepisodes\.[a-z-]+\.|\bcontextDrawer\./);
  });

  it('renders sources as https links that open a new tab safely, with that said in their name', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const links = $('[data-slot="context"] a[href]').toArray();
    // ASSERT
    if (slug === 'never-too-early-sales') expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect($(link).attr('href')).toMatch(/^https:\/\//);
      expect($(link).attr('target')).toBe('_blank');
      expect($(link).attr('rel')).toBe('noopener noreferrer');
      expect($(link).text()).toMatch(/new tab|neuem Tab/);
    }
  });
});

describe.each(PAGES)('$url card', ({ url }) => {
  it('keeps one trigger pill with the shortcut announced and a scrim, and no layout spacer', () => {
    // ARRANGE
    const $ = exportedPage(url);
    const shortcut = 'Alt+N';
    // ACT
    const slot = $('[data-slot="context"]');
    // ASSERT
    expect(slot.find('button[data-slot="context-trigger"]').attr('aria-keyshortcuts')).toBe(shortcut);
    expect($('[data-slot="context-spacer"]')).toHaveLength(0);
    expect(slot.find('[data-slot="context-scrim"]')).toHaveLength(1);
  });

  it('closes the card with a transform and never lets the Slides animate their insets', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const card = $('#context-panel').attr('class') ?? '';
    const grid = $('[data-slot="episode-page"]').attr('class') ?? '';
    // ASSERT
    expect(card).toContain('translateX');
    expect(grid).not.toMatch(/transition/);
  });

  it('keeps the tabs off transition-all, which would hold them hidden when focus enters on open', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const classes = $('[data-slot="context"] [role="tab"]')
      .toArray()
      .map((tab) => $(tab).attr('class') ?? '');
    // ASSERT
    expect(classes.length).toBeGreaterThan(0);
    classes.forEach((value) => expect(value).not.toContain('transition-all'));
  });

  it('holds the layout menu only on a client render, never as static HTML', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const popups = $('[data-slot="context"] [role="menu"], [data-slot="context"] [role="menuitemradio"]').length;
    // ASSERT
    expect(popups).toBe(0);
  });
});

describe('never-too-early-sales', () => {
  it.each(LOCALES)('keeps sources closed behind a counted toggle, with their text in the HTML, in %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(episodeRoute('never-too-early-sales'), locale));
    const counted = /\(\d+\)/;
    // ACT
    const disclosures = $('[data-slot="context"] [data-note-target] details').toArray();
    const open = disclosures.filter((details) => $(details).attr('open') !== undefined);
    const labels = disclosures.map((details) => $(details).children('summary').text());
    // ASSERT
    expect(disclosures.length).toBeGreaterThan(0);
    expect(open).toHaveLength(0);
    labels.forEach((label) => expect(label).toMatch(counted));
  });

  it.each(LOCALES)('numbers sources in a list and points every citation marker into it, in %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(episodeRoute('never-too-early-sales'), locale));
    const notes = $('[data-slot="context"] [data-note-target]').toArray();
    // ACT
    const broken = notes.flatMap((note) => {
      const sources = $(note).find('details ol > li[data-source]').length;
      const cited = $(note)
        .find('button[data-citation]')
        .toArray()
        .map((marker) => Number($(marker).attr('data-citation')));
      return cited.filter((n) => n < 1 || n > sources).length + (sources > 0 && cited.length === 0 ? 1 : 0);
    });
    const raw = $('[data-slot="context"] details a')
      .toArray()
      .filter((a) => /^https?:/.test($(a).children('span').first().text()));
    // ASSERT
    expect(notes.length).toBeGreaterThan(0);
    expect(broken.filter(Boolean)).toHaveLength(0);
    expect(raw).toHaveLength(0);
  });

  it('gives each note the same slug and ids in both locales, with German words differing from English', () => {
    // ARRANGE
    const [en, de] = LOCALES.map((locale) => exportedPage(localizePath(episodeRoute('never-too-early-sales'), locale)));
    const targetsOf = ($: CheerioAPI) =>
      $('[data-note-target]')
        .toArray()
        .map((n) => $(n).attr('data-note-target'));
    const firstHeader = ($: CheerioAPI) => $('[data-note-target] h6').first().text();
    // ACT
    const same = targetsOf(en);
    // ASSERT
    expect(targetsOf(de)).toEqual(same);
    expect(firstHeader(de)).not.toBe(firstHeader(en));
  });
});

describe('episode-template', () => {
  it.each(LOCALES)('has notes on why-a-template alone and the empty state elsewhere in %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(episodeRoute('episode-template'), locale));
    // ACT
    const withNotes = $('#context-panel-notes [data-context-for]')
      .toArray()
      .filter((e) => $(e).find('[data-note-target]').length > 0)
      .map((e) => $(e).attr('data-context-for'));
    // ASSERT
    expect(withNotes).toEqual(['foundations--why-a-template']);
  });

  it.each(LOCALES)('wraps phrases in context references that resolve to their own note, in %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(episodeRoute('episode-template'), locale));
    const refs = $('[data-slot="slides"] button[data-context-ref]').toArray();
    // ACT
    const resolved = refs.map((ref) => {
      const slug = $(ref).attr('data-context-ref') ?? '';
      const owner = $(ref).closest('[data-slide]').attr('data-slide') ?? '';
      const notes = entry($, 'notes', owner).find(`[data-note="${slug}"]`);
      return {
        native: ref.tagName === 'button' && $(ref).attr('type') === 'button' && $(ref).attr('href') === undefined,
        marksTarget: $(ref).attr('data-target') !== undefined || $(ref).find('[data-target]').length > 0,
        notes: notes.length,
        numbered: $(ref).find('sup').length > 0 || /\d/.test($(ref).text()),
      };
    });
    // ASSERT
    expect(refs.length).toBeGreaterThan(0);
    resolved.forEach((r) => expect(r).toEqual({ native: true, marksTarget: false, notes: 1, numbered: false }));
  });
});

describe('print stylesheet', () => {
  it('reveals the context slot and hides the trigger and scrim inside @media print', () => {
    // ARRANGE
    const blocks = cssFiles(join(OUT_DIR, '_next', 'static')).flatMap((file) =>
      printBlocks(readFileSync(file, 'utf8')),
    );
    // ACT
    const reveals = blocks.some((b) => b.includes('[data-slot=context]') && b.includes('display:block'));
    const hides = blocks.some((b) => b.includes('[data-slot=context-trigger]') && b.includes('display:none'));
    const hidesAll = blocks.some(
      (b) => b.includes('[data-slot=context-scrim]') && b.includes('[data-slot=context-trigger]'),
    );
    const opensSources = blocks.some(
      (b) => b.includes('details::details-content') && b.includes('content-visibility:visible'),
    );
    // ASSERT
    expect(opensSources).toBe(true);
    expect(reveals).toBe(true);
    expect(hides).toBe(true);
    expect(hidesAll).toBe(true);
  });
});
