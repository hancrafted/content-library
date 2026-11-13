/** How many blank steps the card offers. */
const STEPS = 4;

export interface EmptyProcedureCardProps {
  readonly labels: { readonly card: string; readonly title: string; readonly useWhen: string; readonly steps: string };
}

/**
 * The empty procedure card the strip ends on (Spec Option 1a): a title line, a use-when line and four blank steps,
 * dashed in `primary` so the eye lands on it, left untagged so the question stays open.
 */
export function EmptyProcedureCard({ labels }: EmptyProcedureCardProps) {
  return (
    <div
      data-empty-card
      className="w-full shrink-0 -rotate-1 rounded-lg border-4 border-dashed border-primary bg-card p-5 shadow-md @2xl:w-2/5"
    >
      <p className="text-caption font-semibold text-primary uppercase">{labels.card}</p>
      <p className="mt-3 border-b-2 border-dashed border-border pb-1 text-body text-muted-foreground">{labels.title}</p>
      <p className="mt-3 border-b-2 border-dashed border-border pb-1 text-caption text-muted-foreground">
        {labels.useWhen}
      </p>
      <ol aria-label={labels.steps} className="mt-3 flex flex-col gap-3 text-caption text-muted-foreground">
        {Array.from({ length: STEPS }, (_, index) => (
          <li key={index} data-step className="flex gap-2 border-b border-dashed border-border pb-1">
            <span aria-hidden>{index + 1}.</span>
            <span data-step-text />
          </li>
        ))}
      </ol>
    </div>
  );
}
