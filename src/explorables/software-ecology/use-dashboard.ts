// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
// decision: FE-001 §1
import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';

export interface DashboardState {
  readonly open: string | null;
  readonly watch: readonly string[];
  readonly help: boolean;
  toggleHelp(): void;
  toggle(id: string): void;
  close(): void;
  dismiss(): void;
}

const focusCard = (within: HTMLElement | null, id: string) =>
  within?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.focus({ preventScroll: true });

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
