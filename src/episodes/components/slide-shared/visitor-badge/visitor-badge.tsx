import { cn } from '@/shared/lib/utils';

export interface BadgeFact {
  readonly slug: string;
  readonly term: string;
  readonly value: string;
}

export interface VisitorBadgeProps {
  readonly job: string;
  readonly weekday?: string;
  readonly day: string;
  readonly task?: string;
  readonly facts?: readonly BadgeFact[];
  readonly ai: boolean;
  readonly focus?: boolean;
  readonly compact?: boolean;
  readonly className?: string;
}

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

function Card({ look, ...badge }: Omit<VisitorBadgeProps, 'focus' | 'compact' | 'className'> & { look: Look }) {
  return (
    <div
      data-tone-flip
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
