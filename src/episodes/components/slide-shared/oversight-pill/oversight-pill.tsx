import { cn } from '@/shared/lib/utils';

/**
 * The shared oversight pill of the Visual language: an outline pill naming how far a person steps out of the loop for
 * a task ("In the loop", "On the loop", "Out of the loop"), the same wherever a level is shown. A `former` pill is the
 * level a task held before, dashed and muted.
 */
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
