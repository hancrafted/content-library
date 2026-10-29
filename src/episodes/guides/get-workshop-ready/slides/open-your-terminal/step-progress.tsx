import { cn } from '@/shared/lib/utils';

/** The Visual language's step pill, "Step n of 8", and the thin rail beside it, the finished segments in `primary`. */
export function StepProgress({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <>
      <span
        data-step-pill
        className="shrink-0 rounded-full border border-border bg-card px-4 py-1.5 text-caption font-semibold"
      >
        {label}
      </span>
      <div data-rail className="flex min-w-32 flex-1 gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            {...(index < step && { 'data-done': '' })}
            className={cn('h-1.5 flex-1 rounded-full', index < step ? 'bg-primary' : 'bg-border')}
          />
        ))}
      </div>
    </>
  );
}
