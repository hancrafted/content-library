import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';
import styles from './the-workflow-for-bigger-projects.module.css';

const TONES = {
  before: `${styles.before} flex flex-col items-center gap-4 rounded-xl bg-muted p-6 lg:col-span-4`,
  after: `${styles.after} flex min-w-0 flex-col gap-4 rounded-xl border-2 border-primary bg-card p-6 shadow-md lg:col-span-8`,
} as const;

interface ComparePanelProps {
  readonly title: string;
  /** `before`: the one long chat, muted and centred; `after`: the workflow, lit by its accent border. */
  readonly tone: keyof typeof TONES;
  /** A Context marker after the title. */
  readonly marker?: ReactNode;
  readonly target?: TargetProps;
  readonly children: ReactNode;
}

/** One side of the before-and-after: its title, then what it shows. `.before` and `.after` are the motion's hooks. */
export function ComparePanel({ title, tone, marker, target, children }: ComparePanelProps) {
  return (
    <div {...target} className={TONES[tone]}>
      {tone === 'before' ? (
        <p className="text-center text-body font-semibold text-muted-foreground">{title}</p>
      ) : (
        <p className="flex items-start gap-1 text-body font-semibold">
          <span>{title}</span>
          {marker}
        </p>
      )}
      {children}
    </div>
  );
}
