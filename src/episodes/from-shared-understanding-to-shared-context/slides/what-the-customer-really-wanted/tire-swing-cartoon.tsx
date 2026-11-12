import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** The four panels of the tire swing cartoon this Slide pins up, left to right, top to bottom. */
export type Panel = 'explained' | 'understood' | 'built' | 'wanted';

/** The tree every panel shares: its crown, the ground, the trunk and the branch. */
const TREE = (
  <>
    <ellipse cx="36" cy="11" rx="34" ry="10" className="fill-muted-foreground/15" />
    <path d="M4 77H76" className="stroke-border" strokeWidth={2} />
    <path d="M16 77V12" className="stroke-foreground" strokeWidth={5} strokeLinecap="round" />
    <path d="M16 18H68" className="stroke-foreground" strokeWidth={3.5} strokeLinecap="round" />
  </>
);

/** What hangs from the branch in each panel: three seats, one short plank, a plank on the ground, the tire. */
const SWING: Record<Panel, ReactNode> = {
  explained: (
    <>
      <path d="M40 18V66M64 18V66" className="stroke-foreground" strokeWidth={1.5} />
      <path d="M36 38h32M36 52h32M36 66h32" className="stroke-foreground" strokeWidth={4} strokeLinecap="round" />
    </>
  ),
  understood: (
    <>
      <path d="M42 18V54" className="stroke-foreground" strokeWidth={1.5} />
      <path d="M12 56h34" className="stroke-foreground" strokeWidth={4} strokeLinecap="round" />
    </>
  ),
  built: (
    <>
      <path d="M42 18V74M62 18V74" className="stroke-foreground" strokeWidth={1.5} />
      <path d="M38 75h28" className="stroke-foreground" strokeWidth={4} strokeLinecap="round" />
    </>
  ),
  wanted: (
    <>
      <path d="M50 18V44" className="stroke-primary" strokeWidth={2} />
      <circle cx="50" cy="55" r="11" className="fill-none stroke-primary" strokeWidth={6} />
    </>
  ),
};

const PANELS: readonly Panel[] = ['explained', 'understood', 'built', 'wanted'];
const TILT: Record<Panel, string> = { explained: '-rotate-1', understood: 'rotate-1', built: 'rotate-1', wanted: '' };

/** One panel of the cartoon, a paper card tipped on the poster; the wanted swing ringed in `primary`. */
function CartoonCard({ panel, caption }: { panel: Panel; caption: string }) {
  const wanted = panel === 'wanted';
  return (
    <li
      data-cartoon-card={panel}
      className={cn(
        'focus-group__item card-hover card-hover--raise flex flex-col items-center gap-2 rounded-lg bg-card p-3 shadow-md',
        wanted ? 'border-2 border-primary' : 'border border-border',
        TILT[panel],
      )}
    >
      <svg viewBox="0 0 80 80" className="size-16" aria-hidden="true">
        {TREE}
        {SWING[panel]}
      </svg>
      <span className={cn('text-center text-caption', wanted ? 'font-semibold text-primary' : 'text-muted-foreground')}>
        {caption}
      </span>
    </li>
  );
}

/**
 * The tire swing cartoon as a poster of paper cards, the Hook's focal point: each station's own version of the swing,
 * and the last card, what the customer really wanted, ringed in `primary`. Pointing at a card dims the rest.
 */
export function TireSwingCartoon({
  heading,
  label,
  captions,
}: {
  heading: string;
  label: string;
  captions: Record<Panel, string>;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted p-6">
      <span className="text-caption text-muted-foreground uppercase">{heading}</span>
      <ol aria-label={label} className="focus-group focus-group--dim-others grid grid-cols-2 gap-4 px-1">
        {PANELS.map((panel) => (
          <CartoonCard key={panel} panel={panel} caption={captions[panel]} />
        ))}
      </ol>
    </div>
  );
}
