import { cn } from '@/lib/utils';

/** One story's copy, resolved from the catalog on the server; plain data so it crosses to the client. */
export interface StoryCardCopy {
  id: string;
  title: string;
  caption: string;
  labels: string[];
  pain: string;
  shift: string;
  statValue: number;
  statDecimals: number;
  statUnit: string;
  statLabel: string;
}

export interface PairLabels {
  pain: string;
  shift: string;
}

/** Cards share an anatomy but not a layout: odd cards lead with the stat, even cards with the story. */
export type CardVariant = 'stat-first' | 'story-first';

function StatCallout({ value, story }: { value: string; story: StoryCardCopy }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1.5 font-mono tabular-nums text-foreground">
        <span className="text-4xl font-bold tracking-tight sm:text-5xl">{value}</span>
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{story.statUnit}</span>
      </div>
      <p className="text-xs leading-snug text-muted-foreground">{story.statLabel}</p>
    </div>
  );
}

function PainShift({ story, pair }: { story: StoryCardCopy; pair: PairLabels }) {
  const term = 'font-mono text-[0.6rem] uppercase tracking-widest';
  return (
    <dl className="flex flex-col gap-3 text-sm leading-relaxed">
      <div>
        <dt className={cn(term, 'text-muted-foreground')}>{pair.pain}</dt>
        <dd className="text-muted-foreground">{story.pain}</dd>
      </div>
      <div className="border-l-2 border-[var(--highlight-target)] pl-3">
        <dt className={cn(term, 'text-[var(--highlight-target)]')}>{pair.shift}</dt>
        <dd className="font-medium text-foreground">{story.shift}</dd>
      </div>
    </dl>
  );
}

function CardHead({ story }: { story: StoryCardCopy }) {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {story.labels.map((label) => (
          <span
            key={label}
            className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>
      <h3 className="text-lg font-bold leading-snug tracking-tight text-foreground">{story.title}</h3>
      <p className="font-mono text-xs text-muted-foreground">{story.caption}</p>
    </header>
  );
}

interface StoryCardProps {
  story: StoryCardCopy;
  stat: string;
  pair: PairLabels;
  variant: CardVariant;
}

/** A story card: stands on its own, so the stat and the before/after pair read without the grid around it. */
export function StoryCard({ story, stat, pair, variant }: StoryCardProps) {
  const statFirst = variant === 'stat-first';
  return (
    <div
      className={cn(
        'flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm',
        statFirst && 'border-l-4 border-l-foreground/80',
      )}
    >
      {statFirst && <StatCallout value={stat} story={story} />}
      <CardHead story={story} />
      <PainShift story={story} pair={pair} />
      {!statFirst && (
        <div className="mt-auto border-t border-dashed border-border pt-4">
          <StatCallout value={stat} story={story} />
        </div>
      )}
    </div>
  );
}
