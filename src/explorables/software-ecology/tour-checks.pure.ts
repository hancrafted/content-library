/*
 * A tour's checks in plain words (design-ADR 0024 §10): "Quality assurance, weeks of work waiting: over 2 — 2.33",
 * a translated label per measure and per test, filled with the work center's title, the bound and the model's value.
 * The use-case file keeps the code form (`qa.weeksWaiting: ">2"`); the tour never shows it.
 */
import { fillTemplate } from '@/shared/lib/template.pure';
import { parseTest, type Check } from './factory-scenario.pure.ts';
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
  new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const OP_KEY = { '>': 'gt', '<': 'lt', '>=': 'gte', '<=': 'lte' } as const;

const testText = (test: string, x: CheckWordsIn): string => {
  const t = parseTest(test),
    w = x.words.test;
  if (!t) return '';
  if (t.kind === 'compare') return fillTemplate(w[OP_KEY[t.op]], { k: bound(t.k, x.locale) });
  if (t.kind === 'range') return fillTemplate(w.range, { lo: bound(t.lo, x.locale), hi: bound(t.hi, x.locale) });
  return w[t.kind];
};

const centerText = (who: string, what: string, x: CheckWordsIn): string => {
  const title = x.titles[who] ?? who,
    label = x.words.center[what];
  return label ? fillTemplate(label, { title }) : title;
};

const measureText = (key: string, x: CheckWordsIn): string => {
  const [who = '', what = ''] = key.split('.');
  return who === 'customer' ? (x.words.customer[what] ?? x.titles.customer ?? '') : centerText(who, what, x);
};

/** One check as the tour shows it. */
export const checkText = (c: Check, x: CheckWordsIn): string =>
  fillTemplate(x.words.check, {
    measure: measureText(c.key, x),
    test: testText(c.test, x),
    value: value(c.v, x.locale),
  });
