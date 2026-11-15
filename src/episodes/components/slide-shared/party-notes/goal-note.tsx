import { cn } from '@/shared/lib/utils';

/** The party's goal as a note with a heavy outline, the end a task or a chain of tasks leads to. */
export function GoalNote({ label, text, className }: { label: string; text: string; className?: string }) {
  return (
    <div data-goal-note className={cn('rounded-md border-2 border-foreground bg-card p-3 shadow-md', className)}>
      <p className="text-caption text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-body font-semibold">{text}</p>
    </div>
  );
}
