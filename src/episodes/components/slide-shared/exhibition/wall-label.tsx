import { cn } from '@/shared/lib/utils';

export function WallLabel({
  title,
  era,
  line,
  className,
}: {
  title: string;
  era?: string;
  line?: string;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto flex w-11/12 flex-col bg-card px-3 py-3 shadow-sm', className)}>
      <p className="text-caption font-semibold">{title}</p>
      {era === undefined ? null : <p className="text-caption text-muted-foreground">{era}</p>}
      {line === undefined ? null : (
        <p className="mt-2 border-t border-border pt-2 text-caption text-muted-foreground italic">{line}</p>
      )}
    </div>
  );
}
