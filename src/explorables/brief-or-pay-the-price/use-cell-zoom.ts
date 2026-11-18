import { useCallback, useLayoutEffect, useRef, type Dispatch, type RefObject } from 'react';
import type { CellKey, ExplorableEvent } from './explorable-state.pure';
import { prefersReducedMotion } from './reduced-motion';

interface Point {
  readonly x: number;
  readonly y: number;
}

const OPEN_MILLISECONDS = 480;
const CLOSE_MILLISECONDS = 380;
const EASING = 'cubic-bezier(0.3, 0, 0.2, 1)';

const centre = (element: Element): Point => {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { x: left + width / 2, y: top + height / 2 };
};

const LEAVE: Keyframe[] = [
  { transform: 'scale(1.6)', opacity: 0 },
  { transform: 'none', opacity: 1 },
];
const ENTER: Keyframe[] = [
  { transform: 'scale(0.12)', opacity: 0 },
  { transform: 'none', opacity: 1 },
];

function zoom(root: HTMLElement, from: Point | null, [keyframes, duration]: readonly [Keyframe[], number]): void {
  if (typeof root.animate !== 'function' || prefersReducedMotion()) return;
  const box = root.getBoundingClientRect();
  root.style.transformOrigin = from === null ? '50% 50%' : `${from.x - box.left}px ${from.y - box.top}px`;
  root.animate(keyframes, { duration, easing: EASING });
}

const keyOf = (cell: CellKey): string => `${cell.move}|${cell.trait}`;

export interface CellZoom {
  readonly container: RefObject<HTMLElement | null>;
  readonly cell: CellKey | null;
  readonly restore: CellKey | null;
  readonly dispatch: Dispatch<ExplorableEvent>;
}

function useEntered({ container, cell }: Pick<CellZoom, 'container' | 'cell'>, from: RefObject<Point | null>) {
  const before = useRef<CellKey | null>(null);
  useLayoutEffect(() => {
    const was = before.current;
    before.current = cell;
    const root = container.current?.querySelector<HTMLElement>('[data-agent-root]');
    if (cell === null || was !== null || !root) return;
    zoom(root, from.current, [ENTER, OPEN_MILLISECONDS]);
    container.current?.querySelector<HTMLElement>('[data-cell-back]')?.focus();
  }, [cell, container, from]);
}

function giveBack(container: HTMLElement | null, restore: CellKey): void {
  const root = container?.querySelector<HTMLElement>('[data-agent-root]');
  const button = container?.querySelector<HTMLElement>(`[data-cell="${keyOf(restore)}"]`);
  button?.focus();
  if (root) zoom(root, button ? centre(button) : null, [LEAVE, CLOSE_MILLISECONDS]);
}

function useReturned({ container, cell, restore, dispatch }: CellZoom) {
  useLayoutEffect(() => {
    if (cell !== null || restore === null) return;
    giveBack(container.current, restore);
    dispatch({ type: 'focused' });
  }, [cell, restore, container, dispatch]);
}

export function useCellZoom(args: CellZoom) {
  const from = useRef<Point | null>(null);
  useEntered(args, from);
  useReturned(args);
  const { dispatch } = args;
  return useCallback(
    (cell: CellKey, button: HTMLElement) => {
      from.current = centre(button);
      dispatch({ type: 'openCell', cell });
    },
    [dispatch],
  );
}
