/*
 * What each control does to the settings (design-ADR 0024 §3, §6, §17): a state from the toolbar, the Model popover's
 * reality and AI, a dashboard's dial and the Customer's dashboard. Each returns new settings and leaves the old ones
 * alone, so the run reads them on its next step. Ported from the reference build's `applyPreset`, `renderModel` and
 * `wireDashboard`/`wireCustomer` handlers.
 */
import { copyKinds } from './defect.pure.ts';
import { fileMechanics } from './mechanics.pure.ts';
import type {
  AiQuality,
  AiSet,
  Bundle,
  Company,
  Cust,
  Defect,
  Mechanic,
  Over,
  OwnSet,
  Preset,
  Settings,
  Strength,
} from './software-ecology.types';
import { presetSettings, startSettings } from './start-settings.pure.ts';

/**
 * The settings a state sets on the page: the preset's reality, AI, dials and Customer. Company, AI quality, mechanics
 * and strengths stay as they were (`prev`), as the reference build's `applyPreset` keeps them; on load they start from
 * the use case.
 */
export const pageSettings = (B: Bundle, p: Preset, prev: Settings | null): Settings =>
  prev ? { ...prev, ...presetSettings(B, p) } : startSettings(B, p);

/** The settings a new use case starts from: its own company and strengths; AI quality and mechanics kept. */
export const useCaseSettings = (B: Bundle, p: Preset, prev: Settings): Settings => ({
  ...pageSettings(B, p, prev),
  company: B.data.company ?? 'service',
  ...fileMechanics(B),
});

const mapOver = (over: Settings['over'], drop: readonly (keyof Over)[]): Settings['over'] =>
  Object.fromEntries(
    Object.entries(over).map(([id, o]) => [
      id,
      Object.fromEntries(Object.entries(o).filter(([k]) => !drop.includes(k as keyof Over))) as Over,
    ]),
  );

/** The Model's Ideal … Realistic: every dashboard's efficiency and effectiveness give way to it. */
export const withReality = (s: Settings, reality: number): Settings => ({
  ...s,
  reality,
  over: mapOver(s.over, ['eff', 'effv']),
});

/** Where AI works, from the Model: every dashboard's own AI switch gives way to it. */
export const withAi = (s: Settings, ai: AiSet): Settings => ({ ...s, ai, over: mapOver(s.over, ['ai']) });

/** One work center's dials, from its dashboard. */
export const withOver = (s: Settings, id: string, patch: Over): Settings => ({
  ...s,
  over: { ...s.over, [id]: { ...s.over[id], ...patch } },
});

export const withMech = (s: Settings, k: Mechanic): Settings => ({ ...s, mech: { ...s.mech, [k]: !s.mech[k] } });
export const withStrength = (s: Settings, k: Strength, v: number): Settings => ({
  ...s,
  strength: { ...s.strength, [k]: v },
});
export const withAiq = (s: Settings, aiq: AiQuality): Settings => ({ ...s, aiq });
/** One source's own work, from its dashboard: tickets a week or Steady and Random. Product company only reads it. */
export const withOwn = (s: Settings, id: string, patch: OwnSet): Settings => ({
  ...s,
  own: { ...s.own, [id]: { ...s.own[id], ...patch } },
});

export const withCompany = (s: Settings, company: Company): Settings => ({ ...s, company });

/** One change on the Customer's dashboard. */
export type CustomerChange =
  | { readonly kind: 'rate'; readonly v: number }
  | { readonly kind: 'mode'; readonly v: Cust['mode'] }
  | { readonly kind: 'mix'; readonly to: string; readonly v: number }
  | { readonly kind: 'good'; readonly to: string; readonly v: number }
  | { readonly kind: 'bad'; readonly defect: Defect; readonly to: string; readonly v: number };

/** Follow-up chances stay below this in total, so the requests settle. */
const FOLLOW_MAX = 0.95;

type Chance = Extract<CustomerChange, { kind: 'good' | 'bad' }>;
/** The follow-up chances a change sets one of. */
const followUpsOf = (c: Cust, x: Chance): Record<string, number> => (x.kind === 'bad' ? c.bad[x.defect] : c.good);

const chance = (c: Cust, x: Chance): number => {
  const others = Object.entries(followUpsOf(c, x))
    .filter(([t]) => t !== x.to)
    .reduce((a, [, v]) => a + v, 0);
  return Math.min(x.v, FOLLOW_MAX - others);
};

/** The Customer at `cu` (its values now) with one change; a follow-up chance is capped so all stay below 0.95. */
export const withCustomer = (s: Settings, cu: Cust, x: CustomerChange): Settings => {
  const c: Cust = { ...cu, mix: { ...cu.mix }, good: { ...cu.good }, bad: copyKinds(cu.bad) };
  if (x.kind === 'rate') c.rate = x.v;
  else if (x.kind === 'mode') c.mode = x.v;
  else if (x.kind === 'mix') c.mix[x.to] = x.v;
  else followUpsOf(c, x)[x.to] = chance(c, x);
  return { ...s, cust: c };
};

export interface AiChoice {
  readonly id: string;
  readonly ai: AiSet;
  readonly label: string;
}

/** Every list of work centers a preset or one of its tour steps puts AI at, in file order. */
const aiListsOf = (B: Bundle): (readonly string[])[] =>
  B.data.presets.flatMap((p) => [p.ai, ...(p.tour ?? []).map((st) => st.set?.ai)]).filter((x) => Array.isArray(x));

/** The Model's AI choices: off, each set of work centers a preset or a tour step names, everywhere. `label` is filled by the caller for off and everywhere. */
export const aiChoicesOf = (B: Bundle, title: (id: string) => string): AiChoice[] => {
  const seen = new Set<string>(),
    sets: AiChoice[] = [];
  for (const ai of aiListsOf(B)) {
    if (seen.has(ai.join())) continue;
    seen.add(ai.join());
    sets.push({ id: `ai:${ai.join(',')}`, ai: [...ai], label: ai.map(title).join(', ') });
  }
  return [{ id: 'off', ai: 'off', label: '' }, ...sets, { id: 'ai:all', ai: 'all', label: '' }];
};

/** An AI choice's eval hook (`settings.ai.<hook>`): `off`, `all`, or the work centers' ids sorted and dash-joined (`eng-qa`). */
export const aiHookOf = (c: Pick<AiChoice, 'ai'>): string =>
  typeof c.ai === 'string' ? c.ai : [...c.ai].sort().join('-');

const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x));

/** The AI choice in effect, or '' for a set no preset names. */
export const aiKeyOf = (B: Bundle, s: Settings): string => {
  if (s.ai === 'off') return 'off';
  if (s.ai === 'all') return 'ai:all';
  const cur = s.ai,
    found = aiListsOf(B).find((x) => sameSet(x, cur));
  return found ? `ai:${found.join(',')}` : '';
};
