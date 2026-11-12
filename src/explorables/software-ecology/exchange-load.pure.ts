/*
 * Loading an exchange file the schema accepted (design-ADR 0024 §4, §11), as the reference build's `importText`: check
 * stability for each company the file can run as, refuse it with the path to fix, or turn it into a bundle and the page
 * state it was saved from. The rushing and worst-case warnings come back for Upload to show (Q122).
 */
import { NO_OVERLAYS, OVER_OUT, type Overlays, type PageState } from './exchange-file.pure.ts';
import { startSettings } from './factory-dials.pure.ts';
import { createFactory } from './factory-model.pure.ts';
import { presetOf } from './factory-run.pure.ts';
import type {
  Bundle,
  Company,
  Cust,
  CustomerPatch,
  Locale,
  Mechanic,
  Over,
  Preset,
  RoleDef,
  Settings,
  UseCaseData,
  UseCaseWords,
  ViewId,
} from './software-ecology.types';

/** What an exchange file's `state` may hold; the schema checked each value it holds. */
export interface SavedState {
  readonly preset?: string;
  readonly view?: ViewId;
  readonly reality?: number;
  readonly ai?: Settings['ai'];
  readonly company?: Company;
  readonly aiQuality?: Settings['aiq'];
  readonly speed?: number;
  readonly beltMotion?: boolean;
  readonly mechanics?: Partial<Record<Mechanic, boolean>>;
  readonly customer?: CustomerPatch;
  readonly compare?: readonly string[];
  readonly centers?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  readonly overlays?: Partial<Overlays>;
}

export interface ExchangeIn {
  readonly data: UseCaseData;
  readonly words: Readonly<Record<Locale, UseCaseWords>>;
  readonly state: SavedState;
}

export type Upload =
  | { readonly kind: 'unread'; readonly reason: string }
  | { readonly kind: 'broken' | 'unstable'; readonly problems: readonly string[] }
  | {
      readonly kind: 'loaded';
      readonly bundle: Bundle;
      readonly page: PageState;
      /** Work centers and belts, for "Loaded …: 7 work centers and the Customer, 12 belts". */
      readonly centers: number;
      readonly belts: number;
      /** The work centers over capacity while every center rushes, and in the worst case. */
      readonly warn: { readonly rush: readonly string[]; readonly worst: readonly string[] };
    };

const DEFAULT_SPEED = 5;
const OVER_IN = Object.fromEntries(Object.entries(OVER_OUT).map(([a, b]) => [b, a])) as Record<string, keyof Over>;

const bundleOf = (ex: ExchangeIn, x: { name: string; catalog: Readonly<Record<string, RoleDef>> }): Bundle => {
  const data = { ...ex.data, presets: ex.data.presets ?? [{ id: 'ideal', view: 'factory' }] };
  const roles: Record<string, RoleDef> = { ...x.catalog };
  for (const [k, v] of Object.entries(data.roles ?? {})) roles[k] = { ...x.catalog[k], ...v } as RoleDef;
  return { data, roles, words: ex.words, source: x.name };
};

/** The companies a file can run as: both when it has own tickets, since the Model's toggle resizes the line. */
const companiesOf = (data: UseCaseData): Company[] =>
  data.sources?.length ? ['service', 'product'] : [data.company ?? 'service'];

const refusal = (data: UseCaseData, x: string): string => {
  const id = x.split(':')[0] ?? '',
    why = x.slice(x.indexOf(':') + 2);
  if (id === 'customer') return `customer.good / customer.bad: ${why}; lower the follow-up chances`;
  if (id.startsWith('person '))
    return `centers (person ${id.slice(7)}): ${why}; raise its realistic efficiency or lower what reaches it`;
  return `centers[${data.centers.findIndex((c) => c.id === id)}].realistic: ${x}; raise its efficiency or lower what reaches it`;
};

const checked = (B: Bundle) => {
  const cos = companiesOf(B.data),
    p = presetOf(B, B.data.presets[0]?.id ?? 'ideal');
  const out = { refuse: [] as string[], warn: [] as string[], belts: 0 };
  for (const co of cos) {
    const f = createFactory(B, { ...startSettings(B, p), company: co }),
      r = f.check();
    const tag = cos.length > 1 ? ` (as a ${co === 'product' ? 'product company' : 'service provider'})` : '';
    out.refuse.push(...r.refuse.map((x) => x + tag));
    out.warn.push(...r.warn);
    out.belts = f.topology.edges.length;
  }
  return out;
};

const who = (list: readonly string[]): string[] => [...new Set(list.map((x) => x.split(':')[0] ?? ''))];

/** The saved Customer over the preset's: each value the file holds replaces it. */
const custFrom = (base: Cust, c: CustomerPatch = {}): Cust => ({
  rate: c.rate ?? base.rate,
  mode: c.arrivals || base.mode,
  mix: { ...(c.mix || base.mix) },
  good: { ...(c.good || base.good) },
  bad: { ...(c.bad || base.bad) },
});

const overFrom = (centers: SavedState['centers']): Settings['over'] =>
  Object.fromEntries(
    Object.entries(centers ?? {}).map(([id, o]) => [
      id,
      Object.fromEntries(Object.entries(o).flatMap(([k, v]) => (OVER_IN[k] ? [[OVER_IN[k], v]] : []))) as Over,
    ]),
  );

/** The settings the file was saved at, over its preset's (the first one when it names none). */
const settingsOf = (B: Bundle, st: SavedState): Settings => {
  const s = startSettings(B, presetOf(B, st.preset ?? (B.data.presets[0] as Preset).id));
  const kept = {
    ...s,
    aiq: 'same',
    ...defined({ reality: st.reality, ai: st.ai, aiq: st.aiQuality, company: st.company }),
  };
  return {
    ...(kept as Settings),
    preset: st.preset ?? s.preset,
    mech: { ...s.mech, ...st.mechanics },
    over: overFrom(st.centers),
    cust: custFrom(s.cust as Cust, st.customer),
  };
};

/** Only the keys whose value is set. */
const defined = (o: Readonly<Record<string, unknown>>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

const pageOf = (B: Bundle, st: SavedState): PageState => ({
  view: 'factory',
  speed: DEFAULT_SPEED,
  ...defined({ view: st.view, speed: st.speed }),
  preset: settingsOf(B, st).preset,
  beltMotion: !!st.beltMotion,
  compare: (st.compare ?? []).slice(0, 3),
  overlays: { ...NO_OVERLAYS, ...st.overlays },
  s: settingsOf(B, st),
});

/** Checks a schema-valid exchange file for stability, then loads it or refuses it with the path to fix. */
export const loadExchange = (
  ex: ExchangeIn,
  x: { name: string; catalog: Readonly<Record<string, RoleDef>> },
): Upload => {
  const B = bundleOf(ex, x),
    st = checked(B);
  if (st.refuse.length) return { kind: 'unstable', problems: st.refuse.map((r) => refusal(B.data, r)) };
  const worst = st.warn.filter((w) => w.includes('inspection')),
    rush = st.warn.filter((w) => !w.includes('inspection'));
  return {
    kind: 'loaded',
    bundle: B,
    page: pageOf(B, ex.state),
    centers: B.data.centers.length,
    belts: st.belts,
    warn: { rush: who(rush), worst: who(worst) },
  };
};
