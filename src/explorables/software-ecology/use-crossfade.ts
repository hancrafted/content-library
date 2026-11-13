/*
 * Switching the roles state and the factory cross-fades (feedback 09): the old view fades out and the new one in, about
 * 200 ms in all, and no card flies. The floor is placed on the stage (factory) or left in the grid (the roles state)
 * as the new view mounts. Reduced motion switches at once.
 */
import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';

const HALF_MS = 100;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fade = (el: HTMLElement, to: 0 | 1): Animation =>
  el.animate([{ opacity: 1 - to }, { opacity: to }], { duration: HALF_MS, easing: 'ease', fill: 'both' });

/** The floor for the view that just mounted: on the stage for the factory, left in the grid for the roles state. */
const placeFor = (view: string, fl: HTMLElement, place: () => void) => {
  if (view === 'factory') place();
  else fl.style.transform = '';
};

/** After the new view mounted: places the floor, then fades the view in when a switch began the fade-out. */
function useShown(x: {
  view: string;
  viewEl: RefObject<HTMLElement | null>;
  floor: RefObject<HTMLElement | null>;
  placeNow: RefObject<() => void>;
  fadeIn: RefObject<boolean>;
}) {
  const { view, viewEl, floor, placeNow, fadeIn } = x;
  useLayoutEffect(() => {
    const fl = floor.current,
      ve = viewEl.current;
    if (!fl || !ve) return;
    placeFor(view, fl, placeNow.current);
    if (!fadeIn.current) return;
    fadeIn.current = false;
    fade(ve, 1).onfinish = (e) => (e.target as Animation).cancel();
  }, [view, floor, viewEl, placeNow, fadeIn]);
}

export function useCrossfade(x: {
  view: string;
  viewEl: RefObject<HTMLElement | null>;
  floor: RefObject<HTMLElement | null>;
  /** Places the floor on the stage and paints, for the factory view. */
  place: () => void;
}): { switchTo: (change: () => void) => void } {
  const fadeIn = useRef(false);
  const placeNow = useRef(x.place);
  const { view, viewEl, floor } = x;
  useLayoutEffect(() => {
    placeNow.current = x.place;
  });
  const switchTo = useCallback(
    (change: () => void) => {
      const ve = viewEl.current;
      if (!ve || reduced()) return change();
      fadeIn.current = true;
      fade(ve, 0).onfinish = change;
    },
    [viewEl],
  );
  useShown({ view, viewEl, floor, placeNow, fadeIn });
  return { switchTo };
}
