import type { ReactNode } from 'react';

/** The definition's open term, set apart in a dashed chip: the phrase, the question it leaves and its Context markers. */
export function MinimalChip(props: { readonly term: string; readonly question: string; readonly markers: ReactNode }) {
  return (
    <p
      data-minimal-chip=""
      className="flex flex-wrap items-center gap-2 rounded-3xl border border-dashed border-muted-foreground px-4 py-1.5 text-caption text-muted-foreground"
    >
      <span className="font-semibold text-foreground">{props.term}</span>
      <span>{props.question}</span>
      <span className="flex items-center gap-1">{props.markers}</span>
    </p>
  );
}
