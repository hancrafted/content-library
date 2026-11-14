import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** One cost line: a benefit in full ink with a plus, a cost in muted ink with a minus. */
export interface Cost {
  readonly good: boolean;
  readonly text: ReactNode;
}

export interface HomeCardProps {
  readonly n: string;
  readonly term: string;
  /** Where the home sits in the story, in the Chat app view. */
  readonly scene: string;
  readonly load: Cost;
  readonly fit: Cost;
  readonly rows: { readonly load: string; readonly fit: string };
  readonly marks: { readonly cost: string; readonly benefit: string };
  /** The file, when it is read and the lines that hold the depth, in the Coding agent view; code is never translated. */
  readonly coding: { readonly path: string; readonly lead: string; readonly code: readonly (readonly string[])[] };
}

function Mark({ good, label }: { readonly good: boolean; readonly label: string }) {
  return (
    <>
      <svg viewBox="0 0 16 16" aria-hidden className="mt-1 size-4 shrink-0">
        {good ? (
          <>
            <circle cx={8} cy={8} r={7} className="fill-foreground" />
            <path d="M4.5 8h7M8 4.5v7" strokeWidth={2} className="stroke-card" />
          </>
        ) : (
          <>
            <circle cx={8} cy={8} r={6.25} strokeWidth={1.5} className="fill-none stroke-current" />
            <path d="M4.5 8h7" strokeWidth={2} className="stroke-current" />
          </>
        )}
      </svg>
      <span className="sr-only">{label}</span>
    </>
  );
}

function Row({
  label,
  cost,
  marks,
}: {
  readonly label: string;
  readonly cost: Cost;
  readonly marks: HomeCardProps['marks'];
}) {
  return (
    <p className={cn('flex items-start gap-2 text-body', cost.good ? 'text-foreground' : 'text-muted-foreground')}>
      <Mark good={cost.good} label={cost.good ? marks.benefit : marks.cost} />
      <span>
        <span data-row-label className="block text-caption font-semibold text-muted-foreground uppercase">
          {label}
        </span>
        {cost.text}
      </span>
    </p>
  );
}

/** Where the home sits: in the story for the Chat app view, or the file and its lines for the Coding agent view. */
function Where({ scene, coding }: Pick<HomeCardProps, 'scene' | 'coding'>) {
  return (
    <div className="min-w-0">
      <InView view="chat" as="p" className="pl-10 text-caption text-muted-foreground">
        {scene}
      </InView>
      <InView view="coding" as="div" className="flex flex-col gap-1">
        <p data-file-path translate="no" className="font-mono text-caption font-semibold break-all">
          {coding.path}
        </p>
        <p className="text-caption text-muted-foreground">{coding.lead}</p>
        {coding.code.map((lines, index) => (
          <code
            translate="no"
            key={index}
            className="mt-1 block rounded-md bg-foreground px-3 py-2 font-mono text-caption whitespace-pre-wrap text-background"
          >
            {lines.join('\n')}
          </code>
        ))}
      </InView>
    </div>
  );
}

/**
 * One of the three homes for the depth (Spec Option 14a's `HomeCard`): its pin number and AI term, where it sits in
 * the story or which file holds it, then its two plain costs across two fixed rows, "When loaded" and "Fits", which
 * line up across the three cards. No home wins: no card is ringed. A `focus-group__item`, so pointing at one while
 * presenting dims the other two.
 */
export function HomeCard({ n, term, scene, load, fit, rows, marks, coding }: HomeCardProps) {
  return (
    <li
      data-home
      className="focus-group__item card-hover card-hover--raise grid gap-3 rounded-xl bg-card p-5 text-card-foreground shadow-md @3xl:row-span-4 @3xl:grid-rows-subgrid"
    >
      <p className="flex items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-caption font-semibold text-background">
          {n}
        </span>
        <span data-term className="text-body font-semibold">
          {term}
        </span>
      </p>
      <Where scene={scene} coding={coding} />
      <Row label={rows.load} cost={load} marks={marks} />
      <Row label={rows.fit} cost={fit} marks={marks} />
    </li>
  );
}
