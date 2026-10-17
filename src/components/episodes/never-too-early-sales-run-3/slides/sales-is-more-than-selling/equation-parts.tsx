import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const STROKES = {
  plus: { d: 'M40 14 C 41 30, 39 50, 40 66 M14 41 C 30 39, 50 41, 66 40', stroke: 'stroke-foreground' },
  equals: { d: 'M12 30 C 30 28, 50 31, 68 29 M12 52 C 30 50, 50 53, 68 51', stroke: 'stroke-primary' },
} as const;

/** A marker-drawn plus or equals between the notes; the sentence it stands for is the board's hidden label. */
export function Operator({ symbol, className }: { symbol: keyof typeof STROKES; className?: string }) {
  const { d, stroke } = STROKES[symbol];
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <path d={d} className={cn('fill-none', stroke)} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

/** The brace gathering the two insight notes under one pill. */
export function Brace({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn('flex-col items-center', className)}>
      <svg viewBox="0 0 600 40" className="w-full" aria-hidden="true">
        <path
          d="M10 6 C 10 22, 20 22, 40 22 H270 C 290 22, 300 26, 300 38 C 300 26, 310 22, 330 22 H560 C 580 22, 590 22, 590 6"
          className="fill-none stroke-foreground"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-2 rounded-full bg-foreground px-5 py-1.5 text-caption font-semibold text-background">{label}</p>
    </div>
  );
}

/** The caveat on the equals: a curved arrow up at it and the note beside. */
export function MarginNote({ text, className }: { text: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-center gap-3 pt-2', className)}>
      <svg
        viewBox="0 0 60 50"
        className="w-12 shrink-0 fill-none stroke-muted-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M54 44 C 30 44, 12 34, 8 8" />
        <path d="M2 16 L8 6 L15 14" />
      </svg>
      <p className="pt-6 text-caption text-muted-foreground italic">{text}</p>
    </div>
  );
}
