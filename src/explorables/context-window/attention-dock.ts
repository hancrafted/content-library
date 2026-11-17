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

const rows = (list: HTMLElement) => Array.from(list.querySelectorAll<HTMLElement>('[data-row]'));

const NAME_HIDDEN_BELOW_FULL_ROW_RATIO = 0.9;

function apply(list: HTMLElement, heights: readonly number[]) {
  const full = fullRow(list);
  rows(list).forEach((row, i) => {
    const h = heights[i];
    if (h === undefined) return;
    row.style.height = `${h}px`;
    if (h < full * NAME_HIDDEN_BELOW_FULL_ROW_RATIO) row.setAttribute('data-tight', '');
    else row.removeAttribute('data-tight');
  });
}

const clear = (list: HTMLElement | null) => {
  if (!list) return;
  rows(list).forEach((row) => {
    row.style.removeProperty('height');
    row.removeAttribute('data-tight');
  });
};

const fullRow = (list: HTMLElement) => parseFloat(getComputedStyle(list).fontSize) * 1.7;

const maxHeight = (list: HTMLElement) => list.clientHeight;

function useRest(list: RefObject<HTMLElement | null>, shares: readonly Attention[], edge: number | null) {
  const enabled = edge !== null;
  const rest = useRef<number[]>([]);
  const layout = useCallback(() => {
    const el = list.current;
    if (!el || !enabled) return;
    rest.current = restHeights(
      shares.map((share) => share.units),
      { max: maxHeight(el), natural: fullRow(el), edge: edge ?? 0 },
    );
    apply(el, rest.current);
  }, [list, enabled, shares, edge]);
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

export function useDock(list: RefObject<HTMLElement | null>, shares: readonly Attention[], edge: number | null) {
  const enabled = edge !== null;
  const rest = useRest(list, shares, edge);
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
