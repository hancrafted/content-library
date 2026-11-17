import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { counterTotals, type MoveSlug, type TraitSlug } from './counter-matrix.pure';
import styles from './manage-the-price.module.css';

interface MatrixMove {
  slug: MoveSlug;
  initial: string;
  rest: string;
  line: string;
  counters: readonly TraitSlug[];
  marker: ReactNode;
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
    table: string;
    corner: ReactNode;
    tick: string;
    foot: string;
    count: (count: number) => ReactNode;
  };
}

type Acronym = 'data-move-initial' | 'data-trait-initial';

function Initialled(props: { initial: string; rest: string; acronym: Acronym; className?: string }) {
  const { initial, rest, acronym, className } = props;
  return (
    <span>
      <span {...{ [acronym]: '' }} className={className ?? 'font-semibold'}>
        {initial}
      </span>
      {rest}
    </span>
  );
}

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

function Empty() {
  return (
    <svg viewBox="0 0 24 24" className="mx-auto size-7" aria-hidden="true">
      <circle cx="12" cy="12" r="10" className="fill-none stroke-border" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

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
              <Initialled initial={trait.initial} rest={trait.rest} acronym="data-trait-initial" />
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
}

function MatrixRow({ move, traits, tick }: { move: MatrixMove; traits: readonly MatrixTrait[]; tick: string }) {
  return (
    <tr {...move.target} className={cn('focus-group__item border-t border-border', styles.row)}>
      <th scope="row" className="py-3 pr-4 text-left align-middle font-normal @4xl:pr-8">
        <span className="flex items-center gap-1 text-body font-semibold">
          <Initialled initial={move.initial} rest={move.rest} acronym="data-move-initial" className="text-primary" />
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
