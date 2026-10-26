'use client';

import { useMotion } from '@/hooks/use-motion';

interface JobButtonProps {
  /** The job's stage name, for `data-try`, and the job's id, for `data-try-job`. */
  readonly stage: string;
  readonly jobId: string;
  /** The round of a repeated stage the card sits in, for `data-try-round`; none outside a round. */
  readonly round?: number;
  /** The localised name of the press: which job in which stage, so a screen reader hears it. */
  readonly label: string;
  readonly onOpen: () => void;
}

/**
 * A job card's press target, laid over the whole card: it opens the stage's modal at this job. The name's popover
 * button sits above it, so the two never nest. It opens a dialog and holds no state of its own.
 */
export function JobButton({ stage, jobId, round, label, onOpen }: JobButtonProps) {
  const motion = useMotion();
  return (
    <button
      type="button"
      data-try={stage}
      data-try-job={jobId}
      data-try-round={round}
      aria-haspopup="dialog"
      aria-label={label}
      {...motion}
      onClick={(event) => {
        event.currentTarget.focus();
        onOpen();
      }}
      className="absolute inset-0 z-[1] cursor-pointer rounded-lg outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}
