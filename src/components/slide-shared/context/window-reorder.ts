import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { Part } from './context.types';

/*
 * What a reorder must repair. Moving a part's DOM node resets the scroll position of the chat inside it and restarts
 * every CSS animation under it (the entrance, the bar and grid morph), which would replay as a flash. The parent
 * saves the chat's scroll before it reorders; after the new order is in the DOM, and before paint, the chat gets its
 * position back and every finite animation is finished, which also clears the morph flags' effect.
 */

const chatScroll = (root: HTMLElement | null) => root?.querySelector<HTMLElement>('[data-chat-scroll]') ?? null;

function settle(root: HTMLElement) {
  for (const animation of root.getAnimations({ subtree: true })) {
    const iterations = animation.effect?.getComputedTiming().iterations ?? 1;
    if (Number.isFinite(iterations)) animation.finish();
  }
}

/** Returns what to call just before dispatching a reorder: it remembers the chat's scroll for the effect below. */
export function useReorderRepair(root: RefObject<HTMLElement | null>, order: readonly Part[]) {
  const saved = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || saved.current === null) return;
    const box = chatScroll(el);
    if (box) box.scrollTop = saved.current;
    saved.current = null;
    settle(el);
  }, [order, root]);
  return () => {
    saved.current = chatScroll(root.current)?.scrollTop ?? 0;
  };
}
