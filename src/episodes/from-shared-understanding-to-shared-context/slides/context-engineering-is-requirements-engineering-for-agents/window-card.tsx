import { cn } from '@/shared/lib/utils';

export interface WindowCardProps {
  readonly label: string;
  readonly order: string;
  readonly verdict: string;
  /** A clear window is crisp; a vague one is drawn dulled toward `muted-foreground`, never a hue of its own. */
  readonly quality: 'crisp' | 'vague';
  /** The window misses the customer's target: its verdict is trouble, in `warning`. */
  readonly miss: boolean;
}

/** The context window that produced a board: its fill bar, the order it holds and the verdict on it. */
export function WindowCard({ label, order, verdict, quality, miss }: WindowCardProps) {
  const crisp = quality === 'crisp';
  return (
    <div
      data-window={quality}
      className={cn(
        'flex flex-col gap-2 rounded-lg border-2 bg-card p-3 shadow-md',
        crisp ? 'border-machine' : 'border-dashed border-muted-foreground/40',
      )}
    >
      <p className="text-caption text-muted-foreground uppercase">{label}</p>
      <div className="flex h-3 gap-0.5" aria-hidden="true">
        <span className="w-1/6 rounded-sm bg-muted-foreground/30" />
        <span className={cn('w-1/3 rounded-sm', crisp ? 'bg-machine' : 'bg-muted-foreground/20')} />
        <span className="flex-1 rounded-sm border border-dashed border-border" />
      </div>
      <p className={cn('text-caption', crisp ? 'font-medium text-foreground' : 'text-muted-foreground italic')}>
        {order}
      </p>
      <p className={cn('text-caption', miss ? 'text-(--warning)' : crisp ? 'text-primary' : 'text-muted-foreground')}>
        {verdict}
      </p>
    </div>
  );
}
