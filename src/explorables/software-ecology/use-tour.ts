// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
// decision: FE-001 §1
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FactoryRun } from './factory-run.pure.ts';
import {
  backTour,
  nextTour,
  settleTour,
  startTour,
  tickTour,
  TOUR_SPEED,
  type Tour,
  type TourRun,
} from './factory-tour.pure.ts';
import type { Bundle } from './software-ecology.types';
import type { FactoryView } from './use-factory.ts';

export interface TourActions {
  readonly tour: Tour | null;
  readonly run: FactoryRun | null;
  start(id: string): void;
  next(): void;
  back(): void;
  end(): void;
}

type Speed = (n: number) => void;

const speedOf = (t: Tour) => (t.phase === 'show' ? 0 : TOUR_SPEED);

export function useTourState() {
  const [cur, setCur] = useState<TourRun | null>(null);
  const ref = useRef<TourRun | null>(null),
    speed = useRef<Speed | null>(null);
  const set = useCallback((x: TourRun | null) => {
    ref.current = x;
    setCur(x);
  }, []);
  const onFrame = useCallback(
    (run: FactoryRun) => {
      const c = ref.current;
      if (!c || c.run !== run) return;
      const t = tickTour(run, c.tour);
      if (t === c.tour) return;
      set({ run, tour: t });
      if (t.phase !== c.tour.phase) speed.current?.(speedOf(t));
    },
    [set],
  );
  return { cur, set, ref, speed, onFrame };
}

type TourState = ReturnType<typeof useTourState>;

function useEscape(on: boolean, end: () => void) {
  const again = useRef(end);
  useEffect(() => {
    again.current = end;
  });
  useEffect(() => {
    if (!on) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      again.current();
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [on]);
}

interface Ctx {
  readonly B: Bundle;
  readonly f: FactoryView;
  readonly s: TourState;
  readonly active: TourRun | null;
}

const show = ({ f, s }: Ctx, x: TourRun) => {
  const tour = f.reduced ? settleTour(x.run, x.tour) : x.tour;
  s.set({ run: x.run, tour });
  f.controls.setSpeed(speedOf(tour));
};

const endOf = (x: Ctx) => () => {
  if (!x.active) return;
  x.active.run.aim(null);
  x.s.set(null);
  x.f.controls.setSpeed(x.active.tour.userSpeed);
};

const actionsOf = (x: Ctx, end: () => void): Omit<TourActions, 'tour' | 'run' | 'end'> => {
  const { active, f } = x,
    c = f.controls;
  return {
    start: (id) => {
      const r = startTour(x.B, id, { userSpeed: active?.tour.userSpeed ?? c.speed });
      if (!r) return;
      c.adopt(r.run);
      show(x, r);
    },
    next: () => {
      if (!active) return;
      const t = nextTour(active.run, active.tour);
      if (t) show(x, { run: active.run, tour: t });
      else end();
    },
    back: () => {
      if (!active || active.tour.i === 0) return;
      const r = backTour(x.B, active.tour);
      c.adopt(r.run);
      x.s.set(r);
      c.setSpeed(0);
    },
  };
};

export function useTour(B: Bundle, f: FactoryView, s: TourState): TourActions {
  const setSpeed = f.controls.setSpeed;
  useEffect(() => {
    s.speed.current = setSpeed;
  });
  const active = s.cur && s.cur.run === f.run ? s.cur : null;
  const x: Ctx = { B, f, s, active },
    end = endOf(x);
  useEscape(!!active, end);
  return { tour: active?.tour ?? null, run: active?.run ?? null, ...actionsOf(x, end), end };
}
