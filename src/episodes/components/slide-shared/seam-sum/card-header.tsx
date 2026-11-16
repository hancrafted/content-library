import { DoneBy } from './marks';

interface CardHeaderProps {
  readonly label: string;
  /** Who did the card, with its accessible name; absent where nothing is done yet. */
  readonly doneBy?: { readonly who: 'person' | 'agent'; readonly label: string };
}

/** The head of a freelancer card: the dark name pill, and the person or agent badge once the card is done. */
export function CardHeader({ label, doneBy }: CardHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-1">
      <span data-card-label className="rounded-full bg-foreground px-3 py-0.5 text-caption font-medium text-background">
        {label}
      </span>
      {doneBy !== undefined && <DoneBy who={doneBy.who} label={doneBy.label} />}
    </div>
  );
}
