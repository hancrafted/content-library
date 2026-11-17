// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
// spec: docs/features/explorables/software-ecology.md#interaction
import { useState } from 'react';
import { FactoryRun, presetOf, startSpeedOf } from './factory-run.pure.ts';
import { pageSettings, useCaseSettings } from './factory-settings.pure.ts';
import type { Bundle, Settings } from './software-ecology.types';

export interface FactoryControls {
  readonly preset: string;
  readonly speed: number;
  readonly settings: Settings;
  setPreset(id: string): void;
  setSpeed(n: number): void;
  setSettings(next: Settings): void;
  emit(id: string): void;
  clear(): void;
  reset(d: { readonly s: Settings; readonly speed: number }): void;
  readonly modified: boolean;
  adopt(run: FactoryRun): void;
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

const loadWith =
  (x: Setters): FactoryControls['load'] =>
  (B, o) => {
    x.setModified(false);
    x.setSpeed(o.speed);
    x.setSt(fresh(B, o.preset, { s: o.s }));
  };

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
    emit: (id) => void run.emit(id),
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
