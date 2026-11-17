import { cn } from '@/shared/lib/utils';

export function OversightPill({
  label,
  former = false,
  className,
}: {
  label: string;
  former?: boolean;
  className?: string;
}) {
  return (
    <span
      data-oversight-pill
      data-former={former || undefined}
      className={cn(
        'w-fit rounded-full border-2 px-3 text-caption whitespace-nowrap',
        former ? 'border-dashed border-border text-muted-foreground' : 'border-foreground font-semibold',
        className,
      )}
    >
      {label}
    </span>
  );
}
