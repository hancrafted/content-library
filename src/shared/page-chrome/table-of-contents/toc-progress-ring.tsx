import { cn } from '@/shared/lib/utils';

export const RING_RADIUS = 12;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface ProgressRingProps {
  progress: number;
  settled: boolean;
}

function ProgressArc({ offset, settled }: { offset: number; settled: boolean }) {
  const transition = settled ? 'transition-[stroke-dashoffset] duration-300 ease-out' : 'transition-none';
  return (
    <circle
      cx="16"
      cy="16"
      r={RING_RADIUS}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeDasharray={RING_CIRCUMFERENCE}
      strokeDashoffset={offset}
      strokeLinecap="round"
      className={cn('text-foreground motion-reduce:transition-none', transition)}
    />
  );
}

/**
 * Circular progress ring for collapsed navigation.
 * Zero starts at 12 o'clock (-rotate-90) and fills clockwise.
 */
export function ProgressRing({ progress, settled }: ProgressRingProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = RING_CIRCUMFERENCE * (1 - clamped);
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      data-progress={clamped}
      className="pointer-events-none absolute inset-0 size-full -rotate-90"
    >
      <circle
        cx="16"
        cy="16"
        r={RING_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-border"
      />
      {clamped > 0 && <ProgressArc offset={offset} settled={settled} />}
    </svg>
  );
}
