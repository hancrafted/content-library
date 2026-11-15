import type { ReactNode } from 'react';

/**
 * The two forces across the levels as opposing wedges: risk of a wrong result widest at in, on the left, and speed
 * widest at out, on the right. Shades of `foreground`, no status colours.
 */
export function ForceWedges({
  risk,
  speed,
  marker,
}: {
  risk: { label: string; hint: string };
  speed: { label: string; hint: string };
  /** A Context marker beside the speed label. */
  marker?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <svg viewBox="0 0 1200 70" preserveAspectRatio="none" className="h-16 w-full" aria-hidden="true">
        <path d="M0 2L1200 30L0 30Z" className="fill-foreground/20" />
        <path d="M0 68L1200 40L1200 68Z" className="fill-foreground/60" />
      </svg>
      <div className="flex flex-col gap-1 text-caption @3xl:flex-row @3xl:justify-between">
        <span>
          <b className="font-semibold">{risk.label}</b> <span className="text-muted-foreground">{risk.hint}</span>
        </span>
        <span className="flex items-center gap-1 @3xl:justify-end">
          <span>
            <b className="font-semibold">{speed.label}</b> <span className="text-muted-foreground">{speed.hint}</span>
          </span>
          {marker}
        </span>
      </div>
    </div>
  );
}
