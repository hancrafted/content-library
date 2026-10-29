import { cn } from '@/shared/lib/utils';

const STEPS = 8;

/**
 * The Visual language's "Step n of 8" pill and the thin eight-segment rail under the Slide header (decorative: the pill says the step): the finished
 * steps in `primary`, this one a faint `primary`, the rest hairline.
 */
export function StepRail({ step, pill }: { step: number; pill: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-caption font-medium text-foreground">
        {pill}
      </span>
      <div aria-hidden="true" className="flex flex-1 gap-1">
        {Array.from({ length: STEPS }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full',
              index + 1 < step ? 'bg-primary' : index + 1 === step ? 'bg-primary/30' : 'bg-border',
            )}
          />
        ))}
      </div>
    </div>
  );
}
