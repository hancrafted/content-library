import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import styles from './marketing-funnel.module.css';

/** Where each dot comes to rest: a small heap in the spout. */
const DOTS: readonly { readonly cx: number; readonly cy: number }[] = [
  { cx: 92, cy: 198 },
  { cx: 100, cy: 198 },
  { cx: 108, cy: 198 },
  { cx: 96, cy: 190 },
  { cx: 104, cy: 190 },
  { cx: 100, cy: 182 },
];

/** The dot's entrance order as a plain number: it carries no colour or size (FE-011). */
function order(index: number): CSSProperties {
  return { '--dot': index } as CSSProperties;
}

interface MarketingFunnelProps {
  readonly title: string;
  readonly channels: string;
  /** Accessible name of the drawing. */
  readonly label: string;
}

/**
 * A drawn funnel whose narrow spout pours into the first stage. Slide-local
 * server part, plain props. The dots fall once on the active Slide and rest
 * in the spout, which is also the picture at rest (FE-009 §6).
 */
export function MarketingFunnel({ title, channels, label }: MarketingFunnelProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-col items-center text-center">
        <span className="text-body font-semibold text-foreground">{title}</span>
        <span className="text-caption text-muted-foreground">{channels}</span>
      </div>
      <svg viewBox="0 0 200 210" role="img" aria-label={label} className="w-full max-w-48">
        <path
          d="M 10 10 L 190 10 L 115 165 L 115 205 L 85 205 L 85 165 Z"
          strokeWidth="2"
          strokeLinejoin="round"
          className={cn(styles.funnel, 'text-muted-foreground')}
        />
        <g aria-hidden="true">
          {DOTS.map((dot, index) => (
            <circle key={index} cx={dot.cx} cy={dot.cy} r="4" style={order(index)} className={styles.dot} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/**
 * The primary arrow from the spout to the first stage, with its entry label:
 * pointing right beside the board, down above it (the Slide's `@4xl`
 * container). Drawn after the dots.
 */
export function EntryArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span aria-hidden="true" className={cn(styles.across, 'hidden items-center @4xl:flex')}>
        <span className="h-0.5 w-10 bg-primary" />
        <ChevronRight className="-ml-2 size-5 text-primary" />
      </span>
      <span aria-hidden="true" className={cn(styles.down, 'flex flex-col items-center @4xl:hidden')}>
        <span className="h-8 w-0.5 bg-primary" />
        <ChevronDown className="-mt-2 size-5 text-primary" />
      </span>
      <span className="text-center text-caption font-medium text-primary">{label}</span>
    </div>
  );
}
