'use client';

import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

/** The one entry to a stage's modal: a "Try it" button under its column. The stage name is hidden text, so a screen reader hears which. */
export function TryButton({
  label,
  stage,
  pressed,
  onOpen,
}: {
  readonly label: string;
  readonly stage: string;
  readonly pressed: boolean;
  readonly onOpen: () => void;
}) {
  return (
    <button
      type="button"
      data-try={stage}
      aria-haspopup="dialog"
      aria-expanded={pressed}
      onClick={onOpen}
      className={cn(
        'inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 text-caption font-medium text-foreground outline-none transition-colors',
        'hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <Play aria-hidden="true" className="size-3.5" />
      {label}
      <span className="sr-only">: {stage}</span>
    </button>
  );
}
