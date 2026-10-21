import { useCallback, useEffect, useLayoutEffect, useRef, type PointerEvent, type RefObject } from 'react';
import { anchorIndex, dockHeights, restHeights } from './attention-dock.pure';

/*
 * The compressed Attention list's pointer magnification. Row heights are written to the DOM straight from one
 * animation frame per pointer move, so React never redraws the rows for it; the stylesheet snaps them under reduced
 * motion. Rows are the list's `[data-row]` children, in the order of the units.
 */

const rows = (list: HTMLElement) => Array.from(list.querySelectorAll<HTMLElement>('[data-row]'));

function apply(list: HTMLElement, heights: readonly number[]) {
  rows(list).forEach((row, i) => {
    const h = heights[i];
    if (h !== undefined) row.style.height = `${h}px`;
  });
}

const clear = (list: HTMLElement | null) => {
  if (list) rows(list).forEach((row) => row.style.removeProperty('height'));
};

/** The height a row has at full size: one line of the list's own text. */
const fullRow = (list: HTMLElement) => parseFloat(getComputedStyle(list).fontSize) * 1.7;

/** The resting heights, fitted to the list's height and refitted when it resizes or the shares change. */
function useRest(list: RefObject<HTMLElement | null>, enabled: boolean, key: string) {
  const rest = useRef<number[]>([]);
  const layout = useCallback(() => {
    const el = list.current;
    if (!el || !enabled) return;
    rest.current = restHeights(key ? key.split(',').map(Number) : [], el.clientHeight);
    apply(el, rest.current);
  }, [list, enabled, key]);
  useLayoutEffect(() => {
    if (!enabled) clear(list.current);
    layout();
  }, [layout, enabled, list]);
  useEffect(() => {
    const el = list.current;
    if (!el || !enabled || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(layout);
    observer.observe(el);
    return () => observer.disconnect();
  }, [layout, enabled, list]);
  return rest;
}

/** The pointer handlers of the list; `units` are the rows' shares of the attention. */
export function useDock(list: RefObject<HTMLElement | null>, enabled: boolean, units: readonly number[]) {
  // The units as a string, so a redraw with the same shares leaves the heights the pointer set alone.
  const rest = useRest(list, enabled, units.join(','));
  const frame = useRef(0);
  const y = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const el = list.current;
    if (!enabled || !el || event.pointerType !== 'mouse') return;
    y.current = event.clientY - el.getBoundingClientRect().top;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const full = fullRow(el);
      apply(el, dockHeights(rest.current, anchorIndex(rest.current, y.current, full), full));
    });
  };
  const onPointerLeave = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    if (list.current && enabled) apply(list.current, rest.current);
  };
  return { onPointerMove, onPointerLeave };
}
