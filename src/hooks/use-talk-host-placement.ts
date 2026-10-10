import { prefersReducedMotion } from '@/hooks/prefers-reduced-motion';
import { GLIDE_EASING, GLIDE_MS, TALK_DOCKED_ATTR, flipTransform, placementOf, type Rect } from '@/lib/talk-dock.pure';
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

function boxOf(element: Element): Rect {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
}

function place(host: HTMLElement, slot: HTMLElement | null, docked: boolean): Rect {
  const placement = placementOf({ docked, slot: slot ? boxOf(slot) : null });
  Object.assign(host.style, placement);
  return boxOf(host);
}

/** Moves the host from its old box to its new one by animating `transform` alone, as long as the reader accepts motion. */
function glide(host: HTMLElement, first: Rect, last: Rect) {
  const from = flipTransform(first, last);
  if (!from || prefersReducedMotion()) return;
  host.animate([{ transform: from }, { transform: 'none' }], { duration: GLIDE_MS, easing: GLIDE_EASING });
}

/** Glides only when the dock state switched; a re-place that keeps it (a new slot box) jumps. */
function glideOnSwitch(
  host: HTMLElement,
  move: { first: Rect | null; from: boolean | null; docked: boolean; to: Rect },
) {
  if (move.first && move.from !== null && move.from !== move.docked) glide(host, move.first, move.to);
}

/** Follows the slot while undocked: re-places the host on scroll, resize and slot resize, coalesced into one frame. */
function useFollowSlot(
  target: { host: HTMLElement | null; slot: HTMLElement | null; docked: boolean },
  last: RefObject<Rect | null>,
) {
  const { host, slot, docked } = target;
  useEffect(() => {
    const element = host;
    if (!element || !slot || docked) return;
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        last.current = place(element, slot, false);
      });
    };
    const observer = new ResizeObserver(follow);
    observer.observe(slot);
    window.addEventListener('scroll', follow, { passive: true });
    window.addEventListener('resize', follow);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', follow);
      window.removeEventListener('resize', follow);
    };
  }, [host, slot, docked, last]);
}

/**
 * Places the one fixed talk host: over the slot while undocked, bottom-left while docked, with a
 * transform-only glide between the two. The host is never re-parented, so the video keeps playing.
 */
export function useTalkHostPlacement(host: HTMLElement | null, slot: HTMLElement | null, docked: boolean) {
  const last = useRef<Rect | null>(null);
  const wasDocked = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    const element = host;
    const moved = { first: last.current, from: wasDocked.current };
    last.current = element ? place(element, slot, docked) : null;
    wasDocked.current = element ? docked : null;
    if (element && last.current) glideOnSwitch(element, { ...moved, docked, to: last.current });
  }, [host, slot, docked]);
  useFollowSlot({ host, slot, docked }, last);
}

/** Marks the Episode page while the card is docked, so the table of contents leaves it room. */
export function useDockedPageMark(docked: boolean) {
  useEffect(() => {
    if (!docked) return;
    const page = document.querySelector('[data-slot="episode-page"]');
    page?.setAttribute(TALK_DOCKED_ATTR, 'true');
    return () => page?.removeAttribute(TALK_DOCKED_ATTR);
  }, [docked]);
}
