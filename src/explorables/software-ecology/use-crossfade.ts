import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';

const HALF_MILLISECONDS = 100;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fade = (el: HTMLElement, to: 0 | 1): Animation =>
  el.animate([{ opacity: 1 - to }, { opacity: to }], { duration: HALF_MILLISECONDS, easing: 'ease', fill: 'both' });

const placeFor = (view: string, fl: HTMLElement, place: () => void) => {
  if (view === 'factory') place();
  else fl.style.transform = '';
};

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
