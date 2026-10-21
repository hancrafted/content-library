import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import type { Part } from './context.types';

/*
 * Mouse drag and drop of the part chips, on native pointer events. A drag starts after the pointer moves a few pixels
 * from a chip pressed with the primary mouse button; every chip the pointer then crosses past its middle takes the
 * dragged chip's place, so the order follows the pointer live. There is no keyboard or touch alternative (Han's
 * decision; docs/features/context.md names the WCAG 2.5.7 gap).
 */

const THRESHOLD = 4;

/** The chip under the pointer, other than the dragged one, once the pointer is past its middle on the way in. */
export function chipUnder(
  order: readonly Part[],
  dragged: Part,
  point: { readonly x: number; readonly y: number },
): Part | null {
  const el = document.elementFromPoint(point.x, point.y)?.closest<HTMLElement>('[data-chip]');
  const target = order.find((part) => part === el?.dataset.chip);
  if (!el || !target || target === dragged) return null;
  const box = el.getBoundingClientRect();
  const forwards = order.indexOf(dragged) < order.indexOf(target);
  const middle = box.left + box.width / 2;
  return forwards === point.x > middle ? target : null;
}

interface Drag {
  readonly enabled: boolean;
  readonly order: readonly Part[];
  readonly onMove: (part: Part, before: Part) => void;
}

interface Live {
  readonly order: readonly Part[];
  readonly onMove: (part: Part, before: Part) => void;
}

/** Follows one press until the button is released; returns the function that ends it, and calls `done(moved)`. */
function follow(press: { part: Part; x: number; y: number }, live: { current: Live }, done: (moved: boolean) => void) {
  const { part } = press;
  let moving = false;
  const move = (ev: globalThis.PointerEvent) => {
    if (!moving && Math.hypot(ev.clientX - press.x, ev.clientY - press.y) < THRESHOLD) return;
    if (!moving) done(true);
    moving = true;
    const target = chipUnder(live.current.order, part, { x: ev.clientX, y: ev.clientY });
    if (target) live.current.onMove(part, target);
  };
  const end = () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', end);
    document.removeEventListener('pointercancel', end);
    if (moving) done(false);
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
  return end;
}

export function useChipDrag({ enabled, order, onMove }: Drag) {
  const [dragging, setDragging] = useState<Part | null>(null);
  const live = useRef<Live>({ order, onMove });
  live.current = { order, onMove };
  const swallow = useRef(false);
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => stop.current?.(), []);

  const onPointerDown = (part: Part) => (event: PointerEvent<HTMLElement>) => {
    if (!enabled || event.pointerType !== 'mouse' || event.button !== 0) return;
    stop.current = follow({ part, x: event.clientX, y: event.clientY }, live, (started) => {
      setDragging(started ? part : null);
      if (started) return;
      stop.current = null;
      // The click that ends a drag must not toggle the chip it ends on.
      swallow.current = true;
      setTimeout(() => (swallow.current = false), 60);
    });
  };

  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!swallow.current) return;
    swallow.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return { dragging, onPointerDown, onClickCapture };
}
