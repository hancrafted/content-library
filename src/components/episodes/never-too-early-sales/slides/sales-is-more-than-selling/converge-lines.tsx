import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';
import styles from './sales-is-more-than-selling.module.css';

// From each column centre (x 50, 150, 250) to the result note's top centre.
const PATHS = ['M50 0 L150 54', 'M150 0 L150 54', 'M250 0 L150 54'] as const;

/**
 * The three columns drawn together into the one result: three lines on md and
 * up, one arrow below md where the columns stack. Decoration only, so hidden
 * from assistive tech; the result note carries the claim.
 */
export function ConvergeLines() {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 300 60"
        preserveAspectRatio="none"
        className="hidden h-16 w-full text-muted-foreground md:block"
      >
        {PATHS.map((d) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            className={styles.line}
          />
        ))}
        <path d="M147 53 L150 60 L153 53 Z" fill="currentColor" className={cn(styles.head, 'text-primary')} />
      </svg>
      <ArrowDown aria-hidden="true" className="mx-auto size-6 text-muted-foreground md:hidden" />
    </>
  );
}
