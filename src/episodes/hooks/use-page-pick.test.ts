import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PagePicksContext, usePagePick, type PagePicks, type PickName } from './use-page-pick';

/*
 * The page picks (FE-001 §1, transient): what the viewer picked in a page-wide toolbar, a Guide's operating system
 * and AI agent, read by every Slide of the page through `usePagePick`. The Episode container's provider holds them in
 * React state; these tests hand the context a value directly, since the suite renders without a DOM.
 */

/** A Slide part that prints the pick it reads. */
function Probe({ name, fallback }: { name: PickName; fallback: string }) {
  const [value] = usePagePick(name, fallback);
  return createElement('output', null, value);
}

function onPage(picks: PagePicks['picks'], children: ReactNode, setPick: PagePicks['setPick'] = () => undefined) {
  return renderToStaticMarkup(createElement(PagePicksContext, { value: { picks, setPick } }, children));
}

describe('success cases', () => {
  it("shows two Slides of one page the viewer's one pick", () => {
    // ARRANGE
    const expected = '<output>windows</output><output>windows</output>';
    // ACT
    const html = onPage({ os: 'windows' }, [
      createElement(Probe, { key: 'a', name: 'os', fallback: 'mac' }),
      createElement(Probe, { key: 'b', name: 'os', fallback: 'linux' }),
    ]);
    // ASSERT
    expect(html).toBe(expected);
  });

  it('hands the page the pick a Slide sets, by its name', () => {
    // ARRANGE
    const set: [PickName, string][] = [];
    function Picker() {
      const [, setAgent] = usePagePick('agent', 'claude-code');
      setAgent('codex');
      return null;
    }
    // ACT
    onPage({}, createElement(Picker), (name, value) => set.push([name, value]));
    // ASSERT
    expect(set).toEqual([['agent', 'codex']]);
  });
});

describe('failure cases', () => {
  it('changes nothing when a Slide sets a pick outside an Episode page', () => {
    // ARRANGE
    function Picker() {
      const [os, setOs] = usePagePick('os', 'mac');
      setOs('windows');
      return createElement('output', null, os);
    }
    // ACT
    renderToStaticMarkup(createElement(Picker));
    const html = renderToStaticMarkup(createElement(Picker));
    // ASSERT
    expect(html).toBe('<output>mac</output>');
  });
});

describe('edge cases', () => {
  it("reads the Slide's default until the viewer picks, and keeps two picks apart", () => {
    // ARRANGE
    const expected = '<output>claude-code</output><output>linux</output>';
    // ACT
    const html = onPage({ os: 'linux' }, [
      createElement(Probe, { key: 'a', name: 'agent', fallback: 'claude-code' }),
      createElement(Probe, { key: 'b', name: 'os', fallback: 'mac' }),
    ]);
    // ASSERT
    expect(html).toBe(expected);
  });

  it("reads the Slide's default outside an Episode page", () => {
    // ARRANGE
    const expected = '<output>mac</output>';
    // ACT
    const html = renderToStaticMarkup(createElement(Probe, { name: 'os', fallback: 'mac' }));
    // ASSERT
    expect(html).toBe(expected);
  });
});
