import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import {
  previewPage,
  previewReport,
  readPresets,
  shotName,
  shotsOf,
  viewportOf,
  type Outcome,
  type Preset,
  type Rendered,
  type Shot,
} from './spec-preview.pure.ts';

/*
 * What `npm run episode:spec-preview` renders and reports for a fragment: the page at each preset, built from the Spec
 * template; then, given what each render came to, the Spec contract violations, an overflow line per Option and
 * preset (a failure at the presets the calibration marks `fails`, a note elsewhere), one screenshot line per rendered
 * Option and preset, and whether it fails. The presets come from the Spec calibration's table.
 * A hand-written renderer stands in for the browser. The checked-in calibration is read in `spec-preview.pure.slow.test.ts`.
 */

const option = (id: string, body = '<p class="text-body">A mock.</p>') => `
<figure data-spec="option" data-option="${id}"${id.endsWith('a') ? ' data-recommended' : ''}>
  <div data-spec="mock" class="bg-card p-4">${body}</div>
  <figcaption><b>${id}</b> A reason. Build cost: Scene.</figcaption>
  <div data-spec="build-notes">Parts, tokens, props, i18n keys.</div>
</figure>`;
const CLEAN = `<!-- slide: spent -->${option('1a')}${option('1b')}`;
const TITLE = `<!-- slide: top -->${option('0a')}${option('0b')}${option('0c')}`;

const DESKTOP: Preset = { name: 'desktop', width: 1920, height: 800, blocking: true };
const MOBILE: Preset = { name: 'mobile', width: 390, height: 800, blocking: false };
const SHORTS: Preset = { name: 'shorts', width: 1080, height: 1920, blocking: false };
const PRESETS = [DESKTOP, MOBILE];

/** A Spec template in the shape the preview reads: a frame with the slots, a toolbar and review form, two templates. */
const TEMPLATE = `<!doctype html>
<html lang="en" data-mode="decide">
  <head>
    <title data-slot="page-title">Spec</title>
    <style>.spec-shell{}</style>
    <script>window.themeFlash = true;</script>
    <script type="application/json" id="spec-meta" data-slot="meta">{}</script>
  </head>
  <body>
    <div class="spec-toolbar" role="toolbar"><button type="button" data-preset="fit">Fit</button></div>
    <div class="spec-shell">
      <nav class="spec-outline" data-slot="outline"></nav>
      <main class="spec-page">
        <header class="spec-masthead"><p data-slot="kicker"></p><h1 data-slot="heading"></h1><p data-slot="lede"></p></header>
        <div class="spec-intro" data-slot="intro"></div>
        <div data-slot="items"></div>
        <form id="spec-review"><button type="submit">Save</button></form>
      </main>
    </div>
    <div class="spec-scroll"><button type="button">Top</button></div>
    <template data-template="item">
      <article class="spec-item" data-spec="slide">
        <h3 data-slot="title"></h3>
        <span data-slot="number"></span>
        <div class="spec-layout">
          <div class="spec-main"><div class="spec-stages"></div></div>
          <aside class="spec-rail"><div class="spec-options" data-slot="options"></div><textarea data-slot="note"></textarea></aside>
        </div>
      </article>
    </template>
    <template data-template="option">
      <figure data-spec="option" data-option data-recommended="false">
        <div class="spec-stage" data-slot="stage"></div>
        <figcaption data-slot="caption"></figcaption>
        <input type="checkbox" data-slot="pick" />
        <span data-slot="id"></span>
        <div data-slot="build-notes"></div>
      </figure>
    </template>
    <script>addEventListener('DOMContentLoaded', () => {});</script>
  </body>
</html>`;

const STAGE = '.spec-stage[data-option]';

/** A renderer that overflows the given `<id>@<preset>` pairs by the given counts and shoots to `/shots/<name>.png`. */
const rendering =
  (overflow: Record<string, number> = {}) =>
  (shot: Shot): Rendered => ({
    path: `/shots/${shotName(shot)}.png`,
    overflow: overflow[`${shot.id}@${shot.preset.name}`] ?? 0,
  });

/** What rendering every Shot of a fragment came to, a renderer that throws giving that Shot's error. */
const outcomesOf = (fragment: string, presets: readonly Preset[], render: (shot: Shot) => Rendered): Outcome[] =>
  shotsOf(fragment, presets).map((shot) => {
    try {
      return { shot, result: render(shot) };
    } catch (error) {
      return { shot, result: error as Error };
    }
  });

const violations = (lines: string[]) => lines.filter((line) => line.startsWith('✖'));
const notes = (lines: string[]) => lines.filter((line) => line.startsWith('⚠'));
const shotLines = (lines: string[]) => lines.filter((line) => line.startsWith('screenshot '));

describe('success cases', () => {
  it('passes a clean fragment with one screenshot line per Option and preset', () => {
    // ARRANGE
    const expectedLines = [
      'screenshot 1a desktop /shots/1a-desktop.png',
      'screenshot 1a mobile /shots/1a-mobile.png',
      'screenshot 1b desktop /shots/1b-desktop.png',
      'screenshot 1b mobile /shots/1b-mobile.png',
    ];
    // ACT
    const report = previewReport(CLEAN, outcomesOf(CLEAN, PRESETS, rendering()));
    // ASSERT
    expect(report.failed).toBe(false);
    expect(report.lines).toEqual(expectedLines);
  });

  it('reads the render presets and what overflow does at each from the Spec calibration table', () => {
    // ARRANGE
    const calibration = `# Spec calibration

## Render presets

| Preset    | Size                   | Overflow  |
| --------- | ---------------------- | --------- |
| \`desktop\` | 1920 px wide           | \`fails\`   |
| \`shorts\`  | 1080 × 1920 (vertical) | \`reports\` |

## Template and slots
`;
    const expected = [DESKTOP, SHORTS];
    // ACT
    const presets = readPresets(calibration);
    // ASSERT
    expect(presets).toEqual(expected);
  });

  it('lists every Option at every preset, Option by Option', () => {
    // ARRANGE
    const expected = ['1a-desktop', '1a-mobile', '1b-desktop', '1b-mobile'];
    // ACT
    const names = shotsOf(CLEAN, PRESETS).map(shotName);
    // ASSERT
    expect(names).toEqual(expected);
  });

  it('renders a preset narrower than a laptop in a laptop-wide window, so the mock takes the preset width', () => {
    // ARRANGE
    const expected = [
      { width: 1920, height: 800 },
      { width: 1440, height: 800 },
      { width: 1440, height: 1920 },
    ];
    // ACT
    const viewports = [DESKTOP, MOBILE, SHORTS].map(viewportOf);
    // ASSERT
    expect(viewports).toEqual(expected);
  });

  describe('the preview page', () => {
    it('sets the preset on the page as the toolbar does: data-preset and --preview-width, nav open from 1800 px', () => {
      // ARRANGE
      const expected = { 'data-preset': 'shorts', style: '--preview-width: 1080px', 'data-nav': 'closed' };
      const wide = { 'data-preset': 'desktop', style: '--preview-width: 1920px', 'data-nav': 'open' };
      // ACT
      const shorts = load(previewPage(TEMPLATE, CLEAN, SHORTS))('html').attr();
      const desktop = load(previewPage(TEMPLATE, CLEAN, DESKTOP))('html').attr();
      // ASSERT
      expect(shorts).toMatchObject(expected);
      expect(desktop).toMatchObject(wide);
    });

    it('clones each Slide from the template item and each Option from the template Option, the assembler way', () => {
      // ARRANGE
      const expectedOptions = [
        ['1a', 'true'],
        ['1b', 'false'],
      ];
      // ACT
      const $ = load(previewPage(TEMPLATE, CLEAN, DESKTOP));
      const options = $('.spec-options > figure[data-spec="option"]');
      // ASSERT
      expect($('article#spent').attr('data-item')).toBe('spent');
      expect(
        options.map((_, figure) => [[$(figure).attr('data-option'), $(figure).attr('data-recommended')]]).get(),
      ).toEqual(expectedOptions);
      expect($('input[name="pick:spent"]').length).toBe(options.length);
    });

    it('moves every Option mock into the visual column, tagged with its Option, and splits the layout', () => {
      // ARRANGE
      const expected = ['1a', '1b'];
      // ACT
      const $ = load(previewPage(TEMPLATE, CLEAN, DESKTOP));
      const staged = $(`.spec-stages > ${STAGE}`).map((_, stage) => $(stage).attr('data-option'));
      // ASSERT
      expect(staged.get()).toEqual(expected);
      expect($('.spec-layout').hasClass('is-split')).toBe(true);
      expect($('.spec-options [data-spec="mock"]')).toHaveLength(0);
    });

    it('leaves out the toolbar, the review form, the scroll buttons, the templates and every bare script of the template', () => {
      // ARRANGE
      const left = ['.spec-toolbar', '.spec-scroll', '#spec-review', 'template', '#spec-meta'];
      // ACT
      const $ = load(previewPage(TEMPLATE, CLEAN, DESKTOP));
      const found = left.filter((selector) => $(selector).length > 0);
      const scripts = $('script')
        .map((_, script) => $(script).html() ?? '')
        .get();
      // ASSERT
      expect(found).toEqual([]);
      expect(scripts).toHaveLength(1);
      expect(scripts[0]).toContain('data-overflow');
    });

    it('gives the Title slide a title-slide item with no number, and keeps the nav column of the shell', () => {
      // ARRANGE
      const role = 'title-slide';
      // ACT
      const $ = load(previewPage(TEMPLATE, TITLE, DESKTOP));
      // ASSERT
      expect($('article#top').attr('data-spec')).toBe(role);
      expect($('article#top').attr('data-number')).toBeUndefined();
      expect($('nav.spec-outline')).toHaveLength(1);
    });
  });
});

describe('failure cases', () => {
  it('fails with one line per contract violation and still renders every Option', () => {
    // ARRANGE
    const html = `<!-- slide: spent -->${option('1a', '<p class="w-[16%]">Narrow.</p>')}${option('1b').replace('<div data-spec="build-notes">Parts, tokens, props, i18n keys.</div>', '')}`;
    const arbitrary = 'arbitrary Tailwind value "w-[16%]"';
    const noNotes = 'Option 1b of {#spent} has no build notes';
    const expectedViolations = 2;
    const expectedShots = 4;
    // ACT
    const report = previewReport(html, outcomesOf(html, PRESETS, rendering()));
    // ASSERT
    expect(report.failed).toBe(true);
    expect(violations(report.lines)).toHaveLength(expectedViolations);
    expect(violations(report.lines)[0]).toContain(arbitrary);
    expect(violations(report.lines)[1]).toContain(noNotes);
    expect(shotLines(report.lines)).toHaveLength(expectedShots);
  });

  it('names the Option, its Slide and the preset whose text runs past its box, and fails at a blocking preset', () => {
    // ARRANGE
    const expected = [
      '✖ Option 1a of {#spent} has text running past its box at desktop 1920px (2 elements): shorten it or let it wrap.',
    ];
    // ACT
    const report = previewReport(CLEAN, outcomesOf(CLEAN, PRESETS, rendering({ '1a@desktop': 2 })));
    // ASSERT
    expect(report.failed).toBe(true);
    expect(violations(report.lines)).toEqual(expected);
  });

  it('reports one line per overflowing blocking preset of the same Option', () => {
    // ARRANGE
    const laptop: Preset = { name: 'laptop', width: 1440, height: 800, blocking: true };
    const overflow = { '1b@desktop': 1, '1b@laptop': 3 };
    const expected = [
      '✖ Option 1b of {#spent} has text running past its box at desktop 1920px (1 element): shorten it or let it wrap.',
      '✖ Option 1b of {#spent} has text running past its box at laptop 1440px (3 elements): shorten it or let it wrap.',
    ];
    // ACT
    const report = previewReport(CLEAN, outcomesOf(CLEAN, [DESKTOP, laptop], rendering(overflow)));
    // ASSERT
    expect(violations(report.lines)).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('only reports, and does not fail, text running past its box at a preset the calibration marks reports', () => {
    // ARRANGE
    const expected = [
      '⚠ Option 1a of {#spent} has text running past its box at mobile 390px (2 elements): shorten it or let it wrap.',
    ];
    // ACT
    const report = previewReport(CLEAN, outcomesOf(CLEAN, PRESETS, rendering({ '1a@mobile': 2 })));
    // ASSERT
    expect(report.failed).toBe(false);
    expect(notes(report.lines)).toEqual(expected);
    expect(violations(report.lines)).toEqual([]);
  });

  it('names a vertical preset by its width and height', () => {
    // ARRANGE
    const expected = [
      '⚠ Option 1a of {#spent} has text running past its box at shorts 1080×1920 (1 element): shorten it or let it wrap.',
    ];
    // ACT
    const report = previewReport(CLEAN, outcomesOf(CLEAN, [SHORTS], rendering({ '1a@shorts': 1 })));
    // ASSERT
    expect(notes(report.lines)).toEqual(expected);
  });

  it('fails naming an Option and preset the renderer could not render, and keeps the others', () => {
    // ARRANGE
    const render = (shot: Shot): Rendered => {
      if (shot.id === '1b' && shot.preset.name === 'mobile') throw new Error('Browser did not start');
      return { path: `/shots/${shotName(shot)}.png`, overflow: 0 };
    };
    const expectedShots = 3;
    const expected = ['✖ Option 1b could not be rendered at mobile: Browser did not start'];
    // ACT
    const report = previewReport(CLEAN, outcomesOf(CLEAN, PRESETS, render));
    // ASSERT
    expect(report.failed).toBe(true);
    expect(violations(report.lines)).toEqual(expected);
    expect(shotLines(report.lines)).toHaveLength(expectedShots);
  });

  it('refuses a calibration with no presets table instead of rendering nothing', () => {
    // ARRANGE
    const calibration = '# Spec calibration\n\n## Page\n';
    // ACT
    const read = () => readPresets(calibration);
    // ASSERT
    expect(read).toThrow(/Render presets/);
  });

  it('throws on a template slot the preview does not fill', () => {
    // ARRANGE
    const template = TEMPLATE.replace('data-slot="lede"', 'data-slot="sidebar"');
    // ACT
    const render = () => previewPage(template, CLEAN, DESKTOP);
    // ASSERT
    expect(render).toThrow(/"sidebar"/);
  });
});
