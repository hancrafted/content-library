// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { copyKinds, kindChancesOf } from './defect.pure.ts';
import { displayOf } from './display-defaults.pure.ts';
import { NO_OVERLAYS, OVER_OUT, type Overlays, type PageState } from './exchange-file.pure.ts';
import { createFactory } from './factory-model.pure.ts';
import { DEFAULT_SPEED, presetOf } from './factory-run.pure.ts';
import type {
  Arrivals,
  Bundle,
  Company,
  Cust,
  CustomerPatch,
  Locale,
  Mechanic,
  Over,
  OwnSet,
  PileStyle,
  Preset,
  RoleDef,
  Settings,
  UseCaseData,
  UseCaseWords,
  ViewId,
} from './software-ecology.types';
import { startSettings } from './start-settings.pure.ts';

export interface SavedState {
  readonly preset?: string;
  readonly view?: ViewId;
  readonly reality?: number;
  readonly ai?: Settings['ai'];
  readonly company?: Company;
  readonly aiQuality?: Settings['aiq'];
  readonly speed?: number;
  readonly beltMotion?: boolean;
  readonly pile?: PileStyle;
  readonly mechanics?: Partial<Record<Mechanic, boolean>>;
  readonly customer?: CustomerPatch;
  readonly compare?: readonly string[];
  readonly centers?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  readonly sources?: Readonly<Record<string, { readonly rate?: number; readonly arrivals?: Arrivals }>>;
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
      readonly centers: number;
      readonly belts: number;
      readonly warn: { readonly rush: readonly string[]; readonly worst: readonly string[] };
    };

const OVER_IN = Object.fromEntries(Object.entries(OVER_OUT).map(([a, b]) => [b, a])) as Record<string, keyof Over>;

const bundleOf = (ex: ExchangeIn, x: { name: string; catalog: Readonly<Record<string, RoleDef>> }): Bundle => {
  const data = { ...ex.data, presets: ex.data.presets ?? [{ id: 'ideal', view: 'factory' }] };
  const roles: Record<string, RoleDef> = { ...x.catalog };
  for (const [k, v] of Object.entries(data.roles ?? {})) roles[k] = { ...x.catalog[k], ...v } as RoleDef;
  return { data, roles, words: ex.words, source: x.name };
};

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

const custFrom = (base: Cust, c: CustomerPatch = {}): Cust => ({
  rate: c.rate ?? base.rate,
  mode: c.arrivals || base.mode,
  mix: { ...(c.mix || base.mix) },
  good: { ...(c.good || base.good) },
  bad: c.bad ? kindChancesOf(c.bad) : copyKinds(base.bad),
});

const overFrom = (centers: SavedState['centers']): Settings['over'] =>
  Object.fromEntries(
    Object.entries(centers ?? {}).map(([id, o]) => [
      id,
      Object.fromEntries(Object.entries(o).flatMap(([k, v]) => (OVER_IN[k] ? [[OVER_IN[k], v]] : []))) as Over,
    ]),
  );

const ownFrom = (sources: SavedState['sources']): Settings['own'] =>
  Object.fromEntries(
    Object.entries(sources ?? {}).map(([id, o]) => [id, defined({ rate: o.rate, arrivals: o.arrivals }) as OwnSet]),
  );

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
    own: ownFrom(st.sources),
    cust: custFrom(s.cust as Cust, st.customer),
  };
};

const defined = (o: Readonly<Record<string, unknown>>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

const pageOf = (B: Bundle, st: SavedState): PageState => {
  const s = settingsOf(B, st),
    d = displayOf(B, presetOf(B, s.preset));
  return {
    view: 'factory',
    speed: DEFAULT_SPEED,
    ...defined({ view: st.view, speed: st.speed }),
    preset: s.preset,
    beltMotion: st.beltMotion ?? d.beltMotion,
    pile: st.pile ?? d.pile,
    compare: (st.compare ?? []).slice(0, 3),
    overlays: { ...NO_OVERLAYS, ...st.overlays },
    s,
  };
};

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
