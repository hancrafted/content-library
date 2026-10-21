import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type FocusEvent,
  type PointerEvent,
  type RefObject,
} from 'react';
import { anchorIndex, dockHeights, restHeights } from './attention-dock.pure';
import type { Attention } from './context-usage.pure';

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
function useRest(list: RefObject<HTMLElement | null>, enabled: boolean, shares: readonly Attention[]) {
  const rest = useRef<number[]>([]);
  const layout = useCallback(() => {
    const el = list.current;
    if (!el || !enabled) return;
    rest.current = restHeights(
      shares.map((share) => share.units),
      el.clientHeight,
    );
    apply(el, rest.current);
  }, [list, enabled, shares]);
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

/** Keyboard focus on a row expands it as hovering does, so a focused 4px row is visible: the dock sits on that row. */
function useFocusDock(list: RefObject<HTMLElement | null>, enabled: boolean, rest: RefObject<number[]>) {
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    const el = list.current;
    const row = event.target.closest<HTMLElement>('[data-row]');
    if (!enabled || !el || !row) return;
    const at = rows(el).indexOf(row);
    if (at >= 0) apply(el, dockHeights(rest.current, at, fullRow(el)));
  };
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    const el = list.current;
    if (el && enabled && !el.contains(event.relatedTarget)) apply(el, rest.current);
  };
  return { onFocus, onBlur };
}

/** The pointer handlers of the list; `shares` are its rows' shares of the attention, and a new array refits the heights. */
export function useDock(list: RefObject<HTMLElement | null>, enabled: boolean, shares: readonly Attention[]) {
  const rest = useRest(list, enabled, shares);
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
  return { onPointerMove, onPointerLeave, ...useFocusDock(list, enabled, rest) };
}
