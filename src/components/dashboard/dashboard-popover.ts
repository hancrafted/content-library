/** Native top-layer disclosure does not reserve blank graph space or get clipped by its scroll container. */
export function openGraphPopover(anchor: HTMLElement) {
  const popover = anchor.querySelector<HTMLElement>('[popover]');
  const trigger = anchor.querySelector<HTMLElement>('[data-job], [data-stage]');
  if (!popover || !trigger) return;
  popover.showPopover();
  const box = trigger.getBoundingClientRect();
  const width = popover.offsetWidth;
  const height = popover.offsetHeight;
  const left = Math.max(8, Math.min(window.innerWidth - width - 8, box.left + box.width / 2 - width / 2));
  const top = box.top >= height + 8 ? box.top - height - 8 : box.bottom + 8;
  popover.style.left = `${left}px`;
  popover.style.top = `${Math.max(8, Math.min(window.innerHeight - height - 8, top))}px`;
}

export function closeGraphPopover(anchor: HTMLElement) {
  anchor.querySelector<HTMLElement>('[popover]')?.hidePopover();
}

export function leaveGraphPopover(anchor: HTMLElement) {
  if (!anchor.contains(document.activeElement)) closeGraphPopover(anchor);
}

export function blurGraphPopover(event: FocusEvent<HTMLElement>) {
  if (!event.currentTarget.contains(event.relatedTarget)) closeGraphPopover(event.currentTarget);
}

export function dismissGraphPopover(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Escape') return;
  closeGraphPopover(event.currentTarget);
  event.stopPropagation();
}
import type { FocusEvent, KeyboardEvent } from 'react';
