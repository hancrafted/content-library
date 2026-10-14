import { cn } from '@/lib/utils';
import styles from './cashflow-start-when.module.css';

interface QuarterAnnotationProps {
  legend: string;
  /** Each quarter and how many month columns it spans, in month order. */
  quarters: readonly { slug: string; label: string; span: number }[];
}

/**
 * Q1 and Q2 over the board's months. Where the board shows its four months
 * in one row, a bracket spans the columns; elsewhere, where January to March
 * cannot share a row, the written legend shows instead. Both answer to the
 * board's own width; the legend is what assistive technology reads.
 */
export function QuarterAnnotation({ legend, quarters }: QuarterAnnotationProps) {
  return (
    <div data-target="quarters" className="flex flex-col">
      <p className={cn(styles.legend, 'text-caption text-muted-foreground')}>{legend}</p>
      <div aria-hidden="true" className={cn(styles.bracket, 'gap-3')}>
        {quarters.map(({ slug, label, span }) => (
          <span
            key={slug}
            data-quarter={slug}
            style={{ gridColumn: `span ${span}` }}
            className={cn(styles.quarter, 'pt-1 text-center text-caption font-medium text-muted-foreground')}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
