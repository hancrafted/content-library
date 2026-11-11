export interface HandOffProps {
  readonly label: string;
  readonly note: string;
}

/**
 * The hand-off between the rooms, in `primary`: one arrow, the fresh chat, and only the work order crossing. It points
 * down while the rooms stack and across once they sit side by side.
 */
export function HandOff({ label, note }: HandOffProps) {
  return (
    <div data-hand-off className="flex flex-col items-center justify-center gap-3 @4xl:col-span-2">
      <svg viewBox="0 0 160 80" className="w-24 rotate-90 @4xl:w-full @4xl:rotate-0" aria-hidden="true">
        <path d="M6 40 H140" className="stroke-primary" strokeWidth={4} strokeLinecap="round" />
        <path
          d="M128 26 L148 40 L128 54"
          className="fill-none stroke-primary"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-center text-caption font-semibold text-primary">{label}</p>
      <p className="text-center text-caption text-muted-foreground">{note}</p>
    </div>
  );
}
