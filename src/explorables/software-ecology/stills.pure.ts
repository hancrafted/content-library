// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { boxOf, layoutFactory, offsetD, RET, workAt, type FactoryLayout } from './factory-layout.pure';
import type { DocMarks, FloorDoc, FloorList, FloorStation, Snapshot } from './factory-model.pure';
import { at, type Path } from './factory-paths.pure';
import { GAP } from './paint-belts';
import { RACK_W, rackX, SLOT, slotY } from './paint-station';
import { scenarioLastStep } from './scenario-last-step';
import { catalogWordsFor, localeOf, wordsFor } from './software-ecology-data';
import type { Words } from './software-ecology-words.types';
import type { Locale } from './software-ecology.types';
import { beltsOf, cardsOf, customerCardOf, type BeltPart, type CardPart } from './stage-parts.pure';
import { RACK } from './stage-readouts.pure';
import type { FactoryStillState, StillBelt, StillDoc, StillStation } from './stills.types';
import { roleWords, type WordsIn } from './use-case-words.pure';

const DASHBOARD = 'ba';

export type * from './stills.types';

const marksOf = (d: DocMarks): Omit<StillDoc, 'x' | 'y'> => ({
  good: d.good,
  ai: d.ai > 0,
  warn: d.complaint || d.redo,
});

const sameKind = (a: Omit<StillDoc, 'x' | 'y'>, b: Omit<StillDoc, 'x' | 'y'>) =>
  a.good === b.good && a.ai === b.ai && a.warn === b.warn;

const docsOn = (list: FloorList<FloorDoc>, path: Path, t: number): StillDoc[] => {
  const out: StillDoc[] = [],
    along: number[] = [];
  for (let i = 0; i < list.n; i++) {
    const doc = list.at(i),
      span = doc.t1 - doc.t0 || 1,
      s = Math.min(1, Math.max(0, (t - doc.t0) / span)) * path.L,
      marks = marksOf(doc);
    if (out.some((o, j) => Math.abs((along[j] ?? 0) - s) < GAP && sameKind(o, marks))) continue;
    const p = at(path, s);
    out.push({ x: p[0], y: p[1], ...marks });
    along.push(s);
  }
  return out;
};

type Run = ReturnType<typeof scenarioLastStep>;
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
    words: x.words,
  };
}

const CACHE = new Map<string, FactoryStillState>();

export function stillOf(useCase: string, state: string, locale: string): FactoryStillState {
  const lc = localeOf(locale),
    key = `${useCase}/${state}/${lc}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const made = build(scenarioLastStep(useCase, state), lc);
  CACHE.set(key, made);
  return made;
}
