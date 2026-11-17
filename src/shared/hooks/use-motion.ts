import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { MOTION_AT_REST, arm, frame, settle, start as start_, type MotionState } from './use-motion.pure';

export interface MotionProps {
  readonly 'data-motion': 'running' | 'settled';
  readonly ref: (element: HTMLElement | SVGElement | null) => void | (() => void);
}

const MAY_START = ['pointerenter', 'pointerleave', 'pointerdown', 'focus', 'blur'] as const;

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

// decision: ARCH-003 §5
export function useMotion(trigger?: unknown): MotionProps {
  const { phase, begin, start, end, cancel } = useMotionState();
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
