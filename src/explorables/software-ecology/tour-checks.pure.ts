/*
 * A tour's checks in plain words (design-ADR 0024 §10): "Quality assurance: over 2 weeks of work waiting — 2.3", a
 * translated label per measure holding the test, filled with the work center's title, the bound and the model's value
 * at one decimal.
 * The use-case file keeps the code form (`qa.weeksWaiting: ">2"`); the tour never shows it.
 */
import { fillTemplate } from '@/shared/lib/template.pure';
import type { Check } from './factory-scenario.pure.ts';
import { parseTest } from './scenario-tests.pure.ts';
import type { TourCheckWords } from './software-ecology-words.types';
import type { Locale } from './software-ecology.types';

export interface CheckWordsIn {
  readonly words: TourCheckWords;
  /** Every node's title by id. */
  readonly titles: Readonly<Record<string, string>>;
  readonly locale: Locale;
}

const bound = (k: number, locale: Locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(k);
const value = (v: number, locale: Locale) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);

/** A measure with no label of its own: its name, then the test. */
const BARE = '{name}: {test}';

const OP_KEY = { '>': 'gt', '<': 'lt', '>=': 'gte', '<=': 'lte' } as const;

const testText = (test: string, x: CheckWordsIn): string => {
  const t = parseTest(test),
    w = x.words.test;
  if (!t) return '';
  if (t.kind === 'compare') return fillTemplate(w[OP_KEY[t.op]], { k: bound(t.k, x.locale) });
  if (t.kind === 'range') return fillTemplate(w.range, { lo: bound(t.lo, x.locale), hi: bound(t.hi, x.locale) });
  return w[t.kind];
};

const isTrend = (test: string): boolean => {
  const kind = parseTest(test)?.kind;
  return kind === 'rises' || kind === 'falls';
};

/** The labels for a bound ("Quality assurance: over 2 weeks of work waiting") or a trend ("…: weeks of work waiting"). */
const labelsOf = (who: string, trend: boolean, w: TourCheckWords) => {
  const customer = who === 'customer';
  if (trend) return customer ? w.customerTrend : w.centerTrend;
  return customer ? w.customer : w.center;
};

/** The measure with its test in place; a trend follows the measure: "Lead time in working days, falling". */
const measureText = (c: Check, x: CheckWordsIn): string => {
  const [who = '', what = ''] = c.key.split('.'),
    trend = isTrend(c.test),
    name = x.titles[who] ?? who,
    label = labelsOf(who, trend, x.words)[what] ?? (trend ? '{name}' : BARE),
    test = testText(c.test, x),
    text = fillTemplate(label, { title: name, name, test });
  return trend ? fillTemplate(x.words.trend, { measure: text, test }) : text;
};

/** One check as the tour shows it. */
export const checkText = (c: Check, x: CheckWordsIn): string =>
  fillTemplate(x.words.check, { measure: measureText(c, x), value: value(c.v, x.locale) });
