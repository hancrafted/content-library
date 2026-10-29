import { cn } from '@/shared/lib/utils';

/*
 * The Slide's small marks, drawn as in Option 8a's mock: plain SVG, no client code, so both the server parts and the
 * client widgets of this folder can draw them.
 */

/** Two stacked sheets: the copy mark. */
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

/** A box with an arrow leaving it: a link to a vendor's own page. */
export function ExternalIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true">
      <path
        d="M6 3H3.5A.5.5 0 0 0 3 3.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V10M9 3h4v4M13 3 7.5 8.5"
        className="fill-none stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** An arrow onto a line: a download. */
export function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true">
      <path
        d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10"
        className="fill-none stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The installer's checkbox: ticked in `primary`, or an empty hairline box. */
export function CheckboxIcon({ ticked }: { ticked: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true">
      {ticked ? (
        <>
          <rect x="1.5" y="1.5" width="13" height="13" rx="3" className="fill-primary" />
          <path
            d="M4.5 8.5 7 11l4.5-5.5"
            className="fill-none stroke-primary-foreground"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <rect
          x="1.5"
          y="1.5"
          width="13"
          height="13"
          rx="3"
          className="fill-none stroke-muted-foreground"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}

/** A long arrow pointing right: what the check leads to. */
export function ArrowIcon() {
  return (
    <svg viewBox="0 0 40 16" className="h-4 w-10 shrink-0" aria-hidden="true">
      <path
        d="M2 8 H32 M26 3 L34 8 L26 13"
        className="fill-none stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
