import { SHORTCUT_LABEL } from '@/lib/context-drawer.pure';
import { cn } from '@/lib/utils';
import type { Ref } from 'react';

/** The edge tab that opens the drawer; the hint is visible and announced (FE-010 §6). */
export function DrawerTrigger(props: {
  label: string;
  hint: string;
  open: boolean;
  controls: string;
  onToggle: () => void;
  ref: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={props.ref}
      type="button"
      data-slot="context-trigger"
      aria-expanded={props.open}
      aria-controls={props.controls}
      aria-keyshortcuts={SHORTCUT_LABEL}
      onClick={props.onToggle}
      className={cn(
        'fixed top-1/2 right-0 z-30 flex -translate-y-1/2 cursor-pointer flex-col items-center gap-2 rounded-l-md border border-r-0 bg-background px-2 py-3 text-sm shadow-header print:hidden',
        'transition-[right] motion-reduce:transition-none',
        props.open && 'max-md:invisible md:right-[min(26rem,92vw)]',
      )}
    >
      <span className="[writing-mode:vertical-rl]">{props.label}</span>
      <kbd className="rounded border px-1 font-mono text-[0.65rem] text-muted-foreground" title={props.hint}>
        {SHORTCUT_LABEL}
      </kbd>
    </button>
  );
}
