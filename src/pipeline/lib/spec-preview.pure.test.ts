import { describe, expect, it } from 'vitest';
import { previewReport, type Render } from './spec-preview.pure.ts';

/*
 * What `npm run episode:spec-preview` reports for a fragment, given a renderer: the Spec contract violations, an
 * overflow line per Option that runs past its box, one screenshot line per rendered Option, and whether it fails.
 * A hand-written renderer stands in for the browser; `skills/new-episode/scripts/spec-preview.browser.test.ts` drives the real one.
 */

const option = (id: string, body = '<p class="text-body">A mock.</p>') => `
<figure data-spec="option" data-option="${id}"${id.endsWith('a') ? ' data-recommended' : ''}>
  <div data-spec="mock" class="bg-card p-4">${body}</div>
  <figcaption><b>${id}</b> A reason. Build cost: Scene.</figcaption>
  <div data-spec="build-notes">Parts, tokens, props, i18n keys.</div>
</figure>`;
const CLEAN = `<!-- slide: spent -->${option('1a')}${option('1b')}`;

/** A renderer that overflows the given Options by the given counts and shoots to `/shots/<id>.png`. */
const rendering =
  (overflow: Record<string, number> = {}): Render =>
  (id) => ({ path: `/shots/${id}.png`, overflow: overflow[id] ?? 0 });

const violations = (lines: string[]) => lines.filter((line) => line.startsWith('✖'));
describe('success cases', () => {
  it('passes a clean fragment with one screenshot line per Option', () => {
    // ARRANGE
    const expectedLines = ['screenshot 1a /shots/1a.png', 'screenshot 1b /shots/1b.png'];
    // ACT
    const report = previewReport(CLEAN, rendering());
    // ASSERT
    expect(report.failed).toBe(false);
    expect(report.lines).toEqual(expectedLines);
  });
});

describe('failure cases', () => {
  it('fails with one line per contract violation and still renders every Option', () => {
    // ARRANGE
    const html = `<!-- slide: spent -->${option('1a', '<p class="w-[16%]">Narrow.</p>')}${option('1b').replace('<div data-spec="build-notes">Parts, tokens, props, i18n keys.</div>', '')}`;
    const arbitrary = 'arbitrary Tailwind value "w-[16%]"';
    const noNotes = 'Option 1b of {#spent} has no build notes';
    const expectedViolations = 2;
    const expectedShots = 2;
    // ACT
    const report = previewReport(html, rendering());
    const shots = report.lines.filter((line) => line.startsWith('screenshot '));
    // ASSERT
    expect(report.failed).toBe(true);
    expect(violations(report.lines)).toHaveLength(expectedViolations);
    expect(violations(report.lines)[0]).toContain(arbitrary);
    expect(violations(report.lines)[1]).toContain(noNotes);
    expect(shots).toHaveLength(expectedShots);
  });

  it('names the Option and its Slide whose text runs past its box at 1440px', () => {
    // ARRANGE
    const expected = [
      '✖ Option 1a of {#spent} has text running past its box at 1440px (2 elements): shorten it or let it wrap.',
    ];
    // ACT
    const report = previewReport(CLEAN, rendering({ '1a': 2 }));
    // ASSERT
    expect(report.failed).toBe(true);
    expect(violations(report.lines)).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('fails naming an Option the renderer could not render, and keeps the others', () => {
    // ARRANGE
    const render: Render = (id) => {
      if (id === '1b') throw new Error('Browser did not start');
      return { path: `/shots/${id}.png`, overflow: 0 };
    };
    const expected = ['✖ Option 1b could not be rendered: Browser did not start', 'screenshot 1a /shots/1a.png'];
    // ACT
    const report = previewReport(CLEAN, render);
    // ASSERT
    expect(report.failed).toBe(true);
    expect(report.lines).toEqual(expected);
  });
});
