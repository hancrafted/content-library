// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CustomerDashboard } from './customer-dashboard.client';
import { scenarioLastStep } from './scenario-last-step';
import { catalogWordsFor, wordsFor } from './software-ecology-data';
import { titlesOf } from './use-case-words.pure.ts';

const INTERACTIVE =
  'button, input, select, textarea, summary, [role="button"], [role="switch"], [role="menuitemradio"]';
const STILL = 'still';
const noop = () => undefined;

const controlsOf = (html: string) =>
  load(`<body>${html}</body>`)(INTERACTIVE)
    .toArray()
    .map((el) => ({ tag: el.tagName, control: el.attribs['data-control'], label: el.attribs['aria-label'] ?? '' }));

const customer = () => {
  const { f, B } = scenarioLastStep('tire', STILL);
  const snap = f.read({ watch: ['customer'] });
  const words = wordsFor('en');
  return renderToStaticMarkup(
    createElement(CustomerDashboard, {
      title: 'Customer',
      job: '',
      r: snap.customerDash!,
      titles: titlesOf({ B, locale: 'en' as const, catalog: catalogWordsFor('en') }),
      words: words.custDash,
      rateTip: '',
      close: words.dash,
      onChange: noop,
      onClose: noop,
    }),
  );
};

describe('success cases', () => {
  it("names the Customer dashboard's controls customer.<field>", () => {
    // ARRANGE
    const expected = [
      'customer.rate',
      'customer.arrivals.steady',
      'customer.arrivals.random',
      'customer.bad.spec.pm',
      'customer.bad.code.support',
      'customer.close',
    ];
    // ACT
    const found = new Set(controlsOf(customer()).map((c) => c.control));
    // ASSERT
    expect(expected.filter((c) => !found.has(c))).toEqual([]);
  });
});

describe('failure cases', () => {
  it('gives every control of the Customer dashboard a data-control', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const missing = controlsOf(customer())
      .filter((c) => !c.control)
      .map((c) => `${c.tag} ${c.label}`);
    // ASSERT
    expect(missing).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('has no two controls with the same data-control', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const names = controlsOf(customer()).map((c) => c.control);
    // ASSERT
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual(expected);
  });
});
