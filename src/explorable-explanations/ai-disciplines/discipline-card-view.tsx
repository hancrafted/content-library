import { externalHref } from '@/shared/lib/external-link.pure';
import type { ReactNode } from 'react';
import type { DisciplineWords } from './ai-disciplines.types';

/** The labels both faces of every card share. */
export interface CardLabels {
  readonly definition: string;
  readonly flip: string;
  readonly source: string;
  readonly newTab: string;
}

/** A card's front (a pure view): the stage's name, its one line and the hint that it turns; a Slide's marker on top. */
export function CardFrontView(props: {
  readonly words: DisciplineWords;
  readonly labels: CardLabels;
  readonly marker?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-1.5 rounded-2xl border border-border border-t-4 border-t-(--tone) bg-card p-4">
      <p className="text-body font-semibold text-(--tone)">{props.words.name}</p>
      <p className="text-body text-foreground">{props.words.line}</p>
      <p className="mt-auto text-caption text-muted-foreground">{props.labels.flip}</p>
      {props.marker && <span className="absolute top-2 right-2 z-10">{props.marker}</span>}
    </div>
  );
}

/** What a card's back shows: a definition and its source. */
export type Defined = Pick<DisciplineWords, 'definition' | 'sourceLabel' | 'sourceUrl'>;

/** A card's back (a pure view): the definition and the source it is taken from, opening in a new tab. */
export function CardBackView(props: { readonly words: Defined; readonly labels: CardLabels }) {
  return (
    <div className="flex h-full flex-col gap-1.5 rounded-2xl border border-(--tone) bg-card p-4">
      <p className="text-caption font-semibold tracking-widest text-(--tone) uppercase">{props.labels.definition}</p>
      <p className="text-body text-foreground">{props.words.definition}</p>
      <p className="relative z-10 mt-auto text-caption text-muted-foreground">
        {props.labels.source}:{' '}
        <a
          href={externalHref(props.words.sourceUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          {props.words.sourceLabel}
          <span className="sr-only"> ({props.labels.newTab})</span>
        </a>
      </p>
    </div>
  );
}
