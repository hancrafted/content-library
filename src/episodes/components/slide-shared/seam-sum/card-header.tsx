import { DoneBy } from './marks';

interface CardHeaderProps {
  readonly label: string;
  readonly doneBy?: { readonly who: 'person' | 'agent'; readonly label: string };
}

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
