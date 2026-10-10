import { prefersReducedMotion } from '@/hooks/prefers-reduced-motion';
import {
  GLIDE_EASING,
  GLIDE_MS,
  TALK_DOCKED_ATTR,
  flipTransform,
  placementOf,
  tocReserveRem,
  type Rect,
} from '@/lib/talk-dock.pure';
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

/** Where the talk host stands: the element, the slot it follows while undocked, and whether it is docked. */
interface Target {
  host: HTMLElement | null;
  slot: HTMLElement | null;
  docked: boolean;
}

/** True when the dock state changed since the last placement; the first placement is no switch. */
function switched(before: boolean | null, docked: boolean): boolean {
  return before !== null && before !== docked;
}

let gliding: Animation | undefined;

/** Glides the host from its old box to its new one by animating `transform` alone, unless the reader asked for less motion. */
function glide(host: HTMLElement, first: Rect | null, last: Rect) {
  gliding?.cancel();
  const from = first && flipTransform(first, last);
  if (!from || prefersReducedMotion()) return;
  gliding = host.animate([{ transform: from }, { transform: 'none' }], { duration: GLIDE_MS, easing: GLIDE_EASING });
}

/** Follows the slot while undocked: re-places the host on scroll, resize and slot resize, coalesced into one frame. */
function useFollowSlot(target: Target, last: RefObject<Rect | null>) {
  const { host, slot, docked } = target;
  useEffect(() => {
    if (!host || !slot || docked) return;
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        last.current = place(host, slot, false);
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
export function useTalkHostPlacement(target: Target) {
  const { host, slot, docked } = target;
  const last = useRef<Rect | null>(null);
  const wasDocked = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    const first = last.current;
    const before = wasDocked.current;
    last.current = host ? place(host, slot, docked) : null;
    wasDocked.current = host ? docked : null;
    // A re-place that keeps the dock state (a new slot box) jumps; only a switch glides.
    if (host && last.current && switched(before, docked)) glide(host, first, last.current);
  }, [host, slot, docked]);
  useFollowSlot(target, last);
}

/** Marks the Episode page while the card is docked, so the table of contents leaves it room. */
export function useDockedPageMark(docked: boolean) {
  useEffect(() => {
    if (!docked) return;
    const page = document.querySelector('[data-slot="episode-page"]');
    const root = document.documentElement;
    page?.setAttribute(TALK_DOCKED_ATTR, 'true');
    // Keyboard focus scrolled into view clears the docked card, never lands under it.
    root.style.scrollPaddingBottom = `${tocReserveRem()}rem`;
    return () => {
      page?.removeAttribute(TALK_DOCKED_ATTR);
      root.style.removeProperty('scroll-padding-bottom');
    };
  }, [docked]);
}
