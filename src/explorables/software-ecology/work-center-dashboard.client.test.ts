import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { scenarioLastStep } from './scenario-last-step';
import { wordsFor } from './software-ecology-data';
import { WorkCenterDashboard } from './work-center-dashboard.client';

/*
 * Eval hooks of a work center's dashboard (design-ADR 0024 §14, feature guide "Eval hooks"): every control names
 * itself `node.<id>.<field>` in the popover and `compare.<id>.<field>` in a compare column, so each hook is on the page
 * once even when a popover and a compare column show the same center.
 */

const INTERACTIVE =
  'button, input, select, textarea, summary, [role="button"], [role="switch"], [role="menuitemradio"]';
/** The stills' state: In practice, then AI at Engineering writing twice the work, run to week 20. */
const STILL = 'still';
const noop = () => undefined;

const controlsOf = (html: string) =>
  load(`<body>${html}</body>`)(INTERACTIVE)
    .toArray()
    .map((el) => ({ tag: el.tagName, control: el.attribs['data-control'], label: el.attribs['aria-label'] ?? '' }));

const center = (id: string, scope?: 'node' | 'compare') => {
  const { f } = scenarioLastStep('tire', STILL);
  const snap = f.read({ watch: ['pm', 'eng'] });
  return renderToStaticMarkup(
    createElement(WorkCenterDashboard, {
      id,
      scope,
      title: id,
      icon: 'eng',
      role: { job: '', artefacts: [], tasks: [], ai: [] } as never,
      r: snap.dashboards[id]!,
      help: false,
      words: wordsFor('en').dash,
      onDial: noop,
      onAi: noop,
      onOwn: noop,
      onEmit: noop,
      onHelp: noop,
      onClose: noop,
    }),
  );
};

describe('success cases', () => {
  it('gives every control of a work center dashboard a data-control', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const missing = [center('eng'), center('pm')].flatMap((html) =>
      controlsOf(html)
        .filter((c) => !c.control)
        .map((c) => `${c.tag} ${c.label}`),
    );
    // ASSERT
    expect(missing).toEqual(expected);
  });

  it("names a work center dashboard's controls node.<id>.<field>", () => {
    // ARRANGE
    const expected = [
      'node.eng.ai',
      'node.eng.efficiency',
      'node.eng.effectiveness',
      'node.eng.help',
      'node.eng.close',
    ];
    // ACT
    const found = new Set(controlsOf(center('eng')).map((c) => c.control));
    // ASSERT
    expect(expected.filter((c) => !found.has(c))).toEqual([]);
  });
});

describe('failure cases', () => {
  it('has no two controls with the same data-control in a dashboard', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const twice = [center('eng'), center('pm')].flatMap((html) => {
      const names = controlsOf(html).map((c) => c.control);
      return names.filter((n, i) => names.indexOf(n) !== i);
    });
    // ASSERT
    expect(twice).toEqual(expected);
  });

  it('shares no data-control between a popover dashboard and the same center as a compare column', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const popover = new Set(controlsOf(center('eng', 'node')).map((c) => c.control));
    const shared = controlsOf(center('eng', 'compare'))
      .map((c) => c.control)
      .filter((c) => popover.has(c));
    // ASSERT
    expect(shared).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('names the own-work controls of a work center node.<id>.own.<field>', () => {
    // ARRANGE
    const expected = ['node.pm.own.rate', 'node.pm.own.arrivals.steady', 'node.pm.emit'];
    // ACT
    const found = new Set(controlsOf(center('pm')).map((c) => c.control));
    // ASSERT
    expect(expected.filter((c) => !found.has(c))).toEqual([]);
  });

  it('names every control of a compare column compare.<id>.<field>, own work and flows included', () => {
    // ARRANGE
    const expected = ['compare.pm.ai', 'compare.pm.own.rate', 'compare.pm.emit', 'compare.pm.flows'];
    // ACT
    const found = controlsOf(center('pm', 'compare')).map((c) => c.control ?? '');
    // ASSERT
    expect(expected.filter((c) => !found.includes(c))).toEqual([]);
    expect(found.filter((c) => !c.startsWith('compare.pm.'))).toEqual([]);
  });
});
