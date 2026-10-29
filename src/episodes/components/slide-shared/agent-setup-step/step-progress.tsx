/** The quiet step pill and the rail of all steps under it (Visual language "Step and progress"). */
export interface StepProgressProps {
  /** This step, from 1. */
  readonly step: number;
  readonly total: number;
  /** The pill's words, "Step 3 of 8", in the Slide's locale. */
  readonly label: string;
}

/** Each rail segment's fill: finished steps in `primary`, this step half-lit, the rest hairline. */
function segmentClass(index: number, step: number): string {
  if (index < step - 1) return 'bg-primary';
  if (index === step - 1) return 'bg-primary/40';
  return 'bg-border';
}

/** The pill says the step; the rail repeats it as a picture, so it is hidden from assistive tech. */
export function StepProgress({ step, total, label }: StepProgressProps) {
  return (
    <div className="flex items-center gap-4" data-step={step}>
      <span className="shrink-0 rounded-full border border-border px-3 py-1 text-caption text-muted-foreground">
        {label}
      </span>
      <ol className="flex flex-1 gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <li key={index} className={`h-1 flex-1 rounded-full ${segmentClass(index, step)}`} />
        ))}
      </ol>
    </div>
  );
}
