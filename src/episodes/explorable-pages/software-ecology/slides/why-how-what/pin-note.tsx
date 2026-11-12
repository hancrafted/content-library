import type { TargetProps } from '@/shared/lib/context-link.pure';
import { useId, type ReactNode } from 'react';
import { PinNumber } from './pin-number';

export interface PinNoteProps {
  readonly n: number;
  readonly slug: 'why' | 'how' | 'what';
  readonly word: string;
  readonly title: string;
  readonly caption: ReactNode;
  readonly targetProps?: TargetProps;
}

/** One numbered answer beside the still: its pin's number and word, the claim, then the caption with its markers. */
export function PinNote({ n, slug, word, title, caption, targetProps }: PinNoteProps) {
  const id = `pin-note-${useId()}`;
  return (
    <article
      {...targetProps}
      data-column={slug}
      aria-labelledby={id}
      className="focus-group__item card-hover card-hover--raise flex flex-col gap-2 rounded-xl p-2"
    >
      <p className="flex items-center gap-2">
        <PinNumber n={n} />
        <span className="text-caption font-semibold text-muted-foreground uppercase">{word}</span>
      </p>
      <h4 id={id} className="text-body font-semibold text-balance text-foreground">
        {title}
      </h4>
      <p className="text-body text-pretty text-muted-foreground">{caption}</p>
    </article>
  );
}
