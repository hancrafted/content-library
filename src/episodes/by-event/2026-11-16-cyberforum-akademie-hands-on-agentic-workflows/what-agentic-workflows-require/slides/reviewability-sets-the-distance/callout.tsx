import { cn } from '@/shared/lib/utils';

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
