/*
 * One run of the factory in time (design-ADR 0024 §14): a model built from a use case and a preset, warmed 60 weeks
 * in chunks behind "Warming up" unless the preset starts clear, then driven by real time at the chosen speed. A late
 * frame drops time instead of spiralling. It reaches the model only through its handle (§1). No DOM: the hook drives
 * it and the painter draws it. Ported from the reference build's `rebuild`, `clearFactory` and `frame`.
 */
import { DAYS, DTW, startSettings, WARM_WEEKS } from './factory-dials.pure.ts';
import {
  createFactory,
  DEFAULT_SEED,
  type FactoryHandle,
  type Floor,
  type FloorListener,
  type ReadOptions,
  type Snapshot,
  type Topology,
} from './factory-model.pure.ts';
import type { Bundle, Preset, Settings } from './software-ecology.types';
import { startBacklogOf } from './start-backlog.pure.ts';
import { unretired } from './use-case-preset-checks.pure.ts';

/** Weeks a real second at 1×; 10× plays a working day in about 0.6 s. */
export const SPEED_1X = 1 / 32;
/** The page starts at 1× (feedback 08); a tour runs at 20× between its steps. */
export const DEFAULT_SPEED = 1;
/** Model steps a frame at most; beyond that the frame drops time. */
export const MAX_STEPS = 40;
/** Warm-up steps a frame. */
export const WARM_CHUNK = 2000;
const WARM_STEPS = Math.round(WARM_WEEKS / DTW);

export const presetOf = (B: Bundle, wanted: string): Preset => {
  const ps = B.data.presets;
  // a link or a Slide still naming the retired swing opens the roles state
  const id = unretired(wanted);
  const p = ps.find((x) => x.id === id) ?? ps.find((x) => x.view === 'factory') ?? ps[0];
  if (!p) throw new Error(`use case ${B.data.id} has no presets`);
  return p;
};

/** The speed a state starts at: its own, else the page's 1×. */
export const startSpeedOf = (B: Bundle, id: string): number => presetOf(B, id).speed ?? DEFAULT_SPEED;

export interface RunOptions {
  readonly B: Bundle;
  readonly preset: string;
  /** Warm-up at once (reduced motion, a hidden page) instead of across frames. */
  readonly now: boolean;
  /** Clear: an empty factory at day 0, no warm-up. */
  readonly clear?: boolean;
  readonly seed?: number;
  /** The settings it starts from; the preset's own by default. */
  readonly s?: Settings;
}

export class FactoryRun {
  readonly preset: Preset;
  warmLeft = 0;
  dropped = 0;
  /** A tour step's model step: time never runs past it (the page and the headless runner stop on the same step). */
  stopAt: number | null = null;
  private acc = 0;
  private readonly f: FactoryHandle;
  private readonly bundle: Bundle;

  constructor(o: RunOptions) {
    this.bundle = o.B;
    this.preset = presetOf(o.B, o.preset);
    this.f = createFactory(o.B, o.s ?? startSettings(o.B, this.preset), o.seed ?? DEFAULT_SEED);
    if (o.clear || this.preset.start === 'clear') return;
    this.warmLeft = WARM_STEPS;
    if (o.now) this.finishWarm();
  }

  /** The warm-up is over: a state that starts loaded gets its backlogs now, so the first frame shows them. */
  private loaded() {
    this.f.pile(startBacklogOf(this.bundle, this.preset, this.f.settings.reality));
  }

  get warming(): boolean {
    return this.warmLeft > 0;
  }

  /** The network's fixed shape, for the layout and the cards. */
  get topology(): Topology {
    return this.f.topology;
  }

  /** The documents on the floor, for the painter. */
  get floor(): Floor {
    return this.f.floor;
  }

  /** The settings the model reads now. */
  get settings(): Settings {
    return this.f.settings;
  }

  /** Model time, in weeks. */
  get weeks(): number {
    return this.f.weeks;
  }

  /** Model steps run so far. */
  get k(): number {
    return Math.round(this.f.weeks / DTW);
  }

  /** The run stands on its tour step. */
  get arrived(): boolean {
    return this.stopAt !== null && !this.warming && this.k >= this.stopAt;
  }

  /** New settings, read from the next step on. */
  set(s: Settings) {
    this.f.set(s);
  }

  /** One own ticket arrives now at the work center; false when it has no source or the company is a Service provider. */
  emit(id: string): boolean {
    return this.f.emit(id);
  }

  listen(fn: FloorListener | null) {
    this.f.listen(fn);
  }

  /** Warm-up progress in days, or null once the line runs. */
  get warmProgress(): Snapshot['warming'] {
    return this.warming ? { day: Math.floor(this.f.weeks * DAYS), of: WARM_WEEKS * DAYS } : null;
  }

  /** The Snapshot, with the run's warm-up and lag for the status line. */
  read(o: ReadOptions = {}): Snapshot {
    return this.f.read({ ...o, warming: this.warmProgress, dropped: this.dropped });
  }

  private steps(n: number) {
    if (n > 0) this.f.step(n * DTW);
  }

  /** Warms the rest at once. */
  finishWarm() {
    if (!this.warming) return;
    this.steps(this.warmLeft);
    this.warmLeft = 0;
    this.loaded();
  }

  private warmChunk() {
    const n = Math.min(WARM_CHUNK, this.warmLeft);
    this.steps(n);
    this.warmLeft -= n;
    this.acc = 0;
    if (!this.warming) this.loaded();
  }

  /** Runs the steps the accumulated time allows, at most MAX_STEPS, never past `stopAt`. */
  private stepDue() {
    const stop = this.stopAt ?? Infinity,
      room = stop - this.k;
    let n = 0;
    for (; this.acc >= DTW && n < MAX_STEPS && n < room; n++) this.acc -= DTW;
    this.steps(n);
    if (this.k >= stop) this.acc = 0;
  }

  /** Runs at once to model step `k`: a tour's Back, or a tour step under reduced motion. */
  runTo(k: number) {
    this.finishWarm();
    this.steps(k - this.k);
    this.acc = 0;
  }

  /** Advances by `dt` real seconds at `speed`; returns true when warm-up just ended. */
  advance(dt: number, speed: number): boolean {
    if (this.warming) {
      this.warmChunk();
      return !this.warming;
    }
    this.acc += dt * speed * SPEED_1X;
    this.stepDue();
    if (this.acc >= DTW) {
      this.dropped = Math.min(5, this.dropped + 1);
      this.acc = 0;
    } else if (this.dropped) this.dropped *= 0.995;
    return false;
  }
}
