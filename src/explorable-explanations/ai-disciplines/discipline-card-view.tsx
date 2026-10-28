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

/** The turn icon beside the hint: the card turns over on a click. */
const TURN = (
  <svg viewBox="0 0 24 24" className="size-3.5 fill-none stroke-current" strokeWidth="2" aria-hidden="true">
    <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FRONT = 'flex h-full flex-col gap-1.5 rounded-2xl border p-4 transition-[box-shadow,border-color] duration-300';

/**
 * A card's front (a pure view): the stage's name, its one line and the hint that it turns, with a Slide's marker on top.
 * Lit, it takes its colour and a shadow (its column lifts the card); an emerging stage is drawn dashed, its shape not settled yet.
 */
export function CardFrontView(props: {
  readonly words: DisciplineWords;
  readonly labels: CardLabels;
  readonly lifted: boolean;
  readonly emerging: boolean;
  readonly marker?: ReactNode;
}) {
  const shape = props.emerging ? 'border-dashed bg-transparent' : 'bg-card';
  const lift = props.lifted ? 'border-(--tone) shadow-lg' : 'border-border';
  return (
    <div className={`${FRONT} ${shape} ${lift} motion-reduce:transition-none`}>
      <p className="text-body font-semibold text-(--tone)">{props.words.name}</p>
      <p className="text-body text-foreground">{props.words.line}</p>
      <p className="mt-auto flex items-center gap-1.5 text-caption text-muted-foreground">
        {props.labels.flip}
        {TURN}
      </p>
      {props.marker && <span className="absolute top-2 right-2 z-10">{props.marker}</span>}
    </div>
  );
}

/** What a card's back shows: a definition and its source. */
export type Defined = Pick<DisciplineWords, 'definition' | 'sourceLabel' | 'sourceUrl'>;

/** A card's back (a pure view): the definition and the source it is taken from, opening in a new tab. */
export function CardBackView(props: { readonly words: Defined; readonly labels: CardLabels }) {
  return (
    <div className="flex h-full flex-col gap-1.5 rounded-2xl bg-foreground p-4 text-background">
      <p className="text-caption font-semibold tracking-widest text-(--tone) uppercase">{props.labels.definition}</p>
      <p className="text-body">{props.words.definition}</p>
      <p className="relative z-10 mt-auto text-caption">
        <a
          href={externalHref(props.words.sourceUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2"
        >
          {props.labels.source}: {props.words.sourceLabel}
          <span aria-hidden="true"> ↗</span>
          <span className="sr-only"> ({props.labels.newTab})</span>
        </a>
      </p>
    </div>
  );
}
