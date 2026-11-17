import {
  GLIDE_EASING,
  GLIDE_MILLISECONDS,
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

interface Target {
  host: HTMLElement | null;
  slot: HTMLElement | null;
  docked: boolean;
}

function switched(before: boolean | null, docked: boolean): boolean {
  return before !== null && before !== docked;
}

let gliding: Animation | undefined;

function glide(host: HTMLElement, first: Rect | null, last: Rect) {
  const from = first && flipTransform(first, last);
  if (!from || prefersReducedMotion()) return;
  gliding = host.animate([{ transform: from }, { transform: 'none' }], {
    duration: GLIDE_MILLISECONDS,
    easing: GLIDE_EASING,
  });
}

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

export function useTalkHostPlacement(target: Target) {
  const { host, slot, docked } = target;
  const wasDocked = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    if (!host) {
      wasDocked.current = null;
      return;
    }
    gliding?.cancel();
    const first = wasDocked.current === null ? null : boxOf(host);
    const last = place(host, slot, docked);
    if (switched(wasDocked.current, docked)) glide(host, first, last);
    wasDocked.current = docked;
  }, [host, slot, docked]);
  useFollowSlot(target);
}

export function useDockedPageMark(docked: boolean) {
  useEffect(() => {
    if (!docked) return;
    const page = document.querySelector('[data-slot="episode-page"]');
    const root = document.documentElement;
    page?.setAttribute(TALK_DOCKED_ATTR, 'true');
    root.style.scrollPaddingBottom = `${tocReserveRem()}rem`;
    return () => {
      page?.removeAttribute(TALK_DOCKED_ATTR);
      root.style.removeProperty('scroll-padding-bottom');
    };
  }, [docked]);
}
