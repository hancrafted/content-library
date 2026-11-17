// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { WEEKS_PER_STEP } from './factory-dials.pure.ts';
import { floorOf } from './factory-floor-reads.pure.ts';
import { buildFactory, DEFAULT_SEED } from './factory-network.pure.ts';
import type { Floor, FloorEvent, FloorListener, Topology } from './factory-reads.types';
import { seedBacklog } from './factory-seed.pure.ts';
import { stability } from './factory-sizing.pure.ts';
import { snapshotOf, type ReadOptions, type Snapshot } from './factory-snapshot.pure.ts';
import { emitOwn, step } from './factory-step.pure.ts';
import type { Bundle, Settings } from './software-ecology.types';

export type { DocMarks } from './factory-docs.pure.ts';
export type * from './factory-reads.types';
export type { Audit, BeltReadout, ReadOptions, Snapshot } from './factory-snapshot.pure.ts';
export type { NodeDef } from './factory.types';
export { validKey } from './factory-measures.pure.ts';
export { buildFactory, DEFAULT_SEED } from './factory-network.pure.ts';

export interface Check {
  readonly refuse: readonly string[];
  readonly warn: readonly string[];
}

export interface FactoryHandle {
  readonly topology: Topology;
  readonly floor: Floor;
  readonly settings: Settings;
  readonly weeks: number;
  step(weeks: number): void;
  set(s: Settings): void;
  read(o?: ReadOptions): Snapshot;
  pile(weeks: Readonly<Record<string, number>>): void;
  emit(id: string): boolean;
  listen(fn: FloorListener | null): void;
  check(s?: Settings): Check;
}

export const createFactory = (useCase: Bundle, settings: Settings, seed: number = DEFAULT_SEED): FactoryHandle => {
  const m = buildFactory(useCase, settings, seed),
    { floor, stationOf } = floorOf(m);
  return {
    topology: m,
    floor,
    get settings() {
      return m.s;
    },
    get weeks() {
      return m.t;
    },
    step: (weeks) => {
      for (let i = 0, n = Math.round(weeks / WEEKS_PER_STEP); i < n; i++) step(m);
    },
    set: (s) => {
      m.s = s;
    },
    read: (o) => snapshotOf(m, o),
    pile: (weeks) => seedBacklog(m, weeks),
    emit: (id) => emitOwn(m, id),
    listen: (fn) => {
      m.hook = fn && ((what, n, at) => fn(what as FloorEvent, stationOf(n), at));
    },
    check: (s) => stability(m, s),
  };
};

export const copySettings = (s: Settings): Settings => structuredClone(s);
