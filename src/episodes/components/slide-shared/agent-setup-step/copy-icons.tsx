import { cn } from '@/shared/lib/utils';

/** Two stacked sheets: the copy mark. Plain SVG, no client code, so a server part and a client widget can both draw it. */
export function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('size-4 shrink-0', className)} aria-hidden="true">
      <rect x="5" y="5" width="8" height="9" rx="1.5" className="fill-none stroke-current" strokeWidth="1.5" />
      <path
        d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H10"
        className="fill-none stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A tick: shown on a copy button for a moment after the clipboard took the text. */
export function TickIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('size-4 shrink-0', className)} aria-hidden="true">
      <path
        d="M3 8.5 6.5 12 13 4.5"
        className="fill-none stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
