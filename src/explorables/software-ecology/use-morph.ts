/*
 * Switching the roles state and the factory moves every card from its old box to its new one (design-ADR 0024 §13), as
 * the reference build's `setView` does: the boxes are read just before the switch, and after it each card plays from
 * its old box to its new one over 560 ms while the belts stay hidden, then fade in. The floor is placed on the stage
 * (factory) or left in the grid (the roles state) before the new boxes are read. Reduced motion switches at once.
 */
import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';

const MORPH_MS = 560;
const EASE = 'cubic-bezier(.2,.7,.2,1)';

type Rects = Map<string, DOMRect>;

const rectsOf = (floor: HTMLElement | null): Rects =>
  new Map(
    [...(floor?.querySelectorAll<HTMLElement>(':scope > [data-id]') ?? [])].map((el) => [
      el.dataset.id as string,
      el.getBoundingClientRect(),
    ]),
  );

const play = (floor: HTMLElement, first: Rects) => {
  for (const el of floor.querySelectorAll<HTMLElement>(':scope > [data-id]')) {
    const a = first.get(el.dataset.id as string),
      b = el.getBoundingClientRect();
    if (!a?.width || !b.width || !el.offsetWidth) continue;
    const k = b.width / el.offsetWidth; // the floor's scale: 1 in the grid, the stage's fit in the factory
    el.animate(
      [
        {
          transform: `translate(${(a.left - b.left) / k}px, ${(a.top - b.top) / k}px) scale(${a.width / b.width}, ${a.height / b.height})`,
        },
        { transform: 'none' },
      ],
      { duration: MORPH_MS, easing: EASE },
    );
  }
};

/** After a switch: places the floor for the new view, then plays each card from its old box. */
function morph(x: { view: string; fl: HTMLElement; ve: HTMLElement; place: () => void; from: Rects | null }) {
  if (x.view === 'factory') x.place();
  else x.fl.style.transform = '';
  if (!x.from?.size || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
  const ve = x.ve;
  ve.dataset.morphing = 'true';
  play(x.fl, x.from);
  const t = window.setTimeout(() => delete ve.dataset.morphing, MORPH_MS);
  return () => window.clearTimeout(t);
}

export function useMorph(x: {
  view: string;
  viewEl: RefObject<HTMLElement | null>;
  floor: RefObject<HTMLElement | null>;
  /** Places the floor on the stage and paints, for the factory view. */
  place: () => void;
}): { begin: () => void } {
  const first = useRef<Rects | null>(null);
  const placeNow = useRef(x.place);
  const { view, viewEl, floor } = x;
  useLayoutEffect(() => {
    placeNow.current = x.place;
  });
  const begin = useCallback(() => {
    first.current = rectsOf(floor.current);
  }, [floor]);
  useLayoutEffect(() => {
    const fl = floor.current,
      ve = viewEl.current;
    if (!fl || !ve) return undefined;
    const from = first.current;
    first.current = null;
    return morph({ view, fl, ve, place: placeNow.current, from });
  }, [view, floor, viewEl]);
  return { begin };
}
