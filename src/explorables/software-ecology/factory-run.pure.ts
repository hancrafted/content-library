/*
 * One run of the factory in time (design-ADR 0024 §14): a model built from a use case and a preset, warmed 60 weeks
 * in chunks behind "Warming up" unless the preset starts clear, then driven by real time at the chosen speed. A late
 * frame drops time instead of spiralling. No DOM: the hook drives it and the painter draws it. Ported from the
 * reference build's `rebuild`, `clearFactory` and `frame`.
 */
import { DTW, startSettings, WARM_WEEKS } from './factory-dials.pure.ts';
import { buildFactory } from './factory-model.pure.ts';
import { step } from './factory-step.pure.ts';
import type { Factory } from './factory.types';
import type { Bundle, Preset, Settings } from './software-ecology.types';

/** Weeks a real second at 1×; 5× (the default) plays a working day in about 0.6 s. */
export const SPEED_1X = 1 / 16;
export const SPEEDS = [0, 1, 2, 5, 10] as const;
export const DEFAULT_SPEED = 5;
/** Model steps a frame at most; beyond that the frame drops time. */
export const MAX_STEPS = 40;
/** Warm-up steps a frame. */
export const WARM_CHUNK = 2000;
const WARM_STEPS = Math.round(WARM_WEEKS / DTW);

export const presetOf = (B: Bundle, id: string): Preset => {
  const ps = B.data.presets;
  const p = ps.find((x) => x.id === id) ?? ps.find((x) => x.view === 'factory') ?? ps[0];
  if (!p) throw new Error(`use case ${B.data.id} has no presets`);
  return p;
};

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
  readonly m: Factory;
  readonly preset: Preset;
  warmLeft = 0;
  dropped = 0;
  private acc = 0;

  constructor(o: RunOptions) {
    this.preset = presetOf(o.B, o.preset);
    this.m = buildFactory(o.B, { s: o.s ?? startSettings(o.B, this.preset), seed: o.seed });
    if (o.clear || this.preset.start === 'clear') return;
    this.warmLeft = WARM_STEPS;
    if (o.now) this.finishWarm();
  }

  get warming(): boolean {
    return this.warmLeft > 0;
  }

  /** Warms the rest at once. */
  finishWarm() {
    for (; this.warmLeft > 0; this.warmLeft--) step(this.m);
  }

  private warmChunk() {
    const n = Math.min(WARM_CHUNK, this.warmLeft);
    for (let i = 0; i < n; i++) step(this.m);
    this.warmLeft -= n;
    this.acc = 0;
  }

  /** Advances by `dt` real seconds at `speed`; returns true when warm-up just ended. */
  advance(dt: number, speed: number): boolean {
    if (this.warming) {
      this.warmChunk();
      return !this.warming;
    }
    this.acc += dt * speed * SPEED_1X;
    let n = 0;
    for (; this.acc >= DTW && n < MAX_STEPS; n++) {
      step(this.m);
      this.acc -= DTW;
    }
    if (this.acc >= DTW) {
      this.dropped = Math.min(5, this.dropped + 1);
      this.acc = 0;
    } else if (this.dropped) this.dropped *= 0.995;
    return false;
  }
}
