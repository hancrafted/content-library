import { cn } from '@/shared/lib/utils';

/* The Guide's eight steps; this Slide is step 7, so six are finished and the seventh is under way. */
const TOTAL = 8;
const DONE = 6;

/**
 * The Visual language's "Step and progress": a quiet pill "Step 7 of 8" and a thin eight-segment rail, the finished
 * segments in `primary`, the current one half-filled. The rail repeats the pill, so assistive tech skips it.
 */
export function StepProgress({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-caption font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-1 gap-1" aria-hidden>
        {Array.from({ length: TOTAL }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full',
              index < DONE ? 'bg-primary' : index === DONE ? 'bg-primary/40' : 'bg-border',
            )}
          />
        ))}
      </div>
    </div>
  );
}
