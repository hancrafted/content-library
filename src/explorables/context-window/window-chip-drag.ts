// spec: docs/features/explorables/context-window.md#reordering-the-parts
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import type { Part } from './context.types';
import { crossedChip } from './window-chip-drag.pure';

const THRESHOLD = 4;
const CLICK_SWALLOW_MILLISECONDS = 60;

export function chipUnder(
  order: readonly Part[],
  dragged: Part,
  point: { readonly x: number; readonly y: number },
): Part | null {
  const el = document.elementFromPoint(point.x, point.y)?.closest<HTMLElement>('[data-chip]');
  const box = el?.getBoundingClientRect();
  const hit = el && box ? { part: el.dataset.chip, left: box.left, width: box.width, x: point.x } : null;
  return crossedChip(order, dragged, hit);
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

const swallowClick = (swallow: { current: boolean }) => (event: MouseEvent<HTMLElement>) => {
  if (!swallow.current) return;
  swallow.current = false;
  event.preventDefault();
  event.stopPropagation();
};

export function useChipDrag({ enabled, order, onMove }: Drag) {
  const [dragging, setDragging] = useState<Part | null>(null);
  const live = useRef<Live>({ order, onMove });
  useEffect(() => {
    live.current = { order, onMove };
  }, [order, onMove]);
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
      setTimeout(() => (swallow.current = false), CLICK_SWALLOW_MILLISECONDS);
    });
  };

  return { dragging, onPointerDown, onClickCapture: swallowClick(swallow) };
}
