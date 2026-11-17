import { cn } from '@/shared/lib/utils';

/**
 * A numbered callout: the same number on a link of the chain and on the part of the board that proves it, so the
 * reader matches claim to proof by position (decision page "chain to board", Option B).
 */
export function Callout({ n, className }: { n: 1 | 2 | 3; className?: string }) {
  return (
    <span
      data-callout
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-caption font-semibold text-background',
        className,
      )}
    >
      {n}
    </span>
  );
}
