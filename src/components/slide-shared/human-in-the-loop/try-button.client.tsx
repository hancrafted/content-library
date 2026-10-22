'use client';

import { useMotion } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

interface TryButtonProps {
  readonly label: string;
  /** The stage's name, for `data-try` and the hidden suffix. */
  readonly stage: string;
  /** The localised hidden suffix that says which stage, so a screen reader hears it. */
  readonly forStage: string;
  readonly onOpen: () => void;
}

/** The one entry to a stage's modal: a "Try it" button under its column. It opens a dialog and holds no state of its own. */
export function TryButton({ label, stage, forStage, onOpen }: TryButtonProps) {
  const motion = useMotion();
  return (
    <button
      type="button"
      data-try={stage}
      {...motion}
      aria-haspopup="dialog"
      onClick={(event) => {
        event.currentTarget.focus();
        onOpen();
      }}
      className={cn(
        'inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 text-caption font-medium text-foreground outline-none transition-colors',
        'hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <Play aria-hidden="true" className="size-3.5" />
      {label}
      <span className="sr-only"> {forStage}</span>
    </button>
  );
}
