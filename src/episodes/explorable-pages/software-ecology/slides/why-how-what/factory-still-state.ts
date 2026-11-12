/*
 * The stills' state: the software ecology Explorable's own model, run headless at build time to the AI-unbalanced
 * tour's last step (week 20), with the shipped seed, the use case's layout and its words in the page locale. The
 * Explorable's tour and its headless checks stop on the same model step, so the stills show the very state a viewer
 * reaches with Tour, and a retuned model redraws them on the next build. It reads the model through its handle only
 * (design-ADR 0024 §1): the Snapshot, the Topology and the Floor.
 */
import {
  boxOf,
  layoutFactory,
  offsetD,
  RET,
  workAt,
  type FactoryLayout,
} from '@/explorables/software-ecology/factory-layout.pure';
import type {
  DocMarks,
  FloorDoc,
  FloorList,
  FloorStation,
  Snapshot,
} from '@/explorables/software-ecology/factory-model.pure';
import { at, type Path } from '@/explorables/software-ecology/factory-paths.pure';
import { TOUR_SPEED } from '@/explorables/software-ecology/factory-tour.pure';
import { GAP } from '@/explorables/software-ecology/paint-belts';
import { RACK_W, rackX, SLOT, slotY } from '@/explorables/software-ecology/paint-station';
import { scenarioLastStep } from '@/explorables/software-ecology/scenario-last-step';
import { catalogWordsFor, localeOf, wordsFor } from '@/explorables/software-ecology/software-ecology-data';
import type { Words } from '@/explorables/software-ecology/software-ecology-words.types';
import type { Locale } from '@/explorables/software-ecology/software-ecology.types';
import {
  beltsOf,
  cardsOf,
  customerCardOf,
  type BeltPart,
  type CardPart,
} from '@/explorables/software-ecology/stage-parts.pure';
import { RACK } from '@/explorables/software-ecology/stage-readouts.pure';
import {
  presetName,
  roleWords,
  scenarioWords,
  useCaseName,
  type WordsIn,
} from '@/explorables/software-ecology/use-case-words.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import type { FactoryStillState, StillBelt, StillDoc, StillStation } from './factory-still.types';

const USE_CASE = 'tire';
const SCENARIO = 'ai-unbalanced';
/** The work center whose dashboard the What pin opens. */
const DASHBOARD = 'ba';
/** The states the Explorable's toolbar shows on its row, in its order; the Scenarios menu holds the rest. */
const ROW_STATES = ['roles', 'ideal', 'realistic'] as const;

export type * from './factory-still.types';

const marksOf = (d: DocMarks): Omit<StillDoc, 'x' | 'y'> => ({
  good: d.good,
  ai: d.ai > 0,
  warn: d.complaint || d.redo,
});

const sameKind = (a: Omit<StillDoc, 'x' | 'y'>, b: Omit<StillDoc, 'x' | 'y'>) =>
  a.good === b.good && a.ai === b.ai && a.warn === b.warn;

/** The documents riding a path at model time `t`, each where its handoff has taken it; near alike ones merge. */
const docsOn = (list: FloorList<FloorDoc>, path: Path, t: number): StillDoc[] => {
  const out: StillDoc[] = [],
    along: number[] = [];
  for (let i = 0; i < list.n; i++) {
    const doc = list.at(i),
      span = doc.t1 - doc.t0 || 1,
      s = Math.min(1, Math.max(0, (t - doc.t0) / span)) * path.L,
      marks = marksOf(doc);
    // Closer documents of the same kind merge, as the painter merges them.
    if (out.some((o, j) => Math.abs((along[j] ?? 0) - s) < GAP && sameKind(o, marks))) continue;
    const p = at(path, s);
    out.push({ x: p[0], y: p[1], ...marks });
    along.push(s);
  }
  return out;
};

/** The model at the scenario's last tour step: warmed, then each step's dials set and run to its week. */
const runToLastStep = () => scenarioLastStep(USE_CASE, SCENARIO);

type Run = ReturnType<typeof runToLastStep>;
interface Read {
  readonly run: Run;
  readonly w: WordsIn;
  readonly words: Words;
  readonly layout: FactoryLayout;
  readonly snap: Snapshot;
}

const need = <T>(v: T | undefined, what: string): T => {
  if (v === undefined) throw new Error(`${what} is missing from the factory.`);
  return v;
};

function beltOf(x: Read, key: string, labels: Readonly<Record<string, BeltPart>>): StillBelt {
  const floor = x.run.f.floor,
    b = need(x.layout.belts[key], `The belt ${key}`),
    fb = need(floor.belt(key), `The belt ${key}`),
    lb = need(labels[key], `The belt label ${key}`);
  const back = x.snap.belts[key]?.retOn ? offsetD(b.path, RET) : null;
  const end = b.corners.at(-1) ?? [0, 0];
  // a document on the rework lane is coming back to be redone: the red warning
  const sentBack = back ? docsOn(fb.back, b.retVis, floor.t).map((d) => ({ ...d, warn: true })) : [];
  return {
    key,
    d: b.path.d,
    back,
    label: lb.label,
    labelAt: lb.at,
    docs: [...docsOn(fb.fwd, b.path, floor.t), ...sentBack],
    end: [end[0], end[1]],
    from: fb.from.id,
    to: fb.to.id,
  };
}

function beltsIn(x: Read): StillBelt[] {
  const topo = x.run.f.topology;
  const parts = beltsOf({ topo, layout: x.layout, w: x.w, stage: x.words.stage });
  const labels = Object.fromEntries(parts.map((b) => [b.key, b]));
  return x.layout.order.map((key) => beltOf(x, key, labels));
}

/** The rack's slots from the bottom: the first six documents waiting, run by run. */
function rackOf(n: FloorStation): StillDoc[] {
  const def = n.node.def,
    rack: StillDoc[] = [];
  for (let i = 0; i < n.queue.n && rack.length < RACK; i++) {
    const run = n.queue.at(i);
    for (let j = 0; j < run.c && rack.length < RACK; j++) {
      rack.push({ x: rackX(def), y: slotY(def, rack.length), ...marksOf(run) });
    }
  }
  return rack;
}

function stationOf(x: Read, c: CardPart): StillStation {
  const n = need(x.run.f.floor.station(c.id), `The work center ${c.id}`),
    r = need(x.snap.stations[c.id], `The work center ${c.id}`),
    def = n.node.def,
    [wx, wy] = workAt(def);
  return {
    ...c,
    ai: r.ai,
    waiting: r.waiting,
    weeks: r.weeks,
    level: r.level,
    rack: rackOf(n),
    rackAt: { x: rackX(def), w: RACK_W, topY: slotY(def, RACK - 1), slot: SLOT },
    work: n.work ? { x: wx, y: wy, ...marksOf(n.work.doc) } : null,
    aiExtra: r.ai ? (x.run.f.settings.over[c.id]?.aiExtra ?? 1) : 1,
  };
}

function dashboardIn(x: Read, title: string): FactoryStillState['dashboard'] {
  const node = need(x.run.f.topology.nodes.get(DASHBOARD), `The ${DASHBOARD} work center`);
  return {
    id: DASHBOARD,
    title,
    icon: node.role.icon ?? node.roleId,
    role: roleWords(x.w, node.roleId),
    r: need(x.snap.dashboards[DASHBOARD], `The ${DASHBOARD} dashboard`),
  };
}

function toolbarIn(x: Read): FactoryStillState['toolbar'] {
  const scenario = scenarioWords(x.w, SCENARIO);
  return {
    states: ROW_STATES.map((id) => presetName(x.w, id)),
    scenario: presetName(x.w, x.run.preset.id),
    caption: scenario.steps?.[x.run.last] ?? '',
    // the tour pauses on its step and Play resumes at the speed it ran between steps
    speed: `${TOUR_SPEED}×`,
    // the step's week, on its first working day, as the tour's clock counts from the tour's start
    clock: fillTemplate(x.words.toolbar.week, { w: x.run.week, d: 1 }),
    useCase: useCaseName(x.w),
  };
}

function build(run: Run, lc: Locale): FactoryStillState {
  const topo = run.f.topology,
    w: WordsIn = { B: run.B, locale: lc, catalog: catalogWordsFor(lc) };
  const x: Read = {
    run,
    w,
    words: wordsFor(lc),
    layout: layoutFactory(topo),
    snap: run.f.read({ watch: [DASHBOARD] }),
  };
  const stations = cardsOf(topo, w).map((c) => stationOf(x, c));
  const title = stations.find((s) => s.id === DASHBOARD)?.title ?? DASHBOARD;
  return {
    week: run.week,
    width: x.layout.width,
    height: x.layout.height,
    top: x.layout.top,
    plates: x.layout.plates.map(([px, py]) => [px, py] as const),
    belts: beltsIn(x),
    stations,
    customer: { ...x.snap.customer, title: customerCardOf(topo, w).title, box: boxOf(topo.cust.def) },
    dashboard: dashboardIn(x, title),
    toolbar: toolbarIn(x),
    words: x.words,
  };
}

const CACHE = new Map<Locale, FactoryStillState>();
let RUN: Run | null = null;

/** The stills' state in a locale: the model runs once a build, its words are read per locale. */
export function factoryStillState(locale: string): FactoryStillState {
  const lc = localeOf(locale);
  const hit = CACHE.get(lc);
  if (hit) return hit;
  RUN ??= runToLastStep();
  const state = build(RUN, lc);
  CACHE.set(lc, state);
  return state;
}
