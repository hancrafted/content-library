// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { fillTemplate } from '@/shared/lib/template.pure';
import type { Check } from './factory-scenario.pure.ts';
import { parseTest } from './scenario-tests.pure.ts';
import type { TourCheckWords } from './software-ecology-words.types';
import type { Locale } from './software-ecology.types';

export interface CheckWordsIn {
  readonly words: TourCheckWords;
  readonly titles: Readonly<Record<string, string>>;
  readonly locale: Locale;
}

const bound = (k: number, locale: Locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(k);
const value = (v: number, locale: Locale) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);

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

const labelsOf = (who: string, trend: boolean, w: TourCheckWords) => {
  const customer = who === 'customer';
  if (trend) return customer ? w.customerTrend : w.centerTrend;
  return customer ? w.customer : w.center;
};

const measureText = (c: Check, x: CheckWordsIn): string => {
  const [who = '', what = ''] = c.key.split('.'),
    trend = isTrend(c.test),
    name = x.titles[who] ?? who,
    label = labelsOf(who, trend, x.words)[what] ?? (trend ? '{name}' : BARE),
    test = testText(c.test, x),
    text = fillTemplate(label, { title: name, name, test });
  return trend ? fillTemplate(x.words.trend, { measure: text, test }) : text;
};

export const checkText = (c: Check, x: CheckWordsIn): string =>
  fillTemplate(x.words.check, { measure: measureText(c, x), value: value(c.v, x.locale) });
