'use client';

import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import styles from './figure-gallery.module.css';

export interface GalleryMotionLabels {
  readonly pause: string;
  readonly resume: string;
  readonly replay: string;
}

interface Playback {
  readonly active: boolean;
  readonly replay: number;
  readonly paused: boolean;
}

interface GalleryMotionProps {
  readonly labels: GalleryMotionLabels;
  readonly children: ReactNode;
}

interface MotionControlsProps {
  readonly labels: GalleryMotionLabels;
  readonly paused: boolean;
  readonly onPause: () => void;
  readonly onReplay: () => void;
}

function useDocumentHidden() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const report = () => setHidden(document.hidden);
    report();
    document.addEventListener('visibilitychange', report);
    return () => document.removeEventListener('visibilitychange', report);
  }, []);
  return hidden;
}

function useGallerySettle(ref: RefObject<HTMLDivElement | null>, { active, replay, paused }: Playback) {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!active || paused) return;
    let live = true;
    const frame = requestAnimationFrame(() => {
      const animations = ref.current?.getAnimations({ subtree: true }) ?? [];
      const once = animations.filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);
      void Promise.allSettled(once.map((animation) => animation.finished)).then(() => {
        if (live) setSettled(true);
      });
    });
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      setSettled(false);
    };
  }, [ref, active, replay, paused]);
  return settled;
}

/** Template-only controls; replay and pause are transient, and never change the page's active Slide. */
export function GalleryMotion({ labels, children }: GalleryMotionProps) {
  const [paused, setPaused] = useState(false);
  const [replay, setReplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const active = useSlideZone() === 'active';
  const hidden = useDocumentHidden();
  const settled = useGallerySettle(ref, { active, replay, paused });
  const motion = paused ? 'paused' : !active ? 'idle' : settled ? 'settled' : 'playing';
  return (
    <div
      className={styles.gallery}
      data-gallery-motion={motion}
      data-document={hidden ? 'hidden' : undefined}
      data-gallery-paused={paused}
    >
      <MotionControls
        labels={labels}
        paused={paused}
        onPause={() => setPaused(!paused)}
        onReplay={() => {
          setPaused(false);
          setReplay(replay + 1);
        }}
      />
      <div ref={ref} key={replay} data-gallery-content>
        {children}
      </div>
    </div>
  );
}

function MotionControls({ labels, paused, onPause, onReplay }: MotionControlsProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-3 print:hidden">
      <button
        type="button"
        aria-pressed={paused}
        onClick={onPause}
        className="min-h-11 rounded-lg border border-border bg-card px-4 py-2 text-caption font-medium"
      >
        {paused ? labels.resume : labels.pause}
      </button>
      <button
        type="button"
        onClick={onReplay}
        className="min-h-11 rounded-lg border border-border bg-card px-4 py-2 text-caption font-medium"
      >
        {labels.replay}
      </button>
    </div>
  );
}
