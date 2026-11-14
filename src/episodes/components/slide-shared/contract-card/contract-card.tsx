import { MarkIcon } from '@/episodes/components/slide-shared/party-board/sticky-note';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/*
 * The contract card, the Episode's one contract component: what a task receives, what it delivers and how someone
 * else checks the result, agreed at the seam between two tasks and leaving how the work is done to the task. It owns
 * no words; each Slide passes its own.
 *
 * Two variants, told apart by their props:
 * - the terms variant (`terms`, `receives`, `delivers`, `checkedBy`): `size: 'full'` (the default) draws a `bg-primary`
 *   header strip with an optional `tag` and the `how` below the lines; `size: 'compact'` draws a primary-outlined card
 *   small enough to pin to a seam on a board, with neither; `size: 'note'` draws the smallest card, set under a board
 *   note, its terms inline, an optional label and `how`, and filled with `primary` where the Scene leads the eye.
 *   A card that names no `receives` leaves its Receives line out.
 * - the check variant (`checks`, `marks`): the contract read back against a result, each line ticked when it passed
 *   and crossed when it failed.
 */

/** The three terms of a contract, in the reader's language. */
export interface ContractTerms {
  readonly receives: string;
  readonly delivers: string;
  readonly checkedBy: string;
}

interface ContractCardBase {
  /** The header strip's text, or the compact card's label: "Contract · Food & drinks → the venue's kitchen". */
  readonly heading: string;
}

/** The lines every terms card agrees to. */
interface ContractLines {
  readonly terms: ContractTerms;
  /** What the task receives; a `<b>` run sets off a definition. Without it the card has no Receives line. */
  readonly receives?: ReactNode;
  readonly delivers: ReactNode;
  readonly checkedBy: ReactNode;
  /** The how, left to the task, below the lines. */
  readonly how?: ReactNode;
  /** A node set beside a term, such as a Context marker. */
  readonly termMarkers?: Partial<Record<keyof ContractTerms, ReactNode>>;
}

export interface ContractTermsProps extends ContractCardBase, ContractLines {
  readonly size?: 'full' | 'compact';
  /** The full card's label at the strip's right end, such as "The seam". */
  readonly tag?: string;
}

/** The note card: the smallest terms card, set under a board note. */
export interface ContractNoteProps extends ContractLines {
  readonly size: 'note';
  /** A label over the lines, such as the seam it sits on: "Plan → Requirements". */
  readonly heading?: string;
  /** The card the Scene leads the eye to: the Slide's one `primary` fill. */
  readonly filled?: boolean;
}

/** One line of a contract read back against a result. */
export interface ContractCheck {
  readonly label: string;
  readonly passed: boolean;
}

export interface ContractChecksProps extends ContractCardBase {
  readonly checks: readonly ContractCheck[];
  /** The accessible names of the tick and the cross. */
  readonly marks: { readonly passed: string; readonly failed: string };
}

export type ContractCardProps = ContractTermsProps | ContractNoteProps | ContractChecksProps;

const TERM_KEYS = ['receives', 'delivers', 'checkedBy'] as const;

/** The terms a card draws: each one it was given a line for. */
const keysOf = (lines: ContractLines) => TERM_KEYS.filter((key) => lines[key] !== undefined);

/** The full card's three rows, a term beside what the task agrees to under it. */
function FullTerms(props: ContractTermsProps) {
  return (
    <dl className="flex flex-col divide-y divide-border px-5">
      {keysOf(props).map((key) => (
        <div key={key} className="grid grid-cols-4 gap-4 py-3">
          <dt
            data-contract-term
            className="flex flex-wrap items-center gap-1 text-caption text-muted-foreground uppercase"
          >
            {props.terms[key]}
            {props.termMarkers?.[key]}
          </dt>
          <dd className={cn('col-span-3 text-body [&_b]:font-semibold', key === 'delivers' && 'font-semibold')}>
            {props[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The compact card's three rows, in caption size. */
function CompactTerms(props: ContractTermsProps) {
  return (
    <dl className="grid grid-cols-3 gap-x-3 gap-y-1.5 text-caption">
      {keysOf(props).map((key) => (
        <div key={key} className="contents">
          <dt data-contract-term className="font-semibold">
            {props.terms[key]}
            {props.termMarkers?.[key]}
          </dt>
          <dd className="col-span-2 text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">{props[key]}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The compact card: a primary outline and label, small enough to pin to a seam on a board. */
function CompactCard(props: ContractTermsProps) {
  return (
    <div
      data-contract
      className="card-hover card-hover--raise flex flex-col gap-2 rounded-lg border-2 border-primary bg-card p-4 shadow-md"
    >
      <p data-contract-label className="text-caption font-semibold text-primary uppercase">
        {props.heading}
      </p>
      <CompactTerms {...props} />
    </div>
  );
}

/** The full card's header strip: its heading and, at the right end, its tag. The card's one `bg-primary` fill. */
function Strip({ heading, tag }: Pick<ContractTermsProps, 'heading' | 'tag'>) {
  return (
    <div
      data-contract-strip
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-primary px-5 py-3 text-primary-foreground"
    >
      <span data-contract-label className="text-body font-semibold">
        {heading}
      </span>
      {tag !== undefined && (
        <span data-contract-tag className="shrink-0 text-caption uppercase">
          {tag}
        </span>
      )}
    </div>
  );
}

/** The full card: the header strip, the three rows and the how below a dashed rule. */
function FullCard(props: ContractTermsProps) {
  return (
    <div
      data-contract
      className="card-hover card-hover--raise flex flex-col overflow-hidden rounded-lg bg-card shadow-md"
    >
      <Strip heading={props.heading} tag={props.tag} />
      <FullTerms {...props} />
      {props.how !== undefined && (
        <p
          data-contract-how
          className="border-t border-dashed border-border px-5 py-3 text-caption text-muted-foreground"
        >
          {props.how}
        </p>
      )}
    </div>
  );
}

/** The note card's look: `primary` filled where the Scene leads the eye, else a plain outlined card. */
const noteLookOf = (filled: boolean) =>
  filled
    ? { card: 'bg-primary text-primary-foreground shadow-md', muted: 'text-primary-foreground' }
    : { card: 'border border-border bg-card', muted: 'text-muted-foreground' };

/** The note card: an optional label, each term inline before its line, the checked-by line and the how muted. */
function NoteCard(props: ContractNoteProps) {
  const look = noteLookOf(props.filled === true);
  return (
    <div data-contract className={cn('flex flex-col gap-0.5 rounded-md p-2 text-caption', look.card)}>
      {props.heading !== undefined && (
        <p data-contract-label className="font-semibold">
          {props.heading}
        </p>
      )}
      <dl className="flex flex-col gap-0.5">
        {keysOf(props).map((key) => (
          <div key={key} className={cn(key === 'checkedBy' && look.muted)}>
            <dt data-contract-term className="inline font-semibold">
              {props.terms[key]}
              {props.termMarkers?.[key]}
            </dt>{' '}
            <dd className="inline">{props[key]}</dd>
          </div>
        ))}
      </dl>
      {props.how !== undefined && (
        <p data-contract-how className={look.muted}>
          {props.how}
        </p>
      )}
    </div>
  );
}

function ChecksCard({ heading, checks, marks }: ContractChecksProps) {
  return (
    <div data-contract className="flex flex-1 flex-col overflow-hidden rounded-lg bg-card shadow-md">
      <p data-contract-label className="border-b border-border px-5 py-3 text-body font-semibold">
        {heading}
      </p>
      <ul className="flex flex-col divide-y divide-border px-5">
        {checks.map(({ label, passed }) => (
          <li
            key={label}
            data-contract-check
            data-passed={passed}
            className="flex items-center justify-between gap-4 py-3 text-body"
          >
            <span data-check-label>{label}</span>
            <MarkIcon mark={passed ? 'passed' : 'failed'} label={passed ? marks.passed : marks.failed} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The contract card. The terms variant is the card a Slide pins to a seam; it lifts on hover, so a presenter can raise
 * it while reading its lines. The check variant sits still, read beside what it checks.
 */
export function ContractCard(props: ContractCardProps) {
  if ('checks' in props) return <ChecksCard {...props} />;
  if (props.size === 'note') return <NoteCard {...props} />;
  return props.size === 'compact' ? <CompactCard {...props} /> : <FullCard {...props} />;
}
