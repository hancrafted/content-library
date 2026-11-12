/*
 * The exchange file (design-ADR 0024 §11): Download writes the page's current state as one YAML holding the use case's
 * data keys, the roles it uses, `state` and every language under `i18n`. Ported from the reference build's `exportDoc`,
 * so the file reads as flow.html's and survives Upload and Download byte for byte.
 */
import { badOut } from './defect.pure.ts';
import { stringifyExchange } from './exchange-writer.pure.ts';
import { custOf } from './factory-dials.pure.ts';
import type {
  Bundle,
  CatalogWords,
  Locale,
  Over,
  PileStyle,
  RoleWords,
  Settings,
  ViewId,
} from './software-ecology.types';

export const SCHEMA_ID = 'software-ecology-factory/5';

/** Follow an order and Isolate: kept in the file for later, no effect yet. */
export interface Overlays {
  readonly follow: boolean;
  readonly isolate: boolean;
}
export const NO_OVERLAYS: Overlays = { follow: false, isolate: false };

/** What the page shows that the file keeps: the state, the view, speed, belt motion, the compare set and the settings. */
export interface PageState {
  readonly preset: string;
  readonly view: ViewId;
  readonly speed: number;
  readonly beltMotion: boolean;
  readonly pile: PileStyle;
  readonly compare: readonly string[];
  readonly overlays: Overlays;
  readonly s: Settings;
}

const DATA_KEYS = [
  'id',
  'panels',
  'layout',
  'mechanics',
  'customer',
  'company',
  'sources',
  'bottleneck',
  'backlog',
  'display',
  'centers',
  'routes',
  'presets',
] as const;

/** The reference build's comments per key: `#path` above the key, `path` beside it. */
const NOTES: Readonly<Record<string, string>> = {
  '#schema':
    'Software ecology factory. Edit any value, save, and drop the file back on the page to run the factory from it. A file is refused if any work center would be over capacity at Realistic.',
  '#mechanics':
    'While its toolbar toggle is on: rework = chance bad input is sent back (0 to 1); churn = how many times the documents a center hands on when it keeps bad input (1 to 4). A station’s catch overrides rework per defect kind; complaints take their chance from customer.bad.',
  '#customer':
    'The one Customer, source and sink. rate: requests a week; Ideal sizes every work center for it. arrivals: steady or random (default: steady in Ideal, random otherwise). mix: where requests go, as weights. good / bad: the chance a good or bad release brings a new request, and where it goes (a bad release brings a complaint, per defect kind in bad: { spec: {…}, code: {…} }, or one map for both); each set adds up to less than 1. releases: the work centers whose shipments are releases (the rest are answers).',
  company:
    'service: only the Customer asks for work; product: roles also write tickets of their own (sources). Also a toggle in Model.',
  '#sources':
    "Product company only: own tickets a week, written into a work center's backlog and handed on like a request ({ id, at, rate }). They scale with that center's AI extra tasks. arrivals (steady or random) is optional; what a visitor sets on a dashboard is kept under state.sources, by id.",
  '#backlog':
    "Starting backlogs, in weeks of work (weeks times the work center's Ideal capacity), put in when a state loads after its warm-up; Realistic starts full, Ideal clear, in between scales. A preset may carry its own.",
  '#display':
    'What every state shows unless it says its own: pile (heap, stack or drift) past the rack, beltMotion (belts moving). The Settings reset returns to these.',
  bottleneck: 'the work center near 85 % busy at Realistic; every other is sized to at most 70 %',
  '#centers':
    'Work centers: id, role (see roles), at: [x, y], realistic: [efficiency, effectiveness] at Model = Realistic, spawns: what a finished job creates ({ to, n }, { to, p } or choose: [{ to, w }]; to: customer ships; the first spawn carries the request on). Optional: service: exponential, buffer: n (senders wait when it is full), inspection: true with stampUnderPressure (0 to 2), person: (one person runs several centers), dials, catch: { spec, code } (the chance it sends a bad input of that defect kind back, over rework; a kind left out passes), origin: spec or code (the defect kind it makes, over its role’s), stall: { at, slow } (once at weeks of work wait it loses the share slow of its speed; AI at the station removes it).',
  '#routes':
    'Belt routes, keyed from-to: out and in (port: left, right, top, bottom), via (corners), xm (elbow x), over (crosses on a bridge). The belts themselves come from the spawns and the Customer. Every handoff takes a quarter working day, whatever the length.',
  '#presets':
    'States. The roles state, Ideal and Realistic sit on the toolbar; the rest under Scenarios. view: roles | factory (a retired swing reads as roles). reality: 0 (Ideal) to 100 (Realistic). ai: all, off or a list of center ids. dials: per-center overrides (efficiency, effectiveness, fanout, aiSpeed, aiExtra). compare: up to three ids. customer: overrides of the Customer. start: clear or warm. speed. tour: steps { set, run (weeks from the start), card, expect }; check: one step. expect: { "<customer or center>.<measure>": test }, e.g. { qa.weeksWaiting: ">2", customer.output: "0.9–1.1" }.',
  '#roles': 'Roles used here. fan: tasks handed on per task; aiSize: how much longer an AI document takes to read.',
  '#state':
    'What the page shows right now. speed: 0 pause, 1, 2, 5, 10 or 20. beltMotion, pile: how the factory is drawn now. customer: its rate, arrivals, mix and follow-up chances. centers: per-center dial overrides. overlays: Follow an order and Isolate, kept for later (no effect yet).',
  '#i18n': 'Words per locale. Titles of centers default to their role title.',
};

/** A dial override's name in the file, by its name in the settings. */
export const OVER_OUT: Readonly<Record<keyof Over, string>> = {
  eff: 'efficiency',
  effv: 'effectiveness',
  fan: 'fanout',
  ai: 'ai',
  aiSpeed: 'aiSpeed',
  aiExtra: 'aiExtra',
};

type Doc = Record<string, unknown>;
type Catalogs = Readonly<Record<Locale, CatalogWords>>;
const LOCALES: readonly Locale[] = ['en', 'de'];
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v ?? {})) as T;

const roleWordsIn = (B: Bundle, x: { role: string; l: Locale; catalogs: Catalogs }): RoleWords => ({
  ...(x.catalogs[x.l].roles[x.role] ?? x.catalogs.en.roles[x.role] ?? {}),
  ...(B.words[x.l]?.roles?.[x.role] ?? {}),
});

const centersOut = (over: Settings['over']): Doc => {
  const out: Doc = {};
  for (const [id, o] of Object.entries(over)) {
    const c: Doc = {};
    for (const [k, v] of Object.entries(o)) if (k in OVER_OUT) c[OVER_OUT[k as keyof Over]] = v;
    if (Object.keys(c).length) out[id] = c;
  }
  return out;
};

/** The own-work settings the visitor set, by source id: `rate` and `arrivals`; nothing when none is set. */
const ownOut = (own: Settings['own']): Doc => {
  const out: Doc = {};
  for (const [id, o] of Object.entries(own)) {
    const c: Doc = {};
    if (o.rate !== undefined) c.rate = o.rate;
    if (o.arrivals !== undefined) c.arrivals = o.arrivals;
    if (Object.keys(c).length) out[id] = c;
  }
  return Object.keys(out).length ? { sources: out } : {};
};

const stateOf = (B: Bundle, page: PageState): Doc => {
  const s = page.s,
    cu = custOf({ B }, s);
  return {
    preset: page.preset,
    view: page.view,
    reality: s.reality,
    ai: s.ai,
    company: s.company,
    aiQuality: s.aiq,
    speed: page.speed,
    beltMotion: page.beltMotion,
    pile: page.pile,
    mechanics: { ...s.mech },
    customer: { rate: cu.rate, arrivals: cu.mode, mix: { ...cu.mix }, good: { ...cu.good }, bad: badOut(cu.bad) },
    compare: [...page.compare],
    centers: centersOut(s.over),
    overlays: { ...page.overlays },
    ...ownOut(s.own),
  };
};

/** One locale's words: the use case's own, each state's name, the scenarios and every used role's words filled in. */
const wordsIn = (B: Bundle, x: { l: Locale; used: readonly string[]; catalogs: Catalogs }): Doc => {
  const presets = B.data.presets,
    cat = x.catalogs[x.l];
  const w = clone(B.words[x.l]) as Doc & { presets?: Doc; scenarios?: Doc };
  w.name ||= B.data.id;
  w.presets = Object.fromEntries(presets.map((p) => [p.id, w.presets?.[p.id] || cat.presets[p.id] || p.id]));
  const sc = Object.fromEntries(
    presets.map((p) => [p.id, w.scenarios?.[p.id] || cat.scenarios?.[p.id]]).filter(([, v]) => v),
  );
  if (Object.keys(sc).length) w.scenarios = sc;
  else delete w.scenarios;
  w.roles = Object.fromEntries(x.used.map((role) => [role, roleWordsIn(B, { role, l: x.l, catalogs: x.catalogs })]));
  return w;
};

/** The exchange document of the page's current state. */
export const exchangeDoc = (B: Bundle, page: PageState, catalogs: Catalogs): Doc => {
  const uc = B.data as unknown as Doc;
  const used = [...new Set(['customer', ...B.data.centers.map((c) => c.role)])];
  const data: Doc = {};
  for (const k of DATA_KEYS) if (uc[k] !== undefined) data[k] = clone(uc[k]);
  data.mechanics = { ...page.s.strength };
  return {
    schema: SCHEMA_ID,
    ...data,
    roles: Object.fromEntries(used.map((r) => [r, { ...B.roles[r] }])),
    state: stateOf(B, page),
    i18n: Object.fromEntries(LOCALES.map((l) => [l, wordsIn(B, { l, used, catalogs })])),
  };
};

/** The exchange file's text, as Download YAML writes it. */
export const exportExchange = (B: Bundle, page: PageState, catalogs: Catalogs): string =>
  stringifyExchange(exchangeDoc(B, page, catalogs), NOTES);

/** The name Download gives the file. */
export const exchangeName = (B: Bundle): string => `software-ecology-${B.data.id}.yaml`;
