import type { ReactNode } from 'react';
import type { BackLabels, FlipRow } from './trait-flip-row.client';
import { TraitFlip } from './trait-flip.client';

interface PriceMirrorProps {
  columns: { freelancer: string; traits: string; ai: string };
  rows: readonly FlipRow[];
  closing: string;
  closingMarker: ReactNode;
  labels: BackLabels;
}

/** The column heads: the freelancer on a neutral pill, the AI on the one `ai` pill, the five traits between them. */
function ColumnHeads({ columns }: Pick<PriceMirrorProps, 'columns'>) {
  return (
    <div className="flex gap-3">
      <p className="flex flex-1 basis-0 items-center justify-center gap-2 rounded-full border border-border bg-muted py-2 text-body font-semibold">
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
          <circle cx="8" cy="5.5" r="2.75" className="fill-none stroke-foreground" strokeWidth="1.4" />
          <path
            d="M2.75 14c.6-3 2.7-4.5 5.25-4.5s4.65 1.5 5.25 4.5"
            className="fill-none stroke-foreground"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        {columns.freelancer}
      </p>
      <p className="hidden w-60 shrink-0 self-center text-center text-caption tracking-wide text-muted-foreground uppercase @3xl:block">
        {columns.traits}
      </p>
      <p className="flex flex-1 basis-0 items-center justify-center gap-2 rounded-full border border-ai/50 bg-ai/10 py-2 text-body font-semibold text-ai">
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
          <path d="M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8 6.6 6.6Z" className="fill-ai" />
        </svg>
        {columns.ai}
      </p>
    </div>
  );
}

/**
 * The PRICE mirror (Spec Option 2a, after the design reference's page 1): the freelancer left, the five trait chips
 * down the centre spelling P R I C E, the AI right on its soft `ai` edge, one list item per row so a screen reader
 * reads trait, freelancer and AI together; the closing line under it. The trait flip makes it presentable.
 */
export function PriceMirror({ columns, rows, closing, closingMarker, labels }: PriceMirrorProps) {
  return (
    <div className="@container flex flex-col gap-8">
      <ColumnHeads columns={columns} />
      <TraitFlip rows={rows} closing={closing} closingMarker={closingMarker} labels={labels} />
    </div>
  );
}
