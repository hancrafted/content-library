import { cn } from '@/shared/lib/utils';

/** One row of a badge's facts, a term and its value. */
export interface BadgeFact {
  readonly slug: string;
  readonly term: string;
  readonly value: string;
}

export interface VisitorBadgeProps {
  /** Who wears it, top left: "Job 1", "Freelancer · AI", "New hire · You". */
  readonly job: string;
  /** The weekday, top right; a compact badge leaves it out. */
  readonly weekday?: string;
  /** The day the badge says, always "Day 1". */
  readonly day: string;
  /** What the job was, under a rule. */
  readonly task?: string;
  /** The front badge's facts. */
  readonly facts?: readonly BadgeFact[];
  /** Worn by AI: the `ai` ring and edge. A badge no AI wears stays neutral. */
  readonly ai: boolean;
  /** The one focal badge: raised, focusable, its day the `primary` pill. */
  readonly focus?: boolean;
  /** The section slide echo: no lanyard, no weekday, a smaller card. */
  readonly compact?: boolean;
  /** Placement only (width, rotation, opacity), set by the Scene. */
  readonly className?: string;
}

/** The lanyard over a full badge: in `foreground` on the front badge, in `border` behind it. */
function Lanyard({ focus }: { focus: boolean }) {
  return (
    <svg viewBox="0 0 160 56" className={focus ? 'w-32' : 'w-24'} aria-hidden="true">
      <path
        d="M24 0 L80 46 L136 0"
        className={cn('fill-none', focus ? 'stroke-foreground' : 'stroke-border')}
        strokeWidth="2"
      />
      <rect
        x="66"
        y="40"
        width="28"
        height="14"
        rx="4"
        className={cn(focus ? 'fill-card stroke-foreground' : 'fill-muted stroke-border')}
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** The card's top edge: the `ai` gradient on a badge AI wears, `foreground` on a neutral one. */
function Edge({ ai, focus }: { ai: boolean; focus: boolean }) {
  return (
    <div
      className={cn(
        focus ? 'h-2' : 'h-1.5',
        ai ? 'bg-linear-to-r from-ai via-ai/40 to-transparent' : 'bg-foreground',
        ai && !focus && 'opacity-70',
      )}
    />
  );
}

/** How a badge is drawn: the echo, the focal front badge, or one behind it. */
type Look = 'compact' | 'focus' | 'back';

function lookOf(focus: boolean, compact: boolean): Look {
  if (compact) return 'compact';
  return focus ? 'focus' : 'back';
}

const CARD: Record<Look, string> = {
  compact: 'rounded-xl shadow-sm',
  focus: 'rounded-2xl shadow-lg',
  back: 'rounded-2xl shadow-sm',
};
const BODY: Record<Look, string> = { compact: 'gap-1 p-3', focus: 'gap-4 p-6', back: 'gap-2 p-4' };

/** The day the badge says: the `primary` pill on the focal badge, plain type on the rest. */
function Day({ look, day }: { look: Look; day: string }) {
  if (look === 'focus') {
    return (
      <p className="flex items-center gap-3">
        <span className="rounded-full bg-primary px-5 py-1 text-heading font-semibold text-primary-foreground">
          {day}
        </span>
      </p>
    );
  }
  return (
    <p className={cn('font-semibold', look === 'compact' ? 'text-body' : 'text-subheading text-muted-foreground')}>
      {day}
    </p>
  );
}

/** The front badge's facts, each a term and its value under a rule. */
function Facts({ facts }: { facts: readonly BadgeFact[] }) {
  if (facts.length === 0) return null;
  return (
    <dl className="flex flex-col text-caption">
      {facts.map((fact) => (
        <div key={fact.slug} className="flex justify-between gap-4 border-t border-border py-2">
          <dt className="text-muted-foreground">{fact.term}</dt>
          <dd className="font-semibold">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The card itself: edge, job and weekday, the day, then the task or the facts. */
function Card({ look, ...badge }: Omit<VisitorBadgeProps, 'focus' | 'compact' | 'className'> & { look: Look }) {
  return (
    <div
      className={cn(
        'w-full overflow-hidden border border-border bg-card',
        CARD[look],
        badge.ai && 'shadow-ai/20 ring-1 ring-ai/40',
      )}
    >
      <Edge ai={badge.ai} focus={look === 'focus'} />
      <div className={cn('flex flex-col', BODY[look])}>
        <p className="flex justify-between gap-2 text-caption tracking-wide text-muted-foreground uppercase">
          <span>{badge.job}</span>
          {badge.weekday && <span>{badge.weekday}</span>}
        </p>
        <Day look={look} day={badge.day} />
        {badge.task && <p className="border-t border-border pt-2 text-caption text-muted-foreground">{badge.task}</p>}
        <Facts facts={badge.facts ?? []} />
      </div>
    </div>
  );
}

/**
 * The visitor badge (the Hero motif of onboard-ai-every-time): every badge says
 * Day 1, so it carries the person, the amnesia and "every time" at once. Plain
 * props, no kit: the Title slide wears three, two section slides one each.
 */
export function VisitorBadge({ focus = false, compact = false, className, ...badge }: VisitorBadgeProps) {
  const look = lookOf(focus, compact);
  if (look === 'compact') {
    return (
      <div className={className}>
        <Card look={look} {...badge} />
      </div>
    );
  }
  return (
    <div
      className={cn('flex flex-col items-center', focus && 'card-hover card-hover--raise', className)}
      {...(focus && { tabIndex: 0 })}
    >
      <Lanyard focus={focus} />
      <Card look={look} {...badge} />
    </div>
  );
}
