import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export interface TermCardProps {
  readonly n: number;
  readonly term: string;
  /** What the term is in the story, shown in the Chat app view. */
  readonly scene: string;
  readonly kind: string;
  readonly line: string;
  /** The term as files, shown in the Coding agent view; code, not translated. */
  readonly code: readonly string[];
  readonly focal?: boolean;
  readonly marker?: ReactNode;
}

/** The card's number, in primary on the focal card. */
function Badge({ n, focal }: { readonly n: number; readonly focal: boolean }) {
  return (
    <span
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-semibold',
        focal ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background',
      )}
    >
      {n}
    </span>
  );
}

/** The term as files, in the Coding agent view; code, not translated. */
function CodeLines({ code }: { readonly code: readonly string[] }) {
  return (
    <InView view="coding" as="div">
      <code
        translate="no"
        className="block rounded-md bg-foreground px-3 py-2 font-mono text-caption whitespace-pre-wrap text-background"
      >
        {code.join('\n')}
      </code>
    </InView>
  );
}

/**
 * Where the choice is made: one of the two places, numbered, with what it holds and what it does to the choice. Hover
 * raises the card and dims its neighbour; the project instructions are the focal card, ringed in primary.
 */
export function TermCard({ n, term, scene, kind, line, code, focal = false, marker }: TermCardProps) {
  return (
    <li
      data-term={n}
      className={cn(
        'focus-group__item card-hover card-hover--raise flex flex-col gap-2 rounded-xl bg-card p-4 text-card-foreground shadow-md',
        focal && 'ring-2 ring-primary',
      )}
    >
      <p className="flex items-center gap-2">
        <Badge n={n} focal={focal} />
        <span className="text-body font-semibold">{term}</span>
        {marker}
      </p>
      <InView view="chat" as="p" className="-mt-1 pl-9 text-caption text-muted-foreground">
        {scene}
      </InView>
      <p className="text-caption font-semibold text-muted-foreground">{kind}</p>
      <InView view="chat" as="p" className="text-body">
        {line}
      </InView>
      <CodeLines code={code} />
    </li>
  );
}

/** One pass-rate bar: a full 0–100 track, the rate filled, its value at the end. */
function PassRateBar({ value, lead }: { readonly value: number; readonly lead: boolean }) {
  return (
    <p className="flex items-center gap-2">
      <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="h-3 w-full" aria-hidden>
        <rect x={0} y={0} width={100} height={6} rx={3} className="fill-border" />
        <rect x={0} y={0} width={value} height={6} rx={3} className={lead ? 'fill-primary' : 'fill-muted-foreground'} />
      </svg>
      <span className="w-10 shrink-0 text-right text-caption font-semibold tabular-nums">{value}%</span>
    </p>
  );
}

/**
 * Vercel's agent evals as two pass-rate bars, each on a full 0–100 track with its value at the end: the skill by
 * default first, then with a line in `AGENTS.md` telling the agent to use it, in primary.
 */
export function VercelBars({
  rows,
}: {
  readonly rows: readonly { readonly slug: string; readonly value: number; readonly label: ReactNode }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map(({ slug, value, label }, index) => (
        <div key={slug} data-pass-rate={value}>
          <p className="text-caption">{label}</p>
          <PassRateBar value={value} lead={index === rows.length - 1} />
        </div>
      ))}
    </div>
  );
}
