import {
  GLIDE_EASING,
  GLIDE_MS,
  TALK_DOCKED_ATTR,
  flipTransform,
  placementOf,
  tocReserveRem,
  type Rect,
} from '@/episodes/lib/talk-dock.pure';
import { prefersReducedMotion } from '@/shared/hooks/prefers-reduced-motion';
import { useEffect, useLayoutEffect, useRef } from 'react';

function boxOf(element: Element): Rect {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
}

function place(host: HTMLElement, slot: HTMLElement | null, docked: boolean): Rect {
  const scroll = { x: window.scrollX, y: window.scrollY };
  const placement = placementOf({ docked, slot: slot ? boxOf(slot) : null, scroll });
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
  const from = first && flipTransform(first, last);
  if (!from || prefersReducedMotion()) return;
  gliding = host.animate([{ transform: from }, { transform: 'none' }], { duration: GLIDE_MS, easing: GLIDE_EASING });
}

/**
 * Re-measures the undocked host's page position on resize, slot and body resize, and font load, coalesced into one
 * frame. Not on scroll: the host is absolute against the page and scrolls with it.
 */
function useFollowSlot(target: Target) {
  const { host, slot, docked } = target;
  useEffect(() => {
    if (!host || !slot || docked) return;
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => place(host, slot, false));
    };
    const observer = new ResizeObserver(follow);
    observer.observe(slot);
    observer.observe(document.body);
    window.addEventListener('resize', follow);
    void document.fonts?.ready.then(follow);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', follow);
    };
  }, [host, slot, docked]);
}

/**
 * Places the one talk host: over the slot while undocked, bottom-left while docked, with a
 * transform-only glide between the two. The host is never re-parented, so the video keeps playing.
 */
export function useTalkHostPlacement(target: Target) {
  const { host, slot, docked } = target;
  const wasDocked = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    if (!host) {
      wasDocked.current = null;
      return;
    }
    gliding?.cancel();
    // FLIP: the old viewport box, then the switch of position, then the new box.
    const first = wasDocked.current === null ? null : boxOf(host);
    const last = place(host, slot, docked);
    if (switched(wasDocked.current, docked)) glide(host, first, last);
    wasDocked.current = docked;
  }, [host, slot, docked]);
  useFollowSlot(target);
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
