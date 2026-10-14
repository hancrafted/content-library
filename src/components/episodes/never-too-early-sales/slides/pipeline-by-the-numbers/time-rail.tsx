import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import styles from './pipeline-by-the-numbers.module.css';

interface TimeRailProps {
  stages: readonly { slug: string; label: string }[];
  total: string;
  label: string;
  cashNote: string;
}

/**
 * The invented timetable on its own rail: three equal, symbolic segments in
 * sequence, their total and what the path measures, then a dashed note after
 * the win, because cash timing sits beyond it.
 */
export function TimeRail({ stages, total, label, cashNote }: TimeRailProps) {
  return (
    <figure data-target="time-rail" className="flex flex-wrap items-start gap-4">
      <div className={cn(styles.railMain, 'flex flex-col gap-3')}>
        <ol className={cn(styles.railStages, 'grid gap-3')}>
          {stages.map(({ slug, label: stage }) => (
            <li key={slug} data-target={slug} className={cn(styles.railStage, 'grid items-center gap-2')}>
              <span aria-hidden="true" className={cn(styles.railLine, 'bg-foreground')} />
              <ArrowRight aria-hidden="true" className={cn(styles.railArrow, 'size-4 text-foreground')} />
              <span className="text-caption text-foreground">{stage}</span>
            </li>
          ))}
        </ol>
        <p className="text-body font-semibold text-foreground">{total}</p>
        <p data-target="rail-label" className="text-caption text-muted-foreground">
          {label}
        </p>
      </div>
      <p
        data-target="cash-note"
        className={cn(
          styles.cashNote,
          'rounded-md border border-dashed border-border p-3 text-caption text-muted-foreground',
        )}
      >
        {cashNote}
      </p>
    </figure>
  );
}
