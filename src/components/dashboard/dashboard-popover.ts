import { GRAPH_LAYOUT } from '@/lib/dashboard-layout.pure';
import type { FocusEvent, KeyboardEvent } from 'react';

const closing = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

/** Native top-layer disclosure does not reserve blank graph space or get clipped by its scroll container. */
export function openGraphPopover(anchor: HTMLElement) {
  clearTimeout(closing.get(anchor));
  const popover = anchor.querySelector<HTMLElement>('[popover]');
  const trigger = anchor.querySelector<HTMLElement>('[data-job], [data-stage]');
  if (!popover || !trigger) return;
  document.querySelectorAll<HTMLElement>('[data-dashboard-popover]:popover-open').forEach((other) => {
    if (other !== popover) other.hidePopover();
  });
  const box = trigger.getBoundingClientRect();
  const gap = GRAPH_LAYOUT.popoverGap;
  const available = Math.max(box.top, window.innerHeight - box.bottom) - gap * 2;
  popover.style.maxHeight = `${Math.max(0, available)}px`;
  popover.showPopover();
  const width = popover.offsetWidth;
  const height = popover.offsetHeight;
  const left = Math.max(gap, Math.min(window.innerWidth - width - gap, box.left + box.width / 2 - width / 2));
  const top = box.top >= height + gap ? box.top - height - gap : box.bottom + gap;
  popover.style.left = `${left}px`;
  popover.style.top = `${Math.max(gap, Math.min(window.innerHeight - height - gap, top))}px`;
}

export function closeGraphPopover(anchor: HTMLElement) {
  clearTimeout(closing.get(anchor));
  const popover = anchor.querySelector<HTMLElement>('[popover]');
  if (popover?.isConnected && popover.matches(':popover-open')) popover.hidePopover();
}

export function leaveGraphPopover(anchor: HTMLElement) {
  clearTimeout(closing.get(anchor));
  closing.set(
    anchor,
    setTimeout(() => {
      if (!anchor.matches(':hover') && !anchor.contains(document.activeElement)) closeGraphPopover(anchor);
    }, GRAPH_LAYOUT.popoverDelay),
  );
}

export function blurGraphPopover(event: FocusEvent<HTMLElement>) {
  if (!event.currentTarget.contains(event.relatedTarget)) closeGraphPopover(event.currentTarget);
}

export function dismissGraphPopover(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Escape') return;
  closeGraphPopover(event.currentTarget);
  event.stopPropagation();
}
