import type { KeyboardEvent } from 'react';

/* Roving focus inside the bar and the grid: one tab stop each, the arrows move between the parts in the window. */

const STEP: Readonly<Record<string, number>> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

export function rove(event: KeyboardEvent<HTMLElement>) {
  const by = STEP[event.key];
  if (!by) return;
  event.preventDefault();
  const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button[data-part]:not([data-out])')];
  const current = items.findIndex((el) => el === document.activeElement);
  const next = items[Math.max(0, Math.min(items.length - 1, current + by))];
  if (!next) return;
  for (const el of items) el.tabIndex = -1;
  next.tabIndex = 0;
  next.focus();
}
