'use client';

import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import type { Zone } from './ruler.pure';
import { onceAnimations, sceneMotionIn, type SceneMotion } from './scene-motion.pure';

interface SceneMotionProps {
  readonly className?: string;
  /** The Iceberg zone the Scene draws, a hook for its CSS; not the mount's `data-zone`. */
  readonly zone: Zone;
  /** The zone's colour tokens, set by `ZoneScene`. */
  readonly style?: CSSProperties;
  readonly children: ReactNode;
}

/** Each animation running in the Scene, with how often it repeats; an ambient loop repeats forever. */
function runningIn(scene: HTMLElement) {
  return scene
    .getAnimations({ subtree: true })
    .map((animation) => ({ animation, iterations: animation.effect?.getComputedTiming().iterations ?? 1 }));
}

/** `settled` once every once-animation started on entry has finished; a cancelled one counts as ended. */
function useSettle(scene: RefObject<HTMLDivElement | null>, start: SceneMotion) {
  const [settled, setSettled] = useState<'playing' | 'settled'>('playing');
  useEffect(() => {
    const element = scene.current;
    if (start !== 'playing' || element === null) return;
    let live = true;
    // One frame on: the mount's `[data-zone='active']` has applied, so the CSS animations exist.
    const frame = window.requestAnimationFrame(() => {
      const waited = onceAnimations(runningIn(element)).map(({ animation }) => animation.finished);
      void Promise.allSettled(waited).then(() => {
        if (live) setSettled('settled');
      });
    });
    return () => {
      live = false;
      window.cancelAnimationFrame(frame);
      // Leaving the active Slide: the next entry plays again and settles anew.
      setSettled('playing');
    };
  }, [scene, start]);
  return start === 'playing' ? settled : start;
}

/** True while the document is hidden: CSS alone cannot see a background tab. */
function useDocumentHidden() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const report = () => setHidden(document.visibilityState === 'hidden');
    report();
    document.addEventListener('visibilitychange', report);
    return () => document.removeEventListener('visibilitychange', report);
  }, []);
  return hidden;
}

/**
 * The client leaf of `ZoneScene` (design-ADR 0025, Motion 6): the Scene's root, reporting `data-motion` as `idle`,
 * `playing` or `settled` for browser checks, and `data-document="hidden"` so the zone's CSS pauses every ambient
 * loop in a background tab. Figures stay server components; this leaf only reads the animations they start.
 */
export function SceneMotionRoot({ className, zone, style, children }: SceneMotionProps) {
  const scene = useRef<HTMLDivElement>(null);
  const motion = useSettle(scene, sceneMotionIn(useSlideZone()));
  const hidden = useDocumentHidden();
  return (
    <div
      ref={scene}
      data-scene
      data-depth-zone={zone}
      data-motion={motion}
      data-document={hidden ? 'hidden' : undefined}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}
