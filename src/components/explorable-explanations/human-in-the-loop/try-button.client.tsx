'use client';

import { useMotion } from '@/hooks/use-motion';
import { Play } from 'lucide-react';

interface TryButtonProps {
  readonly label: string;
  /** The stage's name, for `data-try` and the hidden suffix. */
  readonly stage: string;
  /** The localised hidden suffix that says which stage, so a screen reader hears it. */
  readonly forStage: string;
  readonly onOpen: () => void;
}

/**
 * The one entry to a stage's modal: the whole column is the button, laid over it. Its visible face, "Practice it",
 * rises into the bottom of the column while the pointer is over the column or the button has keyboard focus; on a
 * touch screen, where nothing hovers, it always shows. It opens a dialog and holds no state of its own.
 */
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
      className="group/try absolute inset-0 z-[1] cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        data-practice=""
        className="absolute inset-x-3 bottom-3 inline-flex min-h-9 translate-y-2 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 text-caption font-medium text-foreground opacity-0 shadow-sm transition-[opacity,translate] duration-200 ease-out group-hover/column:translate-y-0 group-hover/column:opacity-100 group-focus-visible/try:translate-y-0 group-focus-visible/try:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-100 motion-reduce:transition-none"
      >
        <Play aria-hidden="true" className="size-3.5" />
        {label}
      </span>
      <span className="sr-only"> {forStage}</span>
    </button>
  );
}
