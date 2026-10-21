import { cn } from '@/lib/utils';

/** The AI sparkle, the Visual language's mark on a job the AI does. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('shrink-0', className)} aria-hidden="true">
      <path d="M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8 6.6 6.6z" className="fill-ai" />
    </svg>
  );
}

/** A check: a job checked against the requirements card, or the card signed off. */
export function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('shrink-0', className)} aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The dashed stub ending in a ring: a piece that waits for its turn. */
export function ParkedStub({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 8" className={cn('h-2 w-6 shrink-0', className)} aria-hidden="true">
      <path d="M0 4h16" className="fill-none stroke-border" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="20" cy="4" r="2.5" className="fill-none stroke-border" strokeWidth="1.5" />
    </svg>
  );
}

/** The solid line on from the piece taken forward. */
export function FlowStub({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 8" className={cn('h-2 w-6 shrink-0', className)} aria-hidden="true">
      <path d="M0 4h24" className="fill-none stroke-foreground" strokeWidth="1.5" />
    </svg>
  );
}
