// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import {
  CENTER_MEASURES,
  CUSTOMER_MEASURES,
  type CenterMeasure,
  type CustomerMeasure,
} from './factory-readouts.pure.ts';
import type { Factory } from './factory.types';

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
  return f(n, m);
};

export const validKey = (key: string, centerIds: ReadonlySet<string>): boolean => {
  const [who, what] = String(key).split('.');
  return who === 'customer'
    ? (what ?? '') in CUSTOMER_MEASURES
    : centerIds.has(who ?? '') && (what ?? '') in CENTER_MEASURES;
};
