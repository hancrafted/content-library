// spec: docs/features/explorables/context-window.md#reordering-the-parts
import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { Part } from './context.types';

const chatScroll = (root: HTMLElement | null) => root?.querySelector<HTMLElement>('[data-chat-scroll]') ?? null;

function finishAnimationsRestartedByReorder(root: HTMLElement) {
  for (const animation of root.getAnimations({ subtree: true })) {
    const iterations = animation.effect?.getComputedTiming().iterations ?? 1;
    if (Number.isFinite(iterations)) animation.finish();
  }
}

export function useReorderRepair(root: RefObject<HTMLElement | null>, order: readonly Part[]) {
  const saved = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || saved.current === null) return;
    const box = chatScroll(el);
    if (box) box.scrollTop = saved.current;
    saved.current = null;
    finishAnimationsRestartedByReorder(el);
  }, [order, root]);
  const rememberChatScrollBeforeReorder = () => {
    saved.current = chatScroll(root.current)?.scrollTop ?? 0;
  };
  return rememberChatScrollBeforeReorder;
}
