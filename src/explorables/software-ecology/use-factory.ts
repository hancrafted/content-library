/*
 * Runs the factory in the browser (design-ADR 0024 §14): builds a run for the use case and preset, warms it behind
 * "Warming up", drives it by real time at the chosen speed and paints every frame; the DOM readouts follow four times a
 * second. It pauses outside the active Slide (the Slide mount's `data-zone`, FE-009), on a hidden page and under
 * reduced motion, where it warms at once and shows one steady frame. Reached only from the Explorable's client leaf.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { layoutFactory, type FactoryLayout } from './factory-layout.pure.ts';
import { FactoryPainter } from './factory-painter.ts';
import { SPEED_1X, type FactoryRun } from './factory-run.pure.ts';
import type { PileStyle } from './paint-pile.ts';
import { snapshotOf, snapshotWarm, type Snapshot } from './run-snapshot.pure.ts';
import type { Bundle } from './software-ecology.types';
import { usePlaying } from './use-playing.ts';
import { useRun, type FactoryControls } from './use-run.ts';

export type { FactoryControls };

const READ_SECS = 0.25;

export interface FactoryWords {
  /** "Warming up · day {day} of {of}", filled. */
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
  /** Reduced motion: one steady frame, no frame loop. */
  readonly reduced: boolean;
  /** Places the floor on the stage and paints one frame now: after a switch into the factory view. */
  repaint(): void;
}

const placeFloor = (floor: HTMLDivElement | null, fit: { k: number; ox: number; oy: number }) => {
  if (!floor) return;
  const tf = `translate(${fit.ox}px, ${fit.oy}px) scale(${fit.k})`;
  if (floor.style.transform !== tf) floor.style.transform = tf;
};

/** Paints one frame, sizing the canvas to its stage first. */
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
  /** The factory view is shown: time runs. In Swing and Roles only the warm-up runs, as in the reference build. */
  readonly flowing: boolean;
  readonly speed: number;
  readonly words: FactoryWords;
  readonly pile: PileStyle;
  /** The dashboards on show, read with every readout. */
  readonly watch: readonly string[];
  /** Called after every frame's advance: a tour step stops here. */
  readonly onFrame?: (run: FactoryRun) => void;
}

/** Reads the run into React: the readouts, and the dashboards on show; charts only when asked. */
type Read = (run: FactoryRun, charts?: boolean) => void;

const drawAt = (run: FactoryRun, x: { live: Live; reduced: boolean; now: number }): DrawAt => {
  const w = snapshotWarm(run);
  return {
    now: x.now,
    reduced: x.reduced,
    warming: w ? x.live.words.warming(w.day, w.of) : null,
    secsPerWeek: x.live.speed ? 1 / (x.live.speed * SPEED_1X) : 0,
    blocked: x.live.words.blocked,
    pile: x.live.pile,
  };
};

/** Outside the active Slide or under reduced motion: one steady frame, warmed at once when it must be still. */
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
    if (!run.warming) painter.attach();
    paint({ v, painter, at: drawAt(run, { live: live.current, reduced, now: performance.now() }) });
    read(run);
  }, [playing, reduced, run, painter, v, live, read]);
}

/** In the active Slide: every frame advances the run and paints; the readouts follow four times a second. */
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
    if (!run.warming) painter.attach();
    let [raf, last, slow, ticks] = [0, 0, 0, 0];
    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      if ((live.current.flowing || run.warming) && run.advance(dt, live.current.speed)) painter.attach();
      live.current.onFrame?.(run);
      paint({ v, painter, at: drawAt(run, { live: live.current, reduced: false, now }) });
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

/** The settings the frame loop reads every frame, kept current without restarting it. */
function useLive(now: Live): RefObject<Live> {
  const live = useRef<Live>(now);
  useEffect(() => {
    live.current = now;
  });
  return live;
}

/** The readouts in React state, and the one way to refresh them; a new watch list reads at once. */
function useReadouts(run: FactoryRun, live: RefObject<Live>, watchKey: string) {
  const [snap, setSnap] = useState(() => snapshotOf(run));
  const read = useCallback<Read>(
    (r, charts = true) => setSnap((prev) => snapshotOf(r, { watch: live.current.watch, charts, prev })),
    [live],
  );
  useEffect(() => read(run), [read, run, watchKey]);
  return { snap, read };
}

export function useFactory(x: {
  B: Bundle;
  preset: string;
  words: FactoryWords;
  pile?: PileStyle;
  /** False in Swing and Roles: the model only finishes warming. */
  flowing?: boolean;
  /** Work centers (or `customer`) whose dashboards are on show. */
  watch?: readonly string[];
  onFrame?: (run: FactoryRun) => void;
}): FactoryView {
  const v = useViews(),
    { stage, canvas, floor } = v;
  const { playing, reduced } = usePlaying(stage);
  const { run, controls: base } = useRun({ B: x.B, preset: x.preset, reduced });
  const watch = x.watch ?? NONE;
  const live = useLive({ ...liveOf(x), speed: base.speed, watch });
  const { snap, read } = useReadouts(run, live, watch.join());
  const layout = useMemo(() => layoutFactory(run.m), [run]);
  const painter = useMemo(() => new FactoryPainter(run.m, layout), [run, layout]);
  const controls = withRead(base, () => read(run));
  useStill({ run, painter, v, live, playing, reduced, read });
  useLoop({ run, painter, v, live, playing, read });
  const repaint = useCallback(() => {
    if (!run.warming) painter.attach();
    paint({ v, painter, at: drawAt(run, { live: live.current, reduced, now: performance.now() }) });
  }, [run, painter, v, reduced, live]);
  useRecolor(painter, repaint);
  return { run, layout, snap, stage, canvas, floor, controls, reduced, repaint };
}

const NONE: readonly string[] = [];

const liveOf = (x: {
  flowing?: boolean;
  words: FactoryWords;
  pile?: PileStyle;
  onFrame?: (run: FactoryRun) => void;
}) => ({
  flowing: x.flowing ?? true,
  words: x.words,
  pile: x.pile ?? 'heap',
  onFrame: x.onFrame,
});

function useViews() {
  const stage = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    floor = useRef<HTMLDivElement>(null);
  return useMemo(() => ({ stage, canvas, floor }), []);
}

/** A dial turned while paused shows at once: the readouts re-read after every settings change. */
const withRead = (base: FactoryControls, reread: () => void): FactoryControls => ({
  ...base,
  setSettings: (n) => {
    base.setSettings(n);
    reread();
  },
});

/** Re-reads the token colours when the theme flips, and repaints. */
function useRecolor(painter: FactoryPainter, repaint: () => void) {
  const again = useRef(repaint);
  useEffect(() => {
    again.current = repaint;
  });
  useEffect(() => {
    const mo = new MutationObserver(() => {
      painter.recolor();
      again.current();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, [painter]);
}
