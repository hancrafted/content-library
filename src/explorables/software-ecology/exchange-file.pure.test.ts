import { describe, expect, it } from 'vitest';
import { exportExchange, type PageState } from './exchange-file.pure.ts';
import { startSettings } from './factory-dials.pure.ts';
import { catalogWordsFor } from './software-ecology-data.ts';
import { builtinBundle } from './use-case-data.ts';

const CATALOGS = { en: catalogWordsFor('en'), de: catalogWordsFor('de') };

/** The page as the reference build shows it after loading: Tire swing at Ideal, the factory view, 5×. */
const idealPage = (): PageState => {
  const B = builtinBundle('tire');
  const p = B.data.presets.find((x) => x.id === 'ideal');
  if (!p) throw new Error('tire has no ideal preset');
  return {
    preset: 'ideal',
    view: 'factory',
    speed: 5,
    beltMotion: false,
    compare: [],
    overlays: { follow: false, isolate: false },
    s: startSettings(B, p),
  };
};

describe('success cases', () => {
  it('writes the reference build’s state block for Tire swing at Ideal', () => {
    // ARRANGE: the lines flow.html's Download YAML writes right after it loads
    const expected = [
      '# What the page shows right now. speed: 0 pause, 1, 2, 5, 10 or 20. customer: its rate, arrivals, mix and follow-up chances. centers: per-center dial overrides. overlays: Follow an order and Isolate, kept for later (no effect yet).',
      'state:',
      '  preset: ideal',
      '  view: factory',
      '  reality: 0',
      '  ai: "off"',
      '  company: product',
      '  aiQuality: same',
      '  speed: 5',
      '  beltMotion: false',
      '  mechanics: { rework: true, churn: true, complaints: true }',
      '  customer:',
      '    rate: 8',
      '    arrivals: steady',
      '    mix: { sales: 30, pm: 50, support: 20 }',
      '    good: { pm: 0.2 }',
      '    bad: {  }',
      '  compare: []',
      '  centers: {  }',
      '  overlays: { follow: false, isolate: false }',
    ].join('\n');
    // ACT
    const text = exportExchange(builtinBundle('tire'), idealPage(), CATALOGS);
    // ASSERT
    expect(text).toContain(expected);
  });
});

describe('failure cases', () => {
  it('leaves out a work center whose dial overrides are all empty', () => {
    // ARRANGE
    const page = idealPage();
    const withEmpty = { ...page, s: { ...page.s, over: { qa: {}, ops: { eff: 140 } } } };
    const expected = '  centers:\n    ops: { efficiency: 140 }\n';
    // ACT
    const text = exportExchange(builtinBundle('tire'), withEmpty, CATALOGS);
    // ASSERT
    expect(text).toContain(expected);
  });
});

describe('edge cases', () => {
  it('writes every language under i18n, the German use case name included', () => {
    // ARRANGE
    const en = '  en:\n    name: Tire swing\n';
    const de = '  de:\n    name: Reifenschaukel\n';
    // ACT
    const text = exportExchange(builtinBundle('tire'), idealPage(), CATALOGS);
    // ASSERT
    expect(text).toContain(en);
    expect(text).toContain(de);
  });

  it('quotes a word plain YAML would read as a boolean or a number', () => {
    // ARRANGE
    const page = idealPage();
    const expected = '  ai: "off"\n';
    // ACT
    const text = exportExchange(builtinBundle('tire'), { ...page, s: { ...page.s, ai: 'off' } }, CATALOGS);
    // ASSERT
    expect(text).toContain(expected);
  });
});
