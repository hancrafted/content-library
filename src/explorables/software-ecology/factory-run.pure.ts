// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { type Sampler, type Values } from './beat-means.pure.ts';
import { DAYS, DTW, WARM_WEEKS } from './factory-dials.pure.ts';
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
import { startSettings } from './start-settings.pure.ts';
import { unretired } from './use-case-preset-checks.pure.ts';

/** Weeks a real second at 1×; 10× plays a working day in about 0.6 s. */
export const SPEED_1X = 1 / 32;
export const DEFAULT_SPEED = 1;
/** Model steps a frame at most; beyond that the frame drops time. */
export const MAX_STEPS = 40;
/** Warm-up steps a frame. */
export const WARM_CHUNK = 2000;
const WARM_STEPS = Math.round(WARM_WEEKS / DTW);

export const presetOf = (B: Bundle, wanted: string): Preset => {
  const ps = B.data.presets;
  const id = unretired(wanted);
  const p = ps.find((x) => x.id === id) ?? ps.find((x) => x.view === 'factory') ?? ps[0];
  if (!p) throw new Error(`use case ${B.data.id} has no presets`);
  return p;
};

export const startSpeedOf = (B: Bundle, id: string): number => presetOf(B, id).speed ?? DEFAULT_SPEED;

export interface RunOptions {
  readonly B: Bundle;
  readonly preset: string;
  readonly now: boolean;
  readonly clear?: boolean;
  readonly seed?: number;
  readonly s?: Settings;
}

export interface Aim {
  readonly at: number;
  readonly sampling: Sampler | null;
}

export class FactoryRun {
  readonly preset: Preset;
  warmLeft = 0;
  dropped = 0;
  private aimed: Aim | null = null;
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

  private loaded() {
    this.f.pile(startBacklogOf(this.bundle, this.preset, this.f.settings.reality));
  }

  get warming(): boolean {
    return this.warmLeft > 0;
  }

  get topology(): Topology {
    return this.f.topology;
  }

  get floor(): Floor {
    return this.f.floor;
  }

  get settings(): Settings {
    return this.f.settings;
  }

  get weeks(): number {
    return this.f.weeks;
  }

  get k(): number {
    return Math.round(this.f.weeks / DTW);
  }

  aim(to: Aim | null) {
    this.aimed = to;
  }

  get stopAt(): number | null {
    return this.aimed?.at ?? null;
  }

  get sampled(): readonly Values[] {
    return this.aimed?.sampling?.readings ?? [];
  }

  sampledMean(): Values {
    return this.aimed?.sampling?.mean() ?? {};
  }

  get arrived(): boolean {
    return this.stopAt !== null && !this.warming && this.k >= this.stopAt;
  }

  set(s: Settings) {
    this.f.set(s);
  }

  emit(id: string): boolean {
    return this.f.emit(id);
  }

  listen(fn: FloorListener | null) {
    this.f.listen(fn);
  }

  get warmProgress(): Snapshot['warming'] {
    return this.warming ? { day: Math.floor(this.f.weeks * DAYS), of: WARM_WEEKS * DAYS } : null;
  }

  read(o: ReadOptions = {}): Snapshot {
    return this.f.read({ ...o, warming: this.warmProgress, dropped: this.dropped });
  }

  private steps(n: number) {
    const k = this.k,
      s = this.aimed?.sampling;
    if (s) s.run(this.f, { k, n });
    else if (n > 0) this.f.step(n * DTW);
  }

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

  private stepDue() {
    const stop = this.stopAt ?? Infinity,
      room = stop - this.k;
    let n = 0;
    for (; this.acc >= DTW && n < MAX_STEPS && n < room; n++) this.acc -= DTW;
    this.steps(n);
    if (this.k >= stop) this.acc = 0;
  }

  runTo(k: number) {
    this.finishWarm();
    this.steps(k - this.k);
    this.acc = 0;
  }

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
