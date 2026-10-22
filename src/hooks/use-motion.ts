import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { MOTION_AT_REST, arm, frame, settle, start as start_, type MotionState } from './use-motion.pure';

/** What an animating element spreads on itself: `data-motion` and the ref that listens to its own motion events. */
export interface MotionProps {
  readonly 'data-motion': 'running' | 'settled';
  readonly ref: (element: HTMLElement | SVGElement | null) => void | (() => void);
}

/** Events that may start a motion with no state change of the component: a hover or focus transition in CSS. */
const MAY_START = ['pointerenter', 'pointerleave', 'pointerdown', 'focus', 'blur'] as const;

/** Listens on `element` for the motion events that count, and returns the way to stop. */
function listen(element: Element, on: { start: () => void; end: () => void; may: () => void }): () => void {
  const own = (fn: () => void) => (event: Event) => event.target === element && fn();
  const listeners: [string, EventListener][] = [
    ['transitionrun', own(on.start)],
    ['animationstart', own(on.start)],
    ['transitionend', own(on.end)],
    ['transitioncancel', own(on.end)],
    ['animationend', own(on.end)],
    ['animationcancel', own(on.end)],
    ...MAY_START.map((name): [string, EventListener] => [name, on.may]),
  ];
  for (const [name, fn] of listeners) element.addEventListener(name, fn);
  return () => {
    for (const [name, fn] of listeners) element.removeEventListener(name, fn);
  };
}

/** The motion state, an animation-frame wait that settles it when nothing starts, and the three moves on it. */
function useMotionState() {
  const state = useRef<MotionState>(MOTION_AT_REST);
  const frameId = useRef(0);
  const [phase, setPhase] = useState<MotionState['phase']>('settled');
  const apply = useCallback((next: MotionState) => {
    state.current = next;
    setPhase(next.phase);
  }, []);
  const wait = useCallback(() => {
    cancelAnimationFrame(frameId.current);
    frameId.current = requestAnimationFrame(() => {
      apply(frame(state.current));
      if (state.current.phase === 'running' && state.current.live === 0) wait();
    });
  }, [apply]);
  const begin = useCallback(() => {
    apply(arm(state.current));
    wait();
  }, [apply, wait]);
  const cancel = useCallback(() => cancelAnimationFrame(frameId.current), []);
  const start = useCallback(() => apply(start_(state.current)), [apply]);
  const end = useCallback(() => apply(settle(state.current)), [apply]);
  return { phase, begin, start, end, cancel };
}

/*
 * The motion contract of ARCH-003 §5: an element whose CSS transitions or keyframe animations move it reports
 * `data-motion="running"` from the render in which `trigger` (the state that sets the motion off) changes, or when a
 * hover, focus or press may start one, and `"settled"` once the last of its own transitions and animations has ended
 * or been cancelled. When none starts within a couple of animation frames (reduced motion, nothing to animate) it
 * settles on its own. A browser test waits on the page itself, never on a timer. Only the element's own motion
 * counts; its children's bubble. The counting is `use-motion.pure.ts`.
 */
export function useMotion(trigger?: unknown): MotionProps {
  const { phase, begin, start, end, cancel } = useMotionState();
  // Layout effect: running is set before the browser paints the changed state, so no frame shows it settled.
  useLayoutEffect(() => {
    begin();
    return cancel;
  }, [trigger, begin, cancel]);
  const ref = useCallback(
    (element: HTMLElement | SVGElement | null) => (element ? listen(element, { start, end, may: begin }) : undefined),
    [start, end, begin],
  );
  return { 'data-motion': phase, ref };
}
