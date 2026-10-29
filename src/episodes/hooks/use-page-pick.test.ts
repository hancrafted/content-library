import { createPagePicks } from '@/episodes/lib/page-picks.pure';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PagePicksContext, usePagePick } from './use-page-pick';

/** A Slide part that prints the operating system it reads. */
function OsProbe({ fallback }: { fallback: string }) {
  const [os] = usePagePick('os', fallback);
  return createElement('output', null, os);
}

describe('success cases', () => {
  it("shows two Slides of one page the viewer's one pick", () => {
    // ARRANGE
    const picks = createPagePicks();
    picks.set('os', 'windows');
    const expected = '<output>windows</output><output>windows</output>';
    // ACT
    const html = renderToStaticMarkup(
      createElement(PagePicksContext, { value: picks }, [
        createElement(OsProbe, { key: 'a', fallback: 'mac' }),
        createElement(OsProbe, { key: 'b', fallback: 'linux' }),
      ]),
    );
    // ASSERT
    expect(html).toBe(expected);
  });
});

describe('failure cases', () => {
  it('changes nothing when a Slide sets a pick outside an Episode page', () => {
    // ARRANGE
    let setOs: (value: string) => void = () => undefined;
    function Picker() {
      const [os, set] = usePagePick('os', 'mac');
      setOs = set;
      return createElement('output', null, os);
    }
    renderToStaticMarkup(createElement(Picker));
    // ACT
    setOs('windows');
    const html = renderToStaticMarkup(createElement(Picker));
    // ASSERT
    expect(html).toBe('<output>mac</output>');
  });
});

describe('edge cases', () => {
  it("reads the Slide's default outside an Episode page", () => {
    // ARRANGE
    const expected = '<output>mac</output>';
    // ACT
    const html = renderToStaticMarkup(createElement(OsProbe, { fallback: 'mac' }));
    // ASSERT
    expect(html).toBe(expected);
  });
});
