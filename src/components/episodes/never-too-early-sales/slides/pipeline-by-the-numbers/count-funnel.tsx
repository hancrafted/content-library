import { cn } from '@/lib/utils';
import styles from './pipeline-by-the-numbers.module.css';

interface CountFunnelProps {
  label: string;
  bands: readonly { slug: string; count: string }[];
  /** The ratio written between band n and band n + 1. */
  ratios: readonly string[];
  overall: string;
  condition: string;
}

/** One step down the funnel: a thin connector beside its written ratio. */
function RatioStep({ ratio }: { ratio: string }) {
  return (
    <span className="flex items-center gap-3 py-2">
      <span aria-hidden="true" className={cn(styles.connector, 'h-6 w-px bg-border')} />
      <span className="text-caption text-muted-foreground">{ratio}</span>
    </span>
  );
}

/**
 * A sticky-note funnel of counts: each band a written count, each step down a
 * written ratio beside a thin connector. Band widths narrow symbolically and
 * never measure the numbers; every number is a label.
 */
export function CountFunnel({ label, bands, ratios, overall, condition }: CountFunnelProps) {
  return (
    <figure data-target="funnel" aria-label={label} className="flex flex-col gap-3">
      <ol className="flex flex-col">
        {bands.map(({ slug, count }, index) => (
          <li key={slug} className={cn(styles.band, 'flex flex-col items-center')}>
            {index > 0 && <RatioStep ratio={ratios[index - 1]} />}
            <span
              className={cn(
                styles.bandNote,
                'rounded-md border border-border bg-card p-3 text-center text-body font-semibold text-foreground',
              )}
            >
              {count}
            </span>
          </li>
        ))}
      </ol>
      <p data-target="overall" className="border-l-2 border-primary pl-3 text-body font-semibold text-foreground">
        {overall}
      </p>
      <p data-target="condition" className="text-caption text-muted-foreground">
        {condition}
      </p>
    </figure>
  );
}
