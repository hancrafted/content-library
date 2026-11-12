import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CustomerDashboard } from './customer-dashboard.client';
import { scenarioLastStep } from './scenario-last-step';
import { SoftwareEcology } from './software-ecology';
import { catalogWordsFor, wordsFor } from './software-ecology-data';
import { TourBox } from './tour-box.client';
import { titlesOf } from './use-case-words.pure';
import { WorkCenterDashboard } from './work-center-dashboard.client';

/*
 * Eval hooks (design-ADR 0024 §14, feature guide "Eval hooks"): every interactive control of the Explorable carries a
 * unique, stable `data-control`, so an eval agent can drive a teaching use case and read back the result. The markup of
 * the whole Explorable (its toolbar and the closed menus, the Settings popover and the cards), a work center's
 * dashboard, the Customer's dashboard and the tour box is walked, and every button, input, select, switch and summary
 * must name itself.
 */

const INTERACTIVE =
  'button, input, select, textarea, summary, [role="button"], [role="switch"], [role="menuitemradio"]';
const noop = () => undefined;
const ref = { current: null };

const controlsOf = (html: string) =>
  load(`<body>${html}</body>`)(INTERACTIVE)
    .toArray()
    .map((el) => ({ tag: el.tagName, control: el.attribs['data-control'], label: el.attribs['aria-label'] ?? '' }));

const page = (preset: string) => renderToStaticMarkup(createElement(SoftwareEcology, { locale: 'en', preset }));

const dashboards = () => {
  const { f, B } = scenarioLastStep('tire', 'ai-unbalanced');
  const snap = f.read({ watch: ['pm', 'eng', 'customer'] });
  const words = wordsFor('en');
  const w = { B, locale: 'en' as const, catalog: catalogWordsFor('en') };
  const center = (id: string) =>
    renderToStaticMarkup(
      createElement(WorkCenterDashboard, {
        id,
        title: id,
        icon: 'eng',
        role: { job: '', artefacts: [], tasks: [], ai: [] } as never,
        r: snap.dashboards[id]!,
        help: false,
        words: words.dash,
        onDial: noop,
        onAi: noop,
        onOwn: noop,
        onEmit: noop,
        onHelp: noop,
        onClose: noop,
      }),
    );
  const customer = renderToStaticMarkup(
    createElement(CustomerDashboard, {
      title: 'Customer',
      job: '',
      r: snap.customerDash!,
      titles: titlesOf(w),
      words: words.custDash,
      rateTip: '',
      close: words.dash,
      onChange: noop,
      onClose: noop,
    }),
  );
  return { eng: center('eng'), pm: center('pm'), customer };
};

const tourBox = () =>
  renderToStaticMarkup(
    createElement(TourBox, {
      words: wordsFor('en').tour,
      name: 'Tour',
      head: '',
      running: null,
      caption: '',
      checks: [],
      floor: ref,
      wrap: ref,
      canBack: true,
      last: false,
      onClose: noop,
      onBack: noop,
      onNext: noop,
    }),
  );

describe('success cases', () => {
  it('gives every control of the toolbar, its menus, the Settings popover and the cards a data-control', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const missing = controlsOf(page('realistic'))
      .filter((c) => !c.control)
      .map((c) => `${c.tag} ${c.label}`);
    // ASSERT
    expect(missing).toEqual(expected);
  });

  it('gives every control of a work center dashboard, the Customer dashboard and the tour box a data-control', () => {
    // ARRANGE
    const expected: string[] = [];
    const { eng, pm, customer } = dashboards();
    // ACT
    const missing = [eng, pm, customer, tourBox()].flatMap((html) =>
      controlsOf(html)
        .filter((c) => !c.control)
        .map((c) => `${c.tag} ${c.label}`),
    );
    // ASSERT
    expect(missing).toEqual(expected);
  });

  it('names the toolbar, Settings and node controls by the documented scheme', () => {
    // ARRANGE
    const expected = [
      'toolbar.state.ideal',
      'toolbar.scenarios',
      'toolbar.scenario.ai-unbalanced',
      'toolbar.tour',
      'toolbar.compare',
      'toolbar.pause',
      'toolbar.speed',
      'toolbar.speed.20',
      'toolbar.clear',
      'toolbar.use-case',
      'toolbar.settings',
      'settings.realism',
      'settings.ai.all',
      'settings.ai.off',
      'settings.ai-quality.same',
      'settings.rework',
      'settings.rework.strength',
      'settings.belt-motion',
      'settings.pile.heap',
      'settings.reset',
      'settings.download',
      'settings.upload',
      'settings.close',
      'node.eng',
      'node.eng.sign.rework',
    ];
    // ACT
    const found = new Set(controlsOf(page('realistic')).map((c) => c.control));
    // ASSERT
    expect(expected.filter((c) => !found.has(c))).toEqual([]);
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
    const found = new Set(controlsOf(dashboards().eng).map((c) => c.control));
    // ASSERT
    expect(expected.filter((c) => !found.has(c))).toEqual([]);
  });

  it("names the Customer dashboard's controls customer.<field>", () => {
    // ARRANGE
    const expected = ['customer.rate', 'customer.arrivals.steady', 'customer.arrivals.random', 'customer.close'];
    // ACT
    const found = new Set(controlsOf(dashboards().customer).map((c) => c.control));
    // ASSERT
    expect(expected.filter((c) => !found.has(c))).toEqual([]);
  });

  it('writes the Customer and each station read-out as plain values on the card', () => {
    // ARRANGE
    const expected = {
      customer: ['data-readout-output', 'data-readout-satisfied'],
      station: ['data-readout-waiting', 'data-readout-weeks-waiting'],
    };
    // ACT
    const $ = load(page('realistic'));
    const attrs = (control: string) =>
      Object.keys($(`[data-control="${control}"]`).first().attr() ?? {}).filter((a) => a.startsWith('data-readout'));
    // ASSERT
    expect({
      customer: expected.customer.filter((a) => attrs('node.customer').includes(a)),
      station: expected.station.filter((a) => attrs('node.qa').includes(a)),
    }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('has no two controls with the same data-control on one page', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const names = controlsOf(page('realistic')).map((c) => c.control);
    const twice = names.filter((n, i) => names.indexOf(n) !== i);
    // ASSERT
    expect(twice).toEqual(expected);
  });

  it('has no two controls with the same data-control in a dashboard', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const twice = Object.values(dashboards()).flatMap((html) => {
      const names = controlsOf(html).map((c) => c.control);
      return names.filter((n, i) => names.indexOf(n) !== i);
    });
    // ASSERT
    expect(twice).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('names the own-work controls of a work center node.<id>.own.<field>', () => {
    // ARRANGE
    const expected = ['node.pm.own.rate', 'node.pm.own.arrivals.steady', 'node.pm.emit'];
    // ACT
    const found = new Set(controlsOf(dashboards().pm).map((c) => c.control));
    // ASSERT
    expect(expected.filter((c) => !found.has(c))).toEqual([]);
  });
});
