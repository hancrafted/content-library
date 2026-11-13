import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { previewReport, readPresets, type Preset, type Render } from './spec-preview.pure.ts';

/*
 * What `npm run episode:spec-preview` reports for a fragment, given the render presets and a renderer: the Spec contract
 * violations, an overflow line per Option and preset that runs past its box, one screenshot line per rendered Option and
 * preset, and whether it fails. The presets come from the Spec calibration's table.
 * A hand-written renderer stands in for the browser; `skills/new-episode/scripts/spec-preview.browser.test.ts` drives the real one.
 */

const option = (id: string, body = '<p class="text-body">A mock.</p>') => `
<figure data-spec="option" data-option="${id}"${id.endsWith('a') ? ' data-recommended' : ''}>
  <div data-spec="mock" class="bg-card p-4">${body}</div>
  <figcaption><b>${id}</b> A reason. Build cost: Scene.</figcaption>
  <div data-spec="build-notes">Parts, tokens, props, i18n keys.</div>
</figure>`;
const CLEAN = `<!-- slide: spent -->${option('1a')}${option('1b')}`;

const DESKTOP: Preset = { name: 'desktop', width: 1920, height: 800 };
const MOBILE: Preset = { name: 'mobile', width: 390, height: 800 };
const SHORTS: Preset = { name: 'shorts', width: 1080, height: 1920 };

/** A renderer that overflows the given `<id>@<preset>` pairs by the given counts and shoots to `/shots/<id>-<preset>.png`. */
const rendering =
  (overflow: Record<string, number> = {}): Render =>
  (id, preset) => ({ path: `/shots/${id}-${preset.name}.png`, overflow: overflow[`${id}@${preset.name}`] ?? 0 });

const violations = (lines: string[]) => lines.filter((line) => line.startsWith('✖'));
const PRESETS = [DESKTOP, MOBILE];

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
    const report = previewReport(CLEAN, PRESETS, rendering());
    // ASSERT
    expect(report.failed).toBe(false);
    expect(report.lines).toEqual(expectedLines);
  });

  it('reads the render presets from the Spec calibration table', () => {
    // ARRANGE
    const calibration = `# Spec calibration

## Render presets

| Preset    | Size                   |
| --------- | ---------------------- |
| \`desktop\` | 1920 px wide           |
| \`shorts\`  | 1080 × 1920 (vertical) |

## Template and slots
`;
    const expected = [DESKTOP, SHORTS];
    // ACT
    const presets = readPresets(calibration);
    // ASSERT
    expect(presets).toEqual(expected);
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
    const report = previewReport(html, PRESETS, rendering());
    const shots = report.lines.filter((line) => line.startsWith('screenshot '));
    // ASSERT
    expect(report.failed).toBe(true);
    expect(violations(report.lines)).toHaveLength(expectedViolations);
    expect(violations(report.lines)[0]).toContain(arbitrary);
    expect(violations(report.lines)[1]).toContain(noNotes);
    expect(shots).toHaveLength(expectedShots);
  });

  it('names the Option, its Slide and the preset whose text runs past its box, and only that preset', () => {
    // ARRANGE
    const expected = [
      '✖ Option 1a of {#spent} has text running past its box at mobile 390px (2 elements): shorten it or let it wrap.',
    ];
    // ACT
    const report = previewReport(CLEAN, PRESETS, rendering({ '1a@mobile': 2 }));
    // ASSERT
    expect(report.failed).toBe(true);
    expect(violations(report.lines)).toEqual(expected);
  });

  it('reports one line per overflowing preset of the same Option', () => {
    // ARRANGE
    const overflow = { '1b@desktop': 1, '1b@mobile': 3 };
    const expected = [
      '✖ Option 1b of {#spent} has text running past its box at desktop 1920px (1 element): shorten it or let it wrap.',
      '✖ Option 1b of {#spent} has text running past its box at mobile 390px (3 elements): shorten it or let it wrap.',
    ];
    // ACT
    const report = previewReport(CLEAN, PRESETS, rendering(overflow));
    // ASSERT
    expect(violations(report.lines)).toEqual(expected);
  });

  it('names a vertical preset by its width and height', () => {
    // ARRANGE
    const expected = [
      '✖ Option 1a of {#spent} has text running past its box at shorts 1080×1920 (1 element): shorten it or let it wrap.',
    ];
    // ACT
    const report = previewReport(CLEAN, [SHORTS], rendering({ '1a@shorts': 1 }));
    // ASSERT
    expect(violations(report.lines)).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('fails naming an Option and preset the renderer could not render, and keeps the others', () => {
    // ARRANGE
    const render: Render = (id, preset) => {
      if (id === '1b' && preset.name === 'mobile') throw new Error('Browser did not start');
      return { path: `/shots/${id}-${preset.name}.png`, overflow: 0 };
    };
    const expectedShots = 3;
    // ACT
    const report = previewReport(CLEAN, PRESETS, render);
    // ASSERT
    expect(report.failed).toBe(true);
    expect(violations(report.lines)).toEqual(['✖ Option 1b could not be rendered at mobile: Browser did not start']);
    expect(report.lines.filter((line) => line.startsWith('screenshot '))).toHaveLength(expectedShots);
  });

  it('refuses a calibration with no presets table instead of rendering nothing', () => {
    // ARRANGE
    const calibration = '# Spec calibration\n\n## Page\n';
    // ACT
    const read = () => readPresets(calibration);
    // ASSERT
    expect(read).toThrow(/Render presets/);
  });

  it('reads the checked-in calibration as the five presets the toolbar offers', () => {
    // ARRANGE
    const file = path.join(import.meta.dirname, '../../../skills/new-episode/references/spec-calibration.md');
    const expected = ['desktop 1920x800', 'laptop 1440x800', 'tablet 1024x800', 'mobile 390x800', 'shorts 1080x1920'];
    // ACT
    const presets = readPresets(readFileSync(file, 'utf8'));
    // ASSERT
    expect(presets.map(({ name, width, height }) => `${name} ${width}x${height}`)).toEqual(expected);
  });
});
