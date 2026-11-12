import { describe, expect, it } from 'vitest';
import { wordsFor } from './software-ecology-data';
import { checkText } from './tour-checks.pure.ts';

/* A tour's checks in plain words (design-ADR 0024 §10): a translated label per measure, never the code form. */

const TITLES = { qa: 'Quality assurance', eng: 'Engineer', customer: 'Customer' };
const en = { words: wordsFor('en').tour.checks, titles: TITLES, locale: 'en' as const };
const de = { words: wordsFor('de').tour.checks, titles: { qa: 'Qualitätssicherung' }, locale: 'de' as const };

describe('success cases', () => {
  it('reads a work center’s bound in plain words with the model’s value', () => {
    // ARRANGE
    const check = { key: 'qa.weeksWaiting', test: '>2', v: 2.3349, ok: true };
    const expected = 'Quality assurance: over 2 weeks of work waiting — 2.3';
    // ACT
    const text = checkText(check, en);
    // ASSERT
    expect(text).toBe(expected);
  });

  it('reads a Customer range and a trend in plain words', () => {
    // ARRANGE
    const range = { key: 'customer.output', test: '0.85–1.15', v: 1.09, ok: true };
    const trend = { key: 'customer.leadDays', test: 'falls', v: 2.79, prev: 2.9, ok: true };
    const expected = ['Output relative to ideal: 0.85 to 1.15 — 1.1', 'Lead time in working days, falling — 2.8'];
    // ACT
    const texts = [checkText(range, en), checkText(trend, en)];
    // ASSERT
    expect(texts).toEqual(expected);
  });

  it('reads German words and German decimals', () => {
    // ARRANGE
    const check = { key: 'qa.weeksWaiting', test: '>2.5', v: 2.3349, ok: false };
    const expected = 'Qualitätssicherung: über 2,5 Wochen Arbeit in der Warteschlange — 2,3';
    // ACT
    const text = checkText(check, de);
    // ASSERT
    expect(text).toBe(expected);
  });
});

describe('failure cases', () => {
  it('never shows the code form, even for a measure with no label', () => {
    // ARRANGE
    const check = { key: 'qa.nope', test: '>2', v: 1, ok: false };
    const code = 'qa.nope';
    // ACT
    const text = checkText(check, en);
    // ASSERT
    expect(text).not.toContain(code);
  });

  it('names the work center and the bound for a measure with no label', () => {
    // ARRANGE
    const check = { key: 'qa.nope', test: '>2', v: 1, ok: false };
    const expected = 'Quality assurance: over 2 — 1.0';
    // ACT
    const text = checkText(check, en);
    // ASSERT
    expect(text).toBe(expected);
  });
});

describe('edge cases', () => {
  it('reads a work center’s trend after its measure, never in the bound’s place', () => {
    // ARRANGE
    const check = { key: 'eng.rework', test: 'falls', v: 0.06, prev: 0.2, ok: true };
    const expected = 'Engineer: share of its work sent back, falling — 0.1';
    // ACT
    const text = checkText(check, en);
    // ASSERT
    expect(text).toBe(expected);
  });

  it('names a work center by its id when it has no title', () => {
    // ARRANGE
    const check = { key: 'ops.busy', test: '<=0.9', v: 0.5, ok: true };
    const expected = 'ops: busy at most 0.9 of the time — 0.5';
    // ACT
    const text = checkText(check, en);
    // ASSERT
    expect(text).toBe(expected);
  });
});
