import { cn } from '@/shared/lib/utils';

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
