import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const TILT = { left: '-rotate-2', right: 'rotate-1', none: '' } as const;

/** What holds a note to the board: a tape strip, or on the emphasised note a pin. */
function Fastener({ pinned }: { pinned: boolean }) {
  return pinned ? (
    <span
      aria-hidden="true"
      className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-foreground shadow-md ring-2 ring-card"
    />
  ) : (
    <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-3 bg-foreground/10" />
  );
}

interface NoteProps {
  index: string;
  title: string;
  body: ReactNode;
  tilt: keyof typeof TILT;
  emphasis?: boolean;
  className?: string;
  children?: ReactNode;
  'data-target'?: string;
}

/** A note on the board: taped down, or with `emphasis` filled in `primary`, pinned and titled larger. */
export function Note({ index, title, body, tilt, emphasis = false, className, children, ...target }: NoteProps) {
  const fill = emphasis ? 'bg-primary p-8 text-primary-foreground shadow-xl' : 'bg-card p-6 shadow-md';
  return (
    <article
      {...target}
      className={cn('focus-group__item relative rounded-md break-words', TILT[tilt], fill, className)}
    >
      <Fastener pinned={emphasis} />
      <p
        aria-hidden="true"
        className={cn(
          'text-subheading leading-none font-semibold',
          emphasis ? 'text-primary-foreground/40' : 'text-muted-foreground/40',
        )}
      >
        {index}
      </p>
      <h4 className={cn('mt-3 font-semibold', emphasis ? 'text-heading leading-none' : 'text-body')}>{title}</h4>
      <p className={emphasis ? 'mt-4 text-body text-primary-foreground/80' : 'mt-2 text-caption text-muted-foreground'}>
        {body}
      </p>
      {children}
    </article>
  );
}
