'use client';

import { useRef, useState, type TransitionEvent } from 'react';

/** What an animating element spreads on itself: `data-motion` plus the three events that move it. */
export interface MotionProps {
  readonly 'data-motion': 'running' | 'settled';
  readonly onTransitionRun: (event: TransitionEvent<Element>) => void;
  readonly onTransitionEnd: (event: TransitionEvent<Element>) => void;
  readonly onTransitionCancel: (event: TransitionEvent<Element>) => void;
}

/*
 * The motion contract of ARCH-003 §5: an element whose CSS transitions animate it reports `data-motion="running"`
 * from the first transition's start and `"settled"` once the last one ends or is cancelled, so a browser test waits on
 * the page itself, never on a timer. It counts only the element's own transitions (those of its children bubble), and
 * rests at `settled`: with reduced motion no transition runs, so none is awaited.
 */
export function useMotion(): MotionProps {
  const live = useRef(0);
  const [running, setRunning] = useState(false);
  const own = (event: TransitionEvent<Element>) => event.target === event.currentTarget;
  const end = (event: TransitionEvent<Element>) => {
    if (!own(event)) return;
    live.current = Math.max(0, live.current - 1);
    if (live.current === 0) setRunning(false);
  };
  return {
    'data-motion': running ? 'running' : 'settled',
    onTransitionRun: (event) => {
      if (!own(event)) return;
      live.current += 1;
      setRunning(true);
    },
    onTransitionEnd: end,
    onTransitionCancel: end,
  };
}
