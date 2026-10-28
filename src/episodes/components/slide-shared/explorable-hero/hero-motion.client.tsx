'use client';

import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { isPlaying } from '@/episodes/lib/slide-zone.pure';
import { useResolvedTheme } from '@/shared/hooks/use-resolved-theme';
import { Pause, Play } from 'lucide-react';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from 'react';
import { mountDrift, type Drift } from './drift-canvas';
import { createClock, motionOf, type Motion, type Story } from './drift.pure';

/** The words on the pause button, in the page's language. */
export interface MotionLabels {
  readonly pause: string;
  readonly play: string;
  /** The button's title while reduced motion keeps the background still. */
  readonly stilled: string;
}

interface MotionState {
  readonly paused: boolean;
  readonly reduced: boolean;
  readonly labels: MotionLabels;
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

/** Holds the one pause state the background and its button share; renders no element of its own. */
export function HeroMotion({ labels, children }: { labels: MotionLabels; children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const value = { paused, reduced, labels, toggle: () => setPaused((was) => !was) };
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

/** The pause and play button: outside the decorative Backdrop, 44px, named in the page's language. */
export function HeroMotionButton() {
  const { paused, reduced, labels, toggle } = useMotionState();
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
      className="absolute top-[calc(var(--header-block)+0.75rem)] right-(--inset-r) z-10 grid size-11 place-items-center rounded-full border border-foreground/25 bg-(--tone-paper) text-foreground outline-offset-3 hover:border-foreground focus-visible:outline-3 focus-visible:outline-foreground disabled:opacity-60"
    >
      <Icon aria-hidden className="size-[18px] fill-current" />
    </button>
  );
}

/** What the loop shares with the mounted drift: the drift to draw and the timeline's seconds. */
interface Shared {
  drift: Drift | undefined;
  seconds: number;
}

/** Mounts the drift while the story, the theme or the reduced preference stand: the tokens are read once per mount. */
function useDrift(canvasRef: RefObject<HTMLCanvasElement | null>, story: Story, staticFrame: boolean) {
  const shared = useRef<Shared>({ drift: undefined, seconds: 0 });
  const theme = useResolvedTheme();
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>('[data-slide]');
    if (!canvas || !hero) return;
    const state = shared.current;
    state.drift = mountDrift(canvas, hero, { story, staticFrame, seconds: () => state.seconds });
    return () => {
      state.drift?.dispose();
      state.drift = undefined;
    };
  }, [canvasRef, story, theme, staticFrame]);
  return shared;
}

/** The loop: one frame request at a time, none unless the motion is running; a stop forgets the last frame. */
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

/** The art's canvas: Message drift for `story`, drawn behind the Slide and counted in the Slide's zone. */
export function HeroCanvas({ story }: { story: Story }) {
  const { paused, reduced } = useMotionState();
  const active = isPlaying(useSlideZone());
  const hidden = useDocumentHidden();
  const motion = motionOf({ reduced, paused, hidden, active });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useLoop(motion, useDrift(canvasRef, story, motion === 'reduced'));
  return <canvas ref={canvasRef} data-hero-motion={motion} className="absolute inset-0 size-full" />;
}
