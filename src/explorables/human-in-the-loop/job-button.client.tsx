'use client';

import { useMotion } from '@/shared/hooks/use-motion';

interface JobButtonProps {
  readonly stage: string;
  readonly jobId: string;
  readonly round?: number;
  readonly label: string;
  readonly onOpen: () => void;
}

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
