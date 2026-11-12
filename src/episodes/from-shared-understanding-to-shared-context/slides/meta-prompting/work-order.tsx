import { DocumentIcon } from '@/episodes/components/slide-shared/factory-line/icons';
import type { ReactNode } from 'react';

export interface WorkOrderProps {
  readonly title: string;
  readonly rows: readonly { readonly slug: string; readonly term: string; readonly value: string }[];
  /** "Written from your answers", its Context marker beside it. */
  readonly source: ReactNode;
}

/** The one clean work order, in `primary`, its icon in `machine`: what the AI worker reads. Raises on hover. */
export function WorkOrder({ title, rows, source }: WorkOrderProps) {
  return (
    <article
      data-work-order
      className="card-hover card-hover--raise -rotate-1 rounded-lg border-2 border-primary bg-background p-5 shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-body font-semibold">{title}</p>
        <DocumentIcon tone="machine" className="h-7 w-6" />
      </div>
      <dl className="mt-3 grid grid-cols-4 gap-x-3 gap-y-2 text-caption">
        {rows.map(({ slug, term, value }) => (
          <div key={slug} className="contents">
            <dt className="font-semibold">{term}</dt>
            <dd className="col-span-3">{value}</dd>
          </div>
        ))}
      </dl>
      {source}
    </article>
  );
}
