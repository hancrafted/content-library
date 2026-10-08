import { SHORTCUT_LABEL } from '@/lib/context-drawer.pure';
import { cn } from '@/lib/utils';
import { MessageSquareText } from 'lucide-react';
import type { Ref } from 'react';

function Hint({ hint }: { hint: string }) {
  return (
    <kbd title={hint} className="rounded border px-1 font-mono text-[0.65rem] text-muted-foreground max-md:hidden">
      {SHORTCUT_LABEL}
    </kbd>
  );
}

/**
 * The pill that opens the drawer, bottom-right as the table of contents' pill
 * sits bottom-left. The shortcut hint is visible from `md` and announced everywhere
 * (FE-010 §5). It is `invisible` while the card is open, which covers its corner.
 */
export function DrawerTrigger(props: {
  label: string;
  text: string;
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
      aria-label={props.label}
      aria-expanded={props.open}
      aria-controls={props.controls}
      aria-keyshortcuts={SHORTCUT_LABEL}
      onClick={props.onToggle}
      className={cn(
        'fixed right-4 bottom-4 z-40 flex min-h-11 cursor-pointer items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm shadow-header backdrop-blur-xl backdrop-saturate-150 print:hidden',
        props.open && 'invisible',
      )}
    >
      <MessageSquareText aria-hidden className="size-4 shrink-0" />
      <span className="font-medium">{props.text}</span>
      <Hint hint={props.hint} />
    </button>
  );
}
