import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { counterTotals, type MoveSlug, type TraitSlug } from './counter-matrix.pure';
import styles from './manage-the-price.module.css';

interface MatrixMove {
  slug: MoveSlug;
  initial: string;
  rest: string;
  line: string;
  counters: readonly TraitSlug[];
  /** The Context marker beside the move's title. */
  marker: ReactNode;
  /** Marks the row as the element the move's Speaker notes explain. */
  target: TargetProps;
}

interface MatrixTrait {
  slug: TraitSlug;
  initial: string;
  rest: string;
}

interface CounterMatrixProps {
  moves: readonly MatrixMove[];
  traits: readonly MatrixTrait[];
  labels: {
    /** The table's accessible name. */
    table: string;
    /** The corner header: BRIEF counters PRICE. */
    corner: ReactNode;
    /** A tick's accessible name. */
    tick: string;
    /** The footer row's header. */
    foot: string;
    /** One footer cell: how many moves counter a trait. */
    count: (count: number) => ReactNode;
  };
}

/** A word with its first letter set off, so the five spell an acronym; an empty `initial` (German) sets nothing off. */
function Initialled({ initial, rest, className }: { initial: string; rest: string; className?: string }) {
  return (
    <span>
      {initial === '' ? null : <span className={className ?? 'font-semibold'}>{initial}</span>}
      {rest}
    </span>
  );
}

/** A move counters this trait: a filled primary disc with a check. */
function Tick({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('mx-auto size-7 rounded-full', styles.tick)} role="img" aria-label={label}>
      <circle cx="12" cy="12" r="10" className="fill-primary" />
      <path
        d="M7.5 12.5l3 3 6-6.5"
        className="fill-none stroke-primary-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** No tick: a dashed ring, so the empty cell still reads as part of the grid. */
function Empty() {
  return (
    <svg viewBox="0 0 24 24" className="mx-auto size-7" aria-hidden="true">
      <circle cx="12" cy="12" r="10" className="fill-none stroke-border" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

/**
 * The corner header, then one column header per trait, plain text like the move titles, since nothing in the head is a
 * control. Each takes two lines' height, so a name that wraps by word still lines up with the rest; the move column
 * takes a third, so on a wide board every name keeps one line.
 */
function MatrixHead({ traits, corner }: { traits: readonly MatrixTrait[]; corner: ReactNode }) {
  return (
    <thead>
      <tr>
        <th
          scope="col"
          className="w-1/3 pb-3 text-left align-bottom text-caption font-normal text-muted-foreground uppercase"
        >
          {corner}
        </th>
        {traits.map((trait) => (
          <th key={trait.slug} scope="col" className="pb-3 align-bottom font-normal">
            <span className="flex min-h-10 items-end justify-center text-center text-caption leading-tight">
              <Initialled initial={trait.initial} rest={trait.rest} />
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** One move: its bold title, the first letter in `primary`, over its sentence as the row header; then a tick or an empty ring per trait. */
function MatrixRow({ move, traits, tick }: { move: MatrixMove; traits: readonly MatrixTrait[]; tick: string }) {
  return (
    <tr {...move.target} className={cn('focus-group__item border-t border-border', styles.row)}>
      <th scope="row" className="py-3 pr-4 text-left align-middle font-normal @4xl:pr-8">
        <span className="flex items-center gap-1 text-body font-semibold">
          <Initialled initial={move.initial} rest={move.rest} className="text-primary" />
          {move.marker}
        </span>
        <span className="mt-0.5 block text-caption text-muted-foreground">{move.line}</span>
      </th>
      {traits.map((trait) => (
        <td key={trait.slug} className="px-1 py-3 text-center align-middle">
          {move.counters.includes(trait.slug) ? <Tick label={tick} /> : <Empty />}
        </td>
      ))}
    </tr>
  );
}

/** The footer: how many moves counter each trait, counted from the moves' `counters`. */
function MatrixFoot({ moves, traits, labels }: CounterMatrixProps) {
  const totals = counterTotals(moves);
  return (
    <tfoot>
      <tr className="border-t border-border">
        <th scope="row" className="pt-4 text-left text-caption font-normal text-muted-foreground">
          {labels.foot}
        </th>
        {traits.map((trait) => (
          <td key={trait.slug} className="px-1 pt-4 text-center text-caption text-muted-foreground tabular-nums">
            {labels.count(totals[trait.slug])}
          </td>
        ))}
      </tr>
    </tfoot>
  );
}

/**
 * The checklist board (Option 3c): the five BRIEF moves as rows, each title over its sentence, the five PRICE traits
 * as column headers, a tick wherever a move counters a trait, and a footer counting the moves per trait.
 * A real table with row and column headers, so it reads the same in print and to a screen reader. Pointing at a row
 * dims the others and outlines its ticks. Below `md` the board scrolls inside itself. A server part with plain props.
 */
export function CounterMatrix({ moves, traits, labels }: CounterMatrixProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-muted p-4 md:p-8', styles.board)}>
      <div className="overflow-x-auto">
        <table
          aria-label={labels.table}
          className="focus-group focus-group--dim-others w-full min-w-2xl table-fixed border-collapse md:min-w-0"
        >
          <MatrixHead traits={traits} corner={labels.corner} />
          <tbody>
            {moves.map((move) => (
              <MatrixRow key={move.slug} move={move} traits={traits} tick={labels.tick} />
            ))}
          </tbody>
          <MatrixFoot moves={moves} traits={traits} labels={labels} />
        </table>
      </div>
    </div>
  );
}
