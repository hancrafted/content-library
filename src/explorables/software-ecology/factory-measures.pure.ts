/*
 * The measures a scenario's `expect:` names (design-ADR 0024 §10): `customer.<measure>` or `<center>.<measure>`,
 * read from the network. Model-side: the Snapshot reads them for `read({ measures })`; the file checks only ask
 * whether a key names one.
 */
import {
  CENTER_MEASURES,
  CUSTOMER_MEASURES,
  type CenterMeasure,
  type CustomerMeasure,
} from './factory-readouts.pure.ts';
import type { Factory } from './factory.types';

/** The value of one measure, `customer.output` or `qa.weeksWaiting`. */
export const metric = (m: Factory, key: string): number => {
  const [who, what] = key.split('.');
  if (who === 'customer') {
    const f = CUSTOMER_MEASURES[what as CustomerMeasure];
    if (!f) throw new Error(`unknown measure ${key}`);
    return f(m);
  }
  const n = m.nodes.get(who ?? ''),
    f = CENTER_MEASURES[what as CenterMeasure];
  if (!n || n.kind !== 'role' || !f) throw new Error(`unknown measure ${key}`);
  return f(n);
};

/** A key names a measure: `customer.<measure>`, or a work center of `centerIds` and its measure. */
export const validKey = (key: string, centerIds: ReadonlySet<string>): boolean => {
  const [who, what] = String(key).split('.');
  return who === 'customer'
    ? (what ?? '') in CUSTOMER_MEASURES
    : centerIds.has(who ?? '') && (what ?? '') in CENTER_MEASURES;
};
