import { useCallback, useEffect, useRef, useState } from 'react';

interface Selection {
  stage: string;
  job?: string;
}

function graphOpener(): HTMLElement | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return null;
  const anchor = active.closest('[data-graph-node], [data-graph-stage]');
  return anchor?.querySelector<HTMLButtonElement>('[data-job], [data-stage]') ?? active;
}

function useEscape(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || document.querySelector('dialog[open]')) return;
      event.preventDefault();
      close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);
}

/** Like the Context drawer: transient selection, non-modal Escape, focus in on open and back on close. */
export function useDashboardDetail() {
  const [selection, setSelection] = useState<Selection | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const open = (stage: string, job?: string) => {
    opener.current = graphOpener();
    setSelection({ stage, job });
  };
  const close = useCallback(() => {
    setSelection(null);
    const fallback =
      selection && document.querySelector<HTMLButtonElement>(`[data-stage="${CSS.escape(selection.stage)}"]`);
    (opener.current?.isConnected ? opener.current : fallback)?.focus({ preventScroll: true });
  }, [selection]);
  useEffect(() => {
    if (!selection) return;
    closeButton.current?.focus({ preventScroll: true });
    body.current?.scrollTo({ top: 0 });
  }, [selection]);
  useEscape(selection !== null, close);
  return { selection, open, close, closeButton, body };
}
