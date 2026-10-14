import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import type { CSSProperties } from 'react';
import styles from './cashflow-start-when.module.css';

interface StartWhenArrowProps {
  question: string;
  caveat: string;
  start: string;
  steps: readonly { slug: string; label: string }[];
}

/** One step back: an arrowhead pointing towards the start, then its chip; `step` counts back from the receipt. */
function Step({ slug, label, step }: { slug: string; label: string; step: number }) {
  return (
    <li
      data-target={slug}
      style={{ '--step': step } as CSSProperties}
      className={cn(styles.arrowStep, 'flex items-center gap-2')}
    >
      <span aria-hidden="true" className={cn(styles.arrowHead, 'flex items-center')}>
        <ArrowLeft className="size-4 shrink-0 text-foreground" />
        <span className={cn(styles.arrowLine, 'bg-foreground')} />
      </span>
      <span className="rounded-md border border-border bg-card px-3 py-1 text-caption text-foreground">{label}</span>
    </li>
  );
}

/**
 * The planning direction: from the planned receipt back through closing,
 * opportunities and first contact to "Start now". The steps keep forward
 * reading order, as the founder acts; only the arrowheads point backwards.
 */
export function StartWhenArrow({ question, caveat, start, steps }: StartWhenArrowProps) {
  return (
    <div data-arrow className="flex flex-col gap-3">
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-body font-semibold text-foreground">{question}</span>
        <span className="text-caption text-muted-foreground">{caveat}</span>
      </p>
      <ol className={cn(styles.arrow, 'flex gap-2')}>
        <li
          data-target="start-now"
          className="rounded-md border border-l-2 border-border border-l-primary bg-card px-3 py-2 text-body font-semibold text-foreground"
        >
          {start}
        </li>
        {steps.map(({ slug, label }, index) => (
          <Step key={slug} slug={slug} label={label} step={steps.length - index} />
        ))}
      </ol>
    </div>
  );
}
