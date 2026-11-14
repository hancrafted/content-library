import { load } from 'cheerio';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { previewPage, readPresets, toolbarConfigOf } from './spec-preview.pure.ts';

/*
 * The slow half of spec-preview.pure.test.ts: the checked-in Spec calibration and Spec template, read from disk,
 * still give the presets the device toolbar offers and a preview page the toolbar's own presets apply to.
 * `skills/**` is a rerun trigger of the slow lane (ARCH-003-testing §4.4).
 */
const SKILL = path.join(import.meta.dirname, '../../../skills/new-episode');
const CALIBRATION = path.join(SKILL, 'references/spec-calibration.md');
const TEMPLATE = path.join(SKILL, 'assets/spec-template.html');
const TOOLBAR = path.join(SKILL, '../to-decision-html/assets/toolbar.html');
/** The one preset offered with no width: the full column. */
const FULL_COLUMN = ['fit'];
/** The pixel the dropdown rule's breakpoint sits under the width the navigation opens at. */
const BREAKPOINT_GAP = 1;
const REM = 16;
const FRAGMENT = `<!-- slide: spent -->
<figure data-spec="option" data-option="1a" data-recommended>
  <div data-spec="mock" class="bg-card p-4"><p class="text-body">A mock.</p></div>
  <figcaption><b>1a</b> A reason. Build cost: Scene.</figcaption>
  <div data-spec="build-notes">Parts, tokens, props, i18n keys.</div>
</figure>`;

describe('success cases', () => {
  it('reads the checked-in calibration as the five presets the toolbar offers, overflow failing at desktop and laptop', () => {
    // ARRANGE
    const expected = [
      'desktop 1920x800 fails',
      'laptop 1440x800 fails',
      'tablet 1024x800 reports',
      'mobile 390x800 reports',
      'shorts 1080x1920 reports',
    ];
    // ACT
    const presets = readPresets(readFileSync(CALIBRATION, 'utf8'));
    // ASSERT
    expect(
      presets.map(
        ({ name, width, height, blocking }) => `${name} ${width}x${height} ${blocking ? 'fails' : 'reports'}`,
      ),
    ).toEqual(expected);
  });

  it('offers in the template toolbar every preset of the calibration, and the full column besides, by name and width', () => {
    // ARRANGE
    const calibrated = readPresets(readFileSync(CALIBRATION, 'utf8')).map(({ name, width }) => ({ id: name, width }));
    const $ = load(readFileSync(TEMPLATE, 'utf8'));
    // ACT
    const offered = JSON.parse($('script[data-toolbar-presets]').text()) as { id: string; width?: number }[];
    // ASSERT
    expect(offered.map(({ id, width }) => ({ id, width })).filter(({ width }) => width !== undefined)).toEqual(
      calibrated,
    );
    expect(offered.filter(({ width }) => width === undefined).map(({ id }) => id)).toEqual(FULL_COLUMN);
  });

  it('builds the preview page of the checked-in template at each preset with that preset on the page', () => {
    // ARRANGE
    const presets = readPresets(readFileSync(CALIBRATION, 'utf8'));
    const template = readFileSync(TEMPLATE, 'utf8');
    const expected = presets.map(({ name, width }) => ({ preset: name, width: `${width}px` }));
    // ACT
    const pages = presets.map((preset) => load(previewPage(template, FRAGMENT, preset))('html'));
    const seen = pages.map((html) => ({ preset: html.attr('data-preset'), style: html.attr('style') ?? '' }));
    // ASSERT
    expect(seen.map(({ preset }) => preset)).toEqual(expected.map(({ preset }) => preset));
    seen.forEach(({ style }, at) => expect(style).toContain(expected[at]?.width));
  });

  it('carries in the template toolbar the same numbers as the toolbar asset, which the preview reads', () => {
    // ARRANGE
    const asset = toolbarConfigOf(readFileSync(TOOLBAR, 'utf8'));
    // ACT
    const config = toolbarConfigOf(readFileSync(TEMPLATE, 'utf8'));
    // ASSERT
    expect(config).toEqual(asset);
  });

  it('puts the toolbar dropdown breakpoint of the template CSS one pixel under the width the navigation opens at', () => {
    // ARRANGE
    const { navOpenWidth } = toolbarConfigOf(readFileSync(TEMPLATE, 'utf8'));
    const style = load(readFileSync(TEMPLATE, 'utf8'))('style[data-toolbar-style]').text();
    // ACT
    const breakpoint = Number(/@media \(max-width: ([\d.]+)rem\)/.exec(style)?.[1]) * REM;
    // ASSERT
    expect(Math.floor(breakpoint)).toBe(navOpenWidth - BREAKPOINT_GAP);
  });
});
