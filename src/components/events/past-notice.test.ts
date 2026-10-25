import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PastNotice } from './past-notice';

/*
 * The past notice (design-ADR 0016, Past Event): one fixed line, drawn only when the Event's date lies before the
 * build day. The fast half of the test in Han's words; its past half also runs post-build on the exported AXEL page,
 * but no upcoming Event is guaranteed at build time, so the upcoming half lives here.
 */

const TEXT =
  'This Event has already taken place. The content below is kept up to date and may differ from the recording.';
const BUILD_DAY = '2026-10-25';

/** The notice's static HTML for an Event on `date`, built on `BUILD_DAY`. */
function render(date: `${number}-${number}-${number}`) {
  return renderToStaticMarkup(createElement(PastNotice, { date, buildDay: BUILD_DAY, text: TEXT }));
}

describe('success cases', () => {
  it('A past Event says its content may differ from the recording; an upcoming Event does not', () => {
    // ARRANGE
    const past = '2026-10-23';
    const upcoming = '2026-11-06';
    // ACT
    const seen = { past: render(past), upcoming: render(upcoming) };
    // ASSERT
    expect(seen.past).toContain(TEXT);
    expect(seen.upcoming).toBe('');
  });
});

describe('failure cases', () => {
  it('is a note a screen reader announces as one, never a dismissible alert', () => {
    // ARRANGE
    const note = 'role="note"';
    const button = '<button';
    // ACT
    const html = render('2026-10-23');
    // ASSERT
    expect(html).toContain(note);
    expect(html).not.toContain(button);
  });
});

describe('edge cases', () => {
  it('stays silent for an Event built on its own day', () => {
    // ARRANGE
    const today = BUILD_DAY;
    // ACT
    const html = render(today);
    // ASSERT
    expect(html).toBe('');
  });
});
