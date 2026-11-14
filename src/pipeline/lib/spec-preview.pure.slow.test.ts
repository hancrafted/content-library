import { load } from 'cheerio';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { previewPage, readPresets } from './spec-preview.pure.ts';

/*
 * The slow half of spec-preview.pure.test.ts: the checked-in Spec calibration and Spec template, read from disk,
 * still give the presets the device toolbar offers and a preview page the toolbar's own presets apply to.
 * `skills/**` is a rerun trigger of the slow lane (ARCH-003-testing §4.4).
 */
const SKILL = path.join(import.meta.dirname, '../../../skills/new-episode');
const CALIBRATION = path.join(SKILL, 'references/spec-calibration.md');
const TEMPLATE = path.join(SKILL, 'assets/spec-template.html');
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
    expect(offered.filter(({ width }) => width === undefined).map(({ id }) => id)).toEqual(['fit']);
  });

  it('builds the preview page of the checked-in template at each preset with that preset on the page', () => {
    // ARRANGE
    const presets = readPresets(readFileSync(CALIBRATION, 'utf8'));
    const template = readFileSync(TEMPLATE, 'utf8');
    // ACT
    const pages = presets.map((preset) => ({ preset, html: load(previewPage(template, FRAGMENT, preset))('html') }));
    // ASSERT
    for (const { preset, html } of pages) {
      expect(html.attr('data-preset')).toBe(preset.name);
      expect(html.attr('style')).toContain(`${preset.width}px`);
    }
  });
});
