import { cn } from '@/shared/lib/utils';
import { Check, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import styles from './slide.module.css';

export interface RunCheck {
  readonly label: string;
  readonly pass: boolean;
}

export interface RunScoreProps {
  readonly run: 'without' | 'with';
  readonly label: string;
  readonly checks: readonly RunCheck[];
  /** Spoken names of a passed and a failed check, for the icons. */
  readonly verdict: { readonly pass: string; readonly fail: string };
}

/** The gap between two segments filling in, and the head start of the with-skill run over its neighbour (ms). */
const SEGMENT_STEP = 150;
const RUN_DELAY = { without: 300, with: 1100 } as const;

/** The score's bar: one segment per check, the passed ones filled in, one after the other. */
function ScoreBar({ run, checks, passed }: Pick<RunScoreProps, 'run' | 'checks'> & { readonly passed: number }) {
  return (
    <div aria-hidden className="grid grid-cols-4 gap-1.5">
      {checks.map(({ label }, index) => (
        <span
          key={label}
          data-motion={index < passed ? 'fill' : undefined}
          style={{ '--seg-delay': `${RUN_DELAY[run] + index * SEGMENT_STEP}ms` } as CSSProperties}
          className={cn(
            'h-2.5 rounded-full border border-muted-foreground',
            index < passed && styles.segment,
            index < passed && (run === 'with' ? 'bg-primary' : 'bg-muted-foreground'),
          )}
        />
      ))}
    </div>
  );
}

/** The checks, each marked pass or fail. */
function Checks({ checks, verdict }: Pick<RunScoreProps, 'checks' | 'verdict'>) {
  return (
    <ul className="flex flex-col gap-1">
      {checks.map(({ label, pass }) => (
        <li key={label} className="flex items-center justify-between gap-2 text-caption">
          <span data-check data-pass={String(pass)}>
            {label}
          </span>
          {pass ? (
            <Check role="img" aria-label={verdict.pass} className="size-4 shrink-0 text-(--success)" />
          ) : (
            <X role="img" aria-label={verdict.fail} className="size-4 shrink-0 text-destructive" />
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * One run's score, an illustration of the viewer's own test: passed checks out of all, a bar of one segment per check
 * that fills in once on entry (the without-skill run first), and the checks themselves, each marked pass or fail.
 */
export function RunScore({ run, label, checks, verdict }: RunScoreProps) {
  const passed = checks.filter(({ pass }) => pass).length;
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-end justify-between gap-2">
        <span className="text-caption text-muted-foreground">{label}</span>
        <span data-score className="text-heading font-semibold tabular-nums">
          {`${passed} / ${checks.length}`}
        </span>
      </p>
      <ScoreBar run={run} checks={checks} passed={passed} />
      <Checks checks={checks} verdict={verdict} />
    </div>
  );
}
