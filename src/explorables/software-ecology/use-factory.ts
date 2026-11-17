// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
// decision: FE-009 §4
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';
import { layoutFactory, type FactoryLayout } from './factory-layout.pure.ts';
import type { Snapshot } from './factory-model.pure.ts';
import { FactoryPainter } from './factory-painter.ts';
import { SPEED_1X, type FactoryRun } from './factory-run.pure.ts';
import type { PileStyle } from './paint-pile.ts';
import type { Bundle } from './software-ecology.types';
import { usePlaying } from './use-playing.ts';
import { useReadouts, type Read } from './use-readouts.ts';
import { useRecolor } from './use-recolor.ts';
import { useRun, type FactoryControls } from './use-run.ts';

export type { FactoryControls };

const READ_SECS = 0.25;

export interface FactoryWords {
  readonly warming: (day: number, of: number) => string;
  readonly blocked: string;
}

export interface FactoryView {
  readonly run: FactoryRun;
  readonly layout: FactoryLayout;
  readonly snap: Snapshot;
  readonly stage: RefObject<HTMLDivElement | null>;
  readonly canvas: RefObject<HTMLCanvasElement | null>;
  readonly floor: RefObject<HTMLDivElement | null>;
  readonly controls: FactoryControls;
  readonly reduced: boolean;
  repaint(): void;
}

const placeFloor = (floor: HTMLDivElement | null, fit: { k: number; ox: number; oy: number }) => {
  if (!floor) return;
  const tf = `translate(${fit.ox}px, ${fit.oy}px) scale(${fit.k})`;
  if (floor.style.transform !== tf) floor.style.transform = tf;
};

const paint = (x: { v: Pick<FactoryView, 'stage' | 'canvas' | 'floor'>; painter: FactoryPainter; at: DrawAt }) => {
  const st = x.v.stage.current,
    cv = x.v.canvas.current,
    c = cv?.getContext('2d');
  if (!st || !cv || !c) return;
  const fit = x.painter.measure(cv, st.getBoundingClientRect(), window.devicePixelRatio);
  if (!fit) return;
  placeFloor(x.v.floor.current, fit);
  x.painter.draw(c, x.at);
};

type Painted = Pick<FactoryView, 'stage' | 'canvas' | 'floor'>;
type DrawAt = Parameters<FactoryPainter['draw']>[1];
interface Live {
  readonly flowing: boolean;
  readonly speed: number;
  readonly words: FactoryWords;
  readonly pile: PileStyle;
  readonly watch: readonly string[];
  readonly stream: readonly string[];
  readonly onFrame?: (run: FactoryRun) => void;
  readonly onDraw?: (run: FactoryRun, speed: number) => void;
}

const drawAt = (run: FactoryRun, x: { live: Live; reduced: boolean; now: number }): DrawAt => {
  const w = run.warmProgress;
  return {
    now: x.now,
    reduced: x.reduced,
    warming: w ? x.live.words.warming(w.day, w.of) : null,
    secsPerWeek: x.live.speed ? 1 / (x.live.speed * SPEED_1X) : 0,
    blocked: x.live.words.blocked,
    pile: x.live.pile,
  };
};

const show = (x: {
  run: FactoryRun;
  painter: FactoryPainter;
  v: Painted;
  live: Live;
  reduced: boolean;
  now: number;
}) => {
  paint({ v: x.v, painter: x.painter, at: drawAt(x.run, x) });
  x.live.onDraw?.(x.run, x.live.speed);
};

function useStill(x: {
  run: FactoryRun;
  painter: FactoryPainter;
  v: Painted;
  live: RefObject<Live>;
  playing: boolean;
  reduced: boolean;
  read: Read;
}) {
  const { run, painter, v, live, playing, reduced, read } = x;
  useEffect(() => {
    if (playing) return;
    if (reduced || document.hidden) run.finishWarm();
    if (!run.warming) run.listen(painter.listener);
    show({ run, painter, v, live: live.current, reduced, now: performance.now() });
    read(run);
  }, [playing, reduced, run, painter, v, live, read]);
}

function useLoop(x: {
  run: FactoryRun;
  painter: FactoryPainter;
  v: Painted;
  live: RefObject<Live>;
  playing: boolean;
  read: Read;
}) {
  const { run, painter, v, live, playing, read } = x;
  useEffect(() => {
    if (!playing) return;
    if (!run.warming) run.listen(painter.listener);
    let [raf, last, slow, ticks] = [0, 0, 0, 0];
    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      if ((live.current.flowing || run.warming) && run.advance(dt, live.current.speed)) run.listen(painter.listener);
      live.current.onFrame?.(run);
      show({ run, painter, v, live: live.current, reduced: false, now });
      slow += dt;
      if (slow > READ_SECS) {
        slow = 0;
        read(run, ++ticks % 2 === 0);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, run, painter, v, live, read]);
}

function useLive(now: Live): RefObject<Live> {
  const live = useRef<Live>(now);
  useEffect(() => {
    live.current = now;
  });
  return live;
}

export interface FactoryOptions {
  readonly B: Bundle;
  readonly preset: string;
  readonly words: FactoryWords;
  readonly pile?: PileStyle;
  readonly flowing?: boolean;
  readonly watch?: readonly string[];
  readonly stream?: readonly string[];
  readonly onFrame?: (run: FactoryRun) => void;
  readonly onDraw?: (run: FactoryRun, speed: number) => void;
}

export function useFactory(x: FactoryOptions): FactoryView {
  const v = useViews(),
    { stage, canvas, floor } = v;
  const { playing, reduced } = usePlaying(stage);
  const { run, controls: base } = useRun({ B: x.B, preset: x.preset, reduced });
  const live = useLive({ ...liveOf(x), speed: base.speed });
  const { snap, read } = useReadouts(run, live, `${x.watch?.join()}|${x.stream?.join()}`);
  const layout = useMemo(() => layoutFactory(run.topology), [run]);
  const painter = useMemo(() => new FactoryPainter(run.floor, layout), [run, layout]);
  const controls = withRead(base, () => read(run));
  useStill({ run, painter, v, live, playing, reduced, read });
  useLoop({ run, painter, v, live, playing, read });
  const repaint = useCallback(() => {
    if (!run.warming) run.listen(painter.listener);
    show({ run, painter, v, live: live.current, reduced, now: performance.now() });
  }, [run, painter, v, reduced, live]);
  useRecolor(painter, repaint);
  return { run, layout, snap, stage, canvas, floor, controls, reduced, repaint };
}

const NONE: readonly string[] = [];

const liveOf = (x: FactoryOptions) => ({
  watch: x.watch ?? NONE,
  stream: x.stream ?? NONE,
  flowing: x.flowing ?? true,
  words: x.words,
  pile: x.pile ?? 'heap',
  onFrame: x.onFrame,
  onDraw: x.onDraw,
});

function useViews() {
  const stage = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    floor = useRef<HTMLDivElement>(null);
  return useMemo(() => ({ stage, canvas, floor }), []);
}

const withRead = (base: FactoryControls, reread: () => void): FactoryControls => ({
  ...base,
  setSettings: (n) => {
    base.setSettings(n);
    reread();
  },
  emit: (id) => {
    base.emit(id);
    reread();
  },
});
