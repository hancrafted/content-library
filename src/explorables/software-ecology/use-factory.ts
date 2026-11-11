/*
 * Runs the factory in the browser (design-ADR 0024 §14): builds a run for the use case and preset, warms it behind
 * "Warming up", drives it by real time at the chosen speed and paints every frame; the DOM readouts follow four times a
 * second. It pauses outside the active Slide (the Slide mount's `data-zone`, FE-009), on a hidden page and under
 * reduced motion, where it warms at once and shows one steady frame. Reached only from the Explorable's client leaf.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { layoutFactory, type FactoryLayout } from './factory-layout.pure.ts';
import { FactoryPainter } from './factory-painter.ts';
import { DEFAULT_SPEED, FactoryRun, presetOf, SPEED_1X } from './factory-run.pure.ts';
import type { PileStyle } from './paint-pile.ts';
import { snapshotOf, snapshotWarm, type Snapshot } from './run-snapshot.pure.ts';
import type { Bundle } from './software-ecology.types';
import { usePlaying } from './use-playing.ts';

const READ_SECS = 0.25;

export interface FactoryWords {
  /** "Warming up · day {day} of {of}", filled. */
  readonly warming: (day: number, of: number) => string;
  readonly blocked: string;
}

export interface FactoryControls {
  readonly preset: string;
  readonly speed: number;
  setPreset(id: string): void;
  setSpeed(n: number): void;
  clear(): void;
}

export interface FactoryView {
  readonly run: FactoryRun;
  readonly layout: FactoryLayout;
  readonly snap: Snapshot;
  readonly stage: RefObject<HTMLDivElement | null>;
  readonly canvas: RefObject<HTMLCanvasElement | null>;
  readonly floor: RefObject<HTMLDivElement | null>;
  readonly controls: FactoryControls;
  /** Places the floor on the stage and paints one frame now: after a switch into the factory view. */
  repaint(): void;
}

interface Build {
  readonly preset: string;
  readonly clear: boolean;
  readonly n: number;
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
}

/** The run, rebuilt on a preset or Clear, and the controls that rebuild it. */
function useRun(B: Bundle, preset: string): { run: FactoryRun; controls: FactoryControls } {
  const [build, setBuild] = useState<Build>({ preset, clear: false, n: 0 });
  const [speed, setSpeed] = useState(() => presetOf(B, preset).speed ?? DEFAULT_SPEED);
  const run = useMemo(() => new FactoryRun({ B, preset: build.preset, now: false, clear: build.clear }), [B, build]);
  const controls = useMemo<FactoryControls>(
    () => ({
      preset: run.preset.id,
      speed,
      setPreset: (id) => {
        const p = presetOf(B, id);
        if (p.speed) setSpeed(p.speed);
        setBuild((b) => ({ preset: p.id, clear: false, n: b.n + 1 }));
      },
      setSpeed,
      clear: () => setBuild((b) => ({ ...b, clear: true, n: b.n + 1 })),
    }),
    [run, speed, B],
  );
  return { run, controls };
}

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
  read: (s: Snapshot) => void;
}) {
  const { run, painter, v, live, playing, reduced, read } = x;
  useEffect(() => {
    if (playing) return;
    if (reduced || document.hidden) run.finishWarm();
    if (!run.warming) painter.attach();
    paint({ v, painter, at: drawAt(run, { live: live.current, reduced, now: performance.now() }) });
    read(snapshotOf(run));
  }, [playing, reduced, run, painter, v, live, read]);
}

/** In the active Slide: every frame advances the run and paints; the readouts follow four times a second. */
function useLoop(x: {
  run: FactoryRun;
  painter: FactoryPainter;
  v: Painted;
  live: RefObject<Live>;
  playing: boolean;
  read: (s: Snapshot) => void;
}) {
  const { run, painter, v, live, playing, read } = x;
  useEffect(() => {
    if (!playing) return;
    if (!run.warming) painter.attach();
    let [raf, last, slow] = [0, 0, 0];
    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      if ((live.current.flowing || run.warming) && run.advance(dt, live.current.speed)) painter.attach();
      paint({ v, painter, at: drawAt(run, { live: live.current, reduced: false, now }) });
      slow += dt;
      if (slow > READ_SECS) {
        slow = 0;
        read(snapshotOf(run));
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

export function useFactory(x: {
  B: Bundle;
  preset: string;
  words: FactoryWords;
  pile?: PileStyle;
  /** False in Swing and Roles: the model only finishes warming. */
  flowing?: boolean;
}): FactoryView {
  const { run, controls } = useRun(x.B, x.preset);
  const layout = useMemo(() => layoutFactory(run.m), [run]);
  const painter = useMemo(() => new FactoryPainter(run.m, layout), [run, layout]);
  const [snap, setSnap] = useState(() => snapshotOf(run));
  const stage = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    floor = useRef<HTMLDivElement>(null);
  const v = useMemo(() => ({ stage, canvas, floor }), []);
  const { playing, reduced } = usePlaying(stage);
  const live = useLive({ flowing: x.flowing ?? true, speed: controls.speed, words: x.words, pile: x.pile ?? 'heap' });
  useStill({ run, painter, v, live, playing, reduced, read: setSnap });
  useLoop({ run, painter, v, live, playing, read: setSnap });
  const repaint = useCallback(() => {
    if (!run.warming) painter.attach();
    paint({ v, painter, at: drawAt(run, { live: live.current, reduced, now: performance.now() }) });
  }, [run, painter, v, reduced]);
  useRecolor(painter, repaint);
  return { run, layout, snap, stage, canvas, floor, controls, repaint };
}

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
