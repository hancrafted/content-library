/*
 * The factory model (design-ADR 0024 §1): a seeded, time-stepped open queueing network behind a small interface.
 * `createFactory(useCase, settings, seed)` returns the one handle the run, the hooks, the painter and every readout
 * use: `step(weeks)`, `set(settings)` and `read(): Snapshot`, plus three typed reads — the network's fixed shape
 * (`topology`), the documents on the floor with named marks (`floor`) and what happens to them (`listen`). Nothing
 * outside the model holds the network itself, writes into it or reads its flags; `factory-model-seam.test.ts` keeps
 * it so. It knows who hands work to whom, never where anything is drawn.
 */
import { DTW } from './factory-dials.pure.ts';
import { floorOf } from './factory-floor-reads.pure.ts';
import { buildFactory, DEFAULT_SEED } from './factory-network.pure.ts';
import type { Floor, FloorEvent, FloorListener, Topology } from './factory-reads.types';
import { stability } from './factory-sizing.pure.ts';
import { snapshotOf, type ReadOptions, type Snapshot } from './factory-snapshot.pure.ts';
import { step } from './factory-step.pure.ts';
import type { Bundle, Settings } from './software-ecology.types';

export type { DocMarks } from './factory-docs.pure.ts';
export type * from './factory-reads.types';
export type { Audit, BeltReadout, ReadOptions, Snapshot } from './factory-snapshot.pure.ts';
export type { NodeDef } from './factory.types';
/** Whether a key names a measure `read({ measures })` can read. */
export { validKey } from './factory-measures.pure.ts';
/** The model's internal seam, for its own tests: the network itself. */
export { buildFactory, DEFAULT_SEED } from './factory-network.pure.ts';

/** What the stability check refuses or warns about at these settings (design-ADR 0024 §1, §12). */
export interface Check {
  readonly refuse: readonly string[];
  readonly warn: readonly string[];
}

export interface FactoryHandle {
  readonly topology: Topology;
  readonly floor: Floor;
  /** The settings the next step reads. */
  readonly settings: Settings;
  /** Model time, in weeks. */
  readonly weeks: number;
  /** Advances the model by whole steps covering `weeks`. */
  step(weeks: number): void;
  /** Replaces the settings; the next step reads them. Pass a new object: a read solves again on a new one. */
  set(s: Settings): void;
  read(o?: ReadOptions): Snapshot;
  /** One listener at a time; null stops listening. */
  listen(fn: FloorListener | null): void;
  /** The stability check at the given settings, the use case's Realistic by default. */
  check(s?: Settings): Check;
}

/** The model's interface: `createFactory(useCase, settings, seed)` → step, set, read and the typed reads. */
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
      for (let i = 0, n = Math.round(weeks / DTW); i < n; i++) step(m);
    },
    set: (s) => {
      m.s = s;
    },
    read: (o) => snapshotOf(m, o),
    listen: (fn) => {
      m.hook = fn && ((what, n, at) => fn(what as FloorEvent, stationOf(n), at));
    },
    check: (s) => stability(m, s),
  };
};

/** Settings to hand `set`: a deep copy, so a change made to it never reaches the settings the model reads now. */
export const copySettings = (s: Settings): Settings => structuredClone(s);
