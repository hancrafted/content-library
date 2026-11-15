import { cn } from '@/shared/lib/utils';

/**
 * A numbered pin: a dark disc that ties a part of a Scene to the numbered line of its legend, dark like the Style's pill
 * labels. The Scene places it, `absolute` on a part's corner or in the flow beside a word.
 */
export function Pin({ n, className }: { n: number; className?: string }) {
  return (
    <span
      data-pin={n}
      className={cn(
        'grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-caption font-semibold text-background',
        className,
      )}
    >
      {n}
    </span>
  );
}
