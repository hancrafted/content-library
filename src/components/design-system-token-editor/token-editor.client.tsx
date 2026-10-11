'use client';

import { Button } from '@/components/ui/button';
import { changedTokens, useLiveEdits, usePageTokens } from '@/hooks/use-page-tokens';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import type { Edits } from '@/lib/token-changes.pure';
import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TokenPanel } from './token-panel.client';

const GAP_PX = 8;

/** Closes on Escape (returning focus to the trigger) and on a press outside both the panel and the trigger. */
function useDismiss(open: boolean, close: () => void, trigger: React.RefObject<HTMLButtonElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      close();
      trigger.current?.focus();
    };
    const onPress = (event: PointerEvent) => {
      const target = event.target as Node;
      const inside = target instanceof Element && target.closest('[data-testid="design-system-token-panel"]');
      if (!inside && !trigger.current?.contains(target)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPress);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPress);
    };
  }, [open, close, trigger]);
}

/** Open state and the panel's top edge, taken from the button when it opens: the header is sticky and wraps on a phone. */
function usePopover(trigger: React.RefObject<HTMLButtonElement | null>) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  useDismiss(open, () => setOpen(false), trigger);
  const toggle = () => {
    if (!open && trigger.current) setTop(trigger.current.getBoundingClientRect().bottom + GAP_PX);
    setOpen((o) => !o);
  };
  return { open, top, toggle };
}

function Trigger({
  open,
  changed,
  onToggle,
  buttonRef,
}: {
  open: boolean;
  changed: boolean;
  onToggle: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <Button
      ref={buttonRef}
      size="icon"
      variant="outline"
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label="Design-system token editor"
      title="Design-system token editor (dev only)"
      data-testid="design-system-token-editor"
      className="relative"
      onClick={onToggle}
    >
      <SlidersHorizontal aria-hidden />
      {changed && <span aria-hidden className="bg-brand-accent absolute -top-1 -right-1 size-2.5 rounded-full" />}
    </Button>
  );
}

/**
 * The dev-only design-system token editor: an icon button in the header that
 * drops a popover down. It edits the global tokens and the active Slide's own
 * tokens in the active theme, live. Nothing is saved; "Copy changed" exports the
 * changes as a prompt for an agent.
 */
export default function TokenEditor() {
  const theme = useResolvedTheme();
  const [edits, setEdits] = useState<Edits>({});
  const trigger = useRef<HTMLButtonElement>(null);
  const { open, top, toggle } = usePopover(trigger);
  const tokens = usePageTokens();
  useLiveEdits(tokens, edits, theme);
  const changes = useMemo(() => changedTokens(tokens, edits), [tokens, edits]);
  const panel = (
    <TokenPanel theme={theme} tokens={tokens} edits={edits} changes={changes} onEdits={setEdits} top={top} />
  );
  return (
    <>
      <Trigger open={open} changed={changes.length > 0} onToggle={toggle} buttonRef={trigger} />
      {open && createPortal(panel, document.body)}
    </>
  );
}
