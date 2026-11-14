import type { ReactNode } from 'react';

/** The three terms of a contract, in the reader's language. */
export interface ContractTerms {
  readonly receives: string;
  readonly delivers: string;
  readonly checkedBy: string;
}

export interface ContractCardProps {
  /** The card's label, such as "Contract at the seam". */
  readonly label: string;
  readonly terms: ContractTerms;
  /** What the task receives; a `<b>` run sets off a definition. */
  readonly receives: ReactNode;
  readonly delivers: string;
  readonly checkedBy: string;
}

/** The contract's three rows: each term and what the task agrees to under it. */
function Terms({
  terms,
  receives,
  delivers,
  checkedBy,
}: Pick<ContractCardProps, 'terms' | 'receives' | 'delivers' | 'checkedBy'>) {
  return (
    <dl className="grid grid-cols-3 gap-x-3 gap-y-1.5 text-caption">
      <dt className="font-semibold">{terms.receives}</dt>
      <dd className="col-span-2 text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">{receives}</dd>
      <dt className="font-semibold">{terms.delivers}</dt>
      <dd className="col-span-2 text-muted-foreground">{delivers}</dd>
      <dt className="font-semibold">{terms.checkedBy}</dt>
      <dd className="col-span-2 text-muted-foreground">{checkedBy}</dd>
    </dl>
  );
}

/**
 * The contract card: what a task receives, what it delivers and how someone else checks the result, agreed at the seam
 * between two tasks and leaving how the work is done to the task. The one primary-outlined card on the board.
 */
export function ContractCard({ label, ...terms }: ContractCardProps) {
  return (
    <div
      data-contract
      className="card-hover card-hover--raise flex flex-col gap-2 rounded-lg border-2 border-primary bg-card p-4 shadow-md"
    >
      <p data-contract-label className="text-caption font-semibold text-primary uppercase">
        {label}
      </p>
      <Terms {...terms} />
    </div>
  );
}
