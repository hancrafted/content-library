/*
 * Which dashboard is open, and whether the dashboards explain their charts (design-ADR 0024 §17), as the reference
 * build's `cardClick`, `closePopover` and help button keep them: a click on a card opens its dashboard and a second
 * click closes it; Escape closes it once no menu and no tour is open (they stop Escape first); closing hands focus back to the
 * card. Transient state (FE-001 §1): a reload loses only an open popover.
 */
import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';

export interface DashboardState {
  /** The open card's id, or null. */
  readonly open: string | null;
  /** The ids whose dashboards the readouts cover. */
  readonly watch: readonly string[];
  readonly help: boolean;
  toggleHelp(): void;
  /** Opens `id`'s dashboard, or closes it when it is the open one. */
  toggle(id: string): void;
  /** Closes it and hands focus back to its card. */
  close(): void;
  /** Closes it and leaves focus where it is: a new state or use case. */
  dismiss(): void;
}

const focusCard = (within: HTMLElement | null, id: string) =>
  within?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.focus({ preventScroll: true });

/** `within` holds the cards, so focus can return to the one that opened. */
export function useDashboard(within: RefObject<HTMLElement | null>): DashboardState {
  const [open, setOpen] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const close = useCallback(() => {
    if (open) focusCard(within.current, open);
    setOpen(null);
  }, [open, within]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    // on the window, after the document: a menu (capture) and a tour (bubble) hear Escape first and stop it
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open, close]);
  const watch = useMemo(() => (open ? [open] : []), [open]);
  return {
    open,
    watch,
    help,
    toggleHelp: () => setHelp((h) => !h),
    toggle: (id) => (id === open ? close() : setOpen(id)),
    close,
    dismiss: () => setOpen(null),
  };
}
