import { externalHref } from '@/shared/lib/external-link.pure';
import type { ReactNode } from 'react';
import type { LevelWords } from './ai-capability.types';

export interface CardLabels {
  readonly definition: string;
  readonly flip: string;
  readonly source: string;
  readonly newTab: string;
}

export const TURN = (
  <svg viewBox="0 0 24 24" className="size-3.5 fill-none stroke-current" strokeWidth="2" aria-hidden="true">
    <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FRONT =
  'flex h-full flex-col gap-1 rounded-2xl border px-4 py-3 transition-[box-shadow,border-color] duration-300';

export function CardFrontView(props: {
  readonly words: LevelWords;
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

export type Defined = Pick<LevelWords, 'definition' | 'sourceLabel' | 'sourceUrl'>;

export function CardBackView(props: {
  readonly words: Defined;
  readonly labels: CardLabels;
  readonly marker?: ReactNode;
  readonly sourceMarker?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-1 rounded-2xl bg-foreground px-4 py-3 text-background">
      {props.marker && <span className="absolute top-2 right-2 z-10">{props.marker}</span>}
      <p className={`text-caption ${props.marker ? 'pr-7' : ''}`}>
        <span className="font-semibold text-(--tone)">{props.labels.definition}:</span> {props.words.definition}
      </p>
      <p className="relative z-10 mt-auto flex items-center gap-1.5 text-caption">
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
        {props.sourceMarker}
      </p>
    </div>
  );
}
