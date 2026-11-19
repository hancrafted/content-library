'use client';

import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { isPlaying } from '@/episodes/lib/slide-zone.pure';
import { useResolvedTheme } from '@/shared/hooks/use-resolved-theme';
import { Pause, Play } from 'lucide-react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from 'react';
import { mountDrift, type Drift } from './drift-canvas';
import { createClock, FIELD_INK, motionOf, type Motion, type Story } from './drift.pure';

export interface MotionLabels {
  readonly pause: string;
  readonly play: string;
  readonly stilled: string;
}

interface MotionState {
  readonly paused: boolean;
  readonly reduced: boolean;
  readonly toggle: () => void;
}

const MotionContext = createContext<MotionState | null>(null);

function useMotionState(): MotionState {
  const state = useContext(MotionContext);
  if (state === null) throw new Error('The hero background and its button belong inside <HeroMotion>.');
  return state;
}

const REDUCED = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

function useDocumentHidden(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange);
      return () => document.removeEventListener('visibilitychange', onChange);
    },
    () => document.hidden,
    () => false,
  );
}

export function HeroMotion({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const value = { paused, reduced, toggle: () => setPaused((was) => !was) };
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function HeroMotionButton({ labels }: { labels: MotionLabels }) {
  const { paused, reduced, toggle } = useMotionState();
  const stopped = paused || reduced;
  const name = stopped ? labels.play : labels.pause;
  const Icon = stopped ? Play : Pause;
  return (
    <button
      type="button"
      data-hero-motion-button
      aria-label={name}
      aria-pressed={stopped}
      title={reduced ? labels.stilled : name}
      disabled={reduced}
      onClick={toggle}
      className="absolute top-[calc(var(--header-block)+0.75rem)] right-(--inset-r) z-10 grid size-11 place-items-center rounded-full border border-foreground/25 bg-background text-foreground outline-offset-3 hover:border-foreground focus-visible:outline-3 focus-visible:outline-foreground disabled:opacity-60"
    >
      <Icon aria-hidden className="size-[18px] fill-current" />
    </button>
  );
}

interface CanvasRefs {
  readonly beat: RefObject<HTMLCanvasElement | null>;
  readonly field: RefObject<HTMLCanvasElement | null>;
  readonly soft: RefObject<HTMLCanvasElement | null>;
}

interface Shared {
  drift: Drift | undefined;
  seconds: number;
}

function useDrift(refs: CanvasRefs, story: Story, staticFrame: boolean) {
  const shared = useRef<Shared>({ drift: undefined, seconds: 0 });
  const theme = useResolvedTheme();
  useEffect(() => {
    const beat = refs.beat.current;
    const field = refs.field.current;
    const soft = refs.soft.current;
    const hero = beat?.closest<HTMLElement>('[data-slide]');
    if (!beat || !field || !soft || !hero) return;
    const state = shared.current;
    state.drift = mountDrift({ beat, field, soft }, hero, { story, staticFrame, seconds: () => state.seconds });
    return () => {
      state.drift?.dispose();
      state.drift = undefined;
    };
  }, [refs, story, theme, staticFrame]);
  return shared;
}

function useLoop(motion: Motion, shared: RefObject<Shared>) {
  const clockRef = useRef(createClock());
  useEffect(() => {
    if (motion !== 'running') return;
    const clock = clockRef.current;
    const state = shared.current;
    let frame = 0;
    const tick = (now: number) => {
      state.seconds = clock.tick(now);
      state.drift?.draw();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clock.stop();
    };
  }, [motion, shared]);
}

export function HeroCanvas({ story }: { story: Story }) {
  const { paused, reduced } = useMotionState();
  const active = isPlaying(useSlideZone());
  const hidden = useDocumentHidden();
  const motion = motionOf({ reduced, paused, hidden, active });
  const beat = useRef<HTMLCanvasElement>(null);
  const field = useRef<HTMLCanvasElement>(null);
  const soft = useRef<HTMLCanvasElement>(null);
  const refs = useMemo(() => ({ beat, field, soft }), []);
  useLoop(motion, useDrift(refs, story, motion === 'reduced'));
  return (
    <>
      <canvas
        ref={field}
        aria-hidden
        style={{ opacity: FIELD_INK }}
        className="absolute inset-x-0 top-0 h-[min(100%,100svh)] w-full"
      />
      <canvas
        ref={soft}
        aria-hidden
        style={{ opacity: FIELD_INK }}
        className="absolute inset-x-0 top-0 h-[min(100%,100svh)] w-full blur-[1px] lg:blur-[2.5px]"
      />
      <canvas ref={beat} data-hero-motion={motion} className="absolute inset-x-0 top-0 h-[min(100%,100svh)] w-full" />
    </>
  );
}
