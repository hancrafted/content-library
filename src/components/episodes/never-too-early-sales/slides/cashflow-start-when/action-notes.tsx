import { cn } from '@/lib/utils';
import styles from './cashflow-start-when.module.css';

/** The four first actions, numbered sticky notes that all show at rest. */
export function ActionNotes({ actions }: { actions: readonly { slug: string; label: string }[] }) {
  return (
    <ol data-target="actions" className={cn(styles.actions, 'grid gap-4')}>
      {actions.map(({ slug, label }, index) => (
        <li key={slug} className="flex flex-col gap-1 rounded-md border border-border bg-card p-4">
          <span className="text-caption font-medium text-muted-foreground">{index + 1}</span>
          <span className="text-body font-semibold text-foreground">{label}</span>
        </li>
      ))}
    </ol>
  );
}
