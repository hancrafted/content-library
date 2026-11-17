'use client';

import { useArtLoader } from '@/episodes/hooks/use-art-loader';
import { useArtLoads, useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { onceAnimations, sceneMotionIn, type SceneMotion } from './scene-motion.pure';
import type { Zone } from './zones.pure';

interface SceneMotionProps {
  readonly className?: string;
  readonly zone: Zone;
  readonly style?: CSSProperties;
  readonly children: ReactNode;
}

function runningIn(scene: HTMLElement) {
  return scene
    .getAnimations({ subtree: true })
    .map((animation) => ({ animation, iterations: animation.effect?.getComputedTiming().iterations ?? 1 }));
}

function useSettle(scene: RefObject<HTMLDivElement | null>, start: SceneMotion) {
  const [settled, setSettled] = useState<'playing' | 'settled'>('playing');
  useEffect(() => {
    const element = scene.current;
    if (start !== 'playing' || element === null) return;
    let live = true;
    const frame = window.requestAnimationFrame(() => {
      const waited = onceAnimations(runningIn(element)).map(({ animation }) => animation.finished);
      void Promise.allSettled(waited).then(() => {
        if (live) setSettled('settled');
      });
    });
    return () => {
      live = false;
      window.cancelAnimationFrame(frame);
      setSettled('playing');
    };
  }, [scene, start]);
  return start === 'playing' ? settled : start;
}

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

// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
// decision: FE-009 §4
export function SceneMotionRoot({ className, zone, style, children }: SceneMotionProps) {
  const scene = useRef<HTMLDivElement>(null);
  const slideZone = useSlideZone();
  const motion = useSettle(scene, sceneMotionIn(slideZone));
  const hidden = useDocumentHidden();
  useArtLoader(scene, useArtLoads());
  return (
    <div
      ref={scene}
      data-scene
      data-art-root
      data-depth-zone={zone}
      data-zone={slideZone}
      data-motion={motion}
      data-document={hidden ? 'hidden' : undefined}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}
