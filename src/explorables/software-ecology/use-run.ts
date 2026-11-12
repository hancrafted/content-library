/*
 * The run the factory shows and the controls that change it (design-ADR 0024 §1, §14): a state, Clear and a new use
 * case build a new run; a dial, the Model or the Customer write new settings the running model reads on its next step.
 * A new company resizes the line, so it builds a new run, as does any change under reduced motion, where the still
 * frame must show the settled model. Reached only through `useFactory`.
 */
import { useState } from 'react';
import { FactoryRun, presetOf, startSpeedOf } from './factory-run.pure.ts';
import { pageSettings, useCaseSettings } from './factory-settings.pure.ts';
import type { Bundle, Settings } from './software-ecology.types';

export interface FactoryControls {
  readonly preset: string;
  readonly speed: number;
  /** The settings the run reads now. */
  readonly settings: Settings;
  setPreset(id: string): void;
  setSpeed(n: number): void;
  /** A live change: the run reads `next` from its next step on. */
  setSettings(next: Settings): void;
  clear(): void;
  /** Reset to default: the settings and speed the use-case file defines for the active state; the modified dot goes. */
  reset(d: { readonly s: Settings; readonly speed: number }): void;
  /** A dial was turned since the state was picked (feature guide, Interaction 1). */
  readonly modified: boolean;
  /** Shows a run made elsewhere: a tour's start, or its Back. */
  adopt(run: FactoryRun): void;
  /** A new run from an uploaded file: its use case, its state, the settings and speed it was saved at. */
  load(B: Bundle, x: { readonly preset: string; readonly s: Settings; readonly speed: number }): void;
}

interface RunState {
  readonly B: Bundle;
  readonly run: FactoryRun;
}

const fresh = (B: Bundle, preset: string, o: { s: Settings; clear?: boolean }): RunState => ({
  B,
  run: new FactoryRun({ B, preset, now: false, clear: o.clear ?? false, s: o.s }),
});

/** On a new use case: the same state if it has one, its own company and strengths. */
const forUseCase = (B: Bundle, was: RunState): RunState => {
  const p = presetOf(B, was.run.preset.id);
  return fresh(B, p.id, { s: useCaseSettings(B, p, was.run.settings) });
};

interface Setters {
  readonly setSt: (s: RunState) => void;
  readonly setSpeed: (n: number) => void;
  readonly seen: (s: Settings) => void;
  readonly setModified: (m: boolean) => void;
  readonly modified: boolean;
  readonly reduced: boolean;
}

/** A run from an uploaded file, at the speed it was saved at. */
const loadWith =
  (x: Setters): FactoryControls['load'] =>
  (B, o) => {
    x.setModified(false);
    x.setSpeed(o.speed);
    x.setSt(fresh(B, o.preset, { s: o.s }));
  };

/** Reset to default: the file's settings and speed for the active state; the modified dot goes. */
const resetWith =
  (x: Setters, at: { B: Bundle; id: string }): FactoryControls['reset'] =>
  (d) => {
    x.setSpeed(d.speed);
    x.setModified(false);
    x.setSt(fresh(at.B, at.id, { s: d.s }));
  };

const controlsOf = (cur: RunState, speed: number, x: Setters): FactoryControls => {
  const { run, B } = cur;
  return {
    preset: run.preset.id,
    speed,
    settings: run.settings,
    modified: x.modified,
    setPreset: (id) => {
      const p = presetOf(B, id);
      if (p.speed) x.setSpeed(p.speed);
      x.setModified(false);
      x.setSt(fresh(B, p.id, { s: pageSettings(B, p, run.settings) }));
    },
    setSpeed: x.setSpeed,
    setSettings: (next) => {
      x.setModified(true);
      if (x.reduced || next.company !== run.settings.company) return x.setSt(fresh(B, run.preset.id, { s: next }));
      run.set(next);
      x.seen(next);
    },
    reset: resetWith(x, { B, id: run.preset.id }),
    clear: () => x.setSt(fresh(B, run.preset.id, { s: run.settings, clear: true })),
    adopt: (next) => {
      x.setModified(false);
      x.setSt({ B, run: next });
    },
    load: loadWith(x),
  };
};

export function useRun(x: { B: Bundle; preset: string; reduced: boolean }) {
  const [st, setSt] = useState(() => fresh(x.B, x.preset, { s: pageSettings(x.B, presetOf(x.B, x.preset), null) }));
  const [speed, setSpeed] = useState(() => startSpeedOf(x.B, x.preset));
  const [, seen] = useState<Settings | null>(null);
  const [modified, setModified] = useState(false);
  let cur = st;
  if (st.B !== x.B) {
    cur = forUseCase(x.B, st);
    setSt(cur);
    setModified(false);
  }
  return {
    run: cur.run,
    controls: controlsOf(cur, speed, { setSt, setSpeed, seen, setModified, modified, reduced: x.reduced }),
  };
}
