import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './slide.module.css';
import { SquarePicture, type PictureKind } from './square-picture';

export type SquareId = 'pp' | 'pg' | 'sp' | 'sg';
export type Care = 1 | 2 | 3 | 4;

interface Axis {
  readonly label: ReactNode;
  readonly hint: string;
  /** The `data-target` a note explains this head by, when one does. */
  readonly target?: { readonly 'data-target': string };
}

export interface Square {
  readonly id: SquareId;
  readonly care: Care;
  readonly careLabel: string;
  readonly head: ReactNode;
  readonly sub: string;
  readonly coding: { readonly head: ReactNode; readonly sub: ReactNode };
  readonly picture: PictureKind;
  /** The white label naming the picture's story object, in each view. */
  readonly label: { readonly chat: string; readonly coding: string };
  /** What else sits on the picture: the trip's label, the scribbled card, the owner tag. */
  readonly extras?: ReactNode;
  readonly focus?: boolean;
  readonly target?: { readonly 'data-target': string };
}

export interface SkillScopeMatrixProps {
  readonly label: string;
  readonly care: string;
  /** Who uses the skill: the rows, personal then shared. */
  readonly who: readonly [Axis, Axis];
  /** Where it is used: the columns, project-specific then general. */
  readonly where: readonly [Axis, Axis];
  /** The four squares, each placed in its row and column by its id. */
  readonly squares: readonly Square[];
}

const MAX_CARE = 4;

function Head({ axis, className }: { readonly axis: Axis; readonly className?: string }) {
  return (
    <div {...axis.target} className={cn('flex flex-col', className)}>
      <p className="flex items-center gap-1 text-body font-semibold">{axis.label}</p>
      <p className="text-caption text-muted-foreground">{axis.hint}</p>
    </div>
  );
}

function CareDots({ care, word, label }: { readonly care: Care; readonly word: string; readonly label: string }) {
  return (
    <p className="flex items-center justify-end gap-1 text-caption text-muted-foreground">
      <span aria-hidden>{word}</span>
      <span aria-hidden className="flex gap-0.5">
        {Array.from({ length: MAX_CARE }, (_, index) => (
          <span
            key={index}
            className={cn('size-2 rounded-full border border-foreground', index < care && 'bg-foreground')}
          />
        ))}
      </span>
      <span className="sr-only">{label}</span>
    </p>
  );
}

/** A square's words: where its details live, in the Chat app view, or where the skill is stored, in Coding agent. */
function SquareWords({ square }: { readonly square: Square }) {
  return (
    <div className="flex min-h-16 flex-col gap-1">
      <InView view="chat" as="p" className="flex items-start gap-1 text-body font-semibold">
        {square.head}
      </InView>
      <InView view="chat" as="p" className="text-caption text-muted-foreground">
        {square.sub}
      </InView>
      <InView view="coding" as="p" className="text-body font-semibold break-words">
        {square.coding.head}
      </InView>
      <InView view="coding" as="p" className="flex items-start gap-1 text-caption text-muted-foreground">
        {square.coding.sub}
      </InView>
    </div>
  );
}

function SquareCard({ square, care }: { readonly square: Square; readonly care: string }) {
  return (
    <article
      {...square.target}
      data-square={square.id}
      data-care={square.care}
      data-focus={square.focus ? '' : undefined}
      className={cn(
        styles.square,
        'focus-group__item card-hover--raise flex flex-col gap-3 rounded-xl border border-border p-3 text-card-foreground',
        square.focus && 'border-2 border-primary',
      )}
      style={{ '--care': square.care } as CSSProperties}
    >
      <CareDots care={square.care} word={care} label={square.careLabel} />
      <SquareWords square={square} />
      <SquarePicture kind={square.picture}>
        <p className="absolute top-2 left-2 rounded-full bg-card px-2 text-caption font-semibold text-card-foreground shadow-sm">
          <InView view="chat">{square.label.chat}</InView>
          <InView view="coding" className="font-mono">
            {square.label.coding}
          </InView>
        </p>
        {square.extras}
      </SquarePicture>
    </article>
  );
}

/** The card's one trip, from the notebook into the fleet manual; decoration, its meaning in the labels. */
function Trip() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn(styles.trip, 'pointer-events-none absolute inset-0 z-10 hidden size-full @2xl:block')}
    >
      <path
        d="M 44 41 C 56 41, 57 52, 57 64 S 60 86, 68 86"
        strokeWidth={2.5}
        strokeDasharray="7 6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The skill scope matrix of Option 18a: who uses a skill down the side, where across the top, each square leading
 * with where its details live, a small project picture beneath, and a primary tint that steps with care so the
 * diagonal reads before any word. The squares are a focus group, so the presenter can point at one.
 */
export function SkillScopeMatrix({ label, care, who, where, squares }: SkillScopeMatrixProps) {
  const square = (id: SquareId) => {
    const found = squares.find((candidate) => candidate.id === id);
    if (found === undefined) throw new Error(`The skill scope matrix has no square "${id}".`);
    return <SquareCard square={found} care={care} />;
  };
  return (
    <div
      role="group"
      aria-label={label}
      className="focus-group focus-group--dim-others relative isolate grid grid-cols-2 gap-3 rounded-2xl bg-muted p-3 @2xl:grid-cols-[8rem_1fr_1fr] @2xl:p-5"
    >
      <span aria-hidden className="hidden @2xl:block" />
      <Head axis={where[0]} className="items-center text-center" />
      <Head axis={where[1]} className="items-center text-center" />
      <Head axis={who[0]} className="col-span-2 @2xl:col-span-1 @2xl:items-end @2xl:self-center @2xl:text-right" />
      {square('pp')}
      {square('pg')}
      <Head axis={who[1]} className="col-span-2 @2xl:col-span-1 @2xl:items-end @2xl:self-center @2xl:text-right" />
      {square('sp')}
      {square('sg')}
      <Trip />
    </div>
  );
}
