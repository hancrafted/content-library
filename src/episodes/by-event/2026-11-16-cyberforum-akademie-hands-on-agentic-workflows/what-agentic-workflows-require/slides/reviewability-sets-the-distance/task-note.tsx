import { AgentTag } from '@/episodes/components/slide-shared/party-notes/agent-tag';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import type { Trust } from './trust.pure';

const STEPS: readonly Trust[] = [1, 2, 3];

/** The "trust needed" meter: three squares, filled up to the task's risk. `value` reads out what the squares show. */
export function RiskMeter({
  label,
  value,
  valueLabel,
  marker,
}: {
  label: string;
  value: Trust;
  valueLabel: string;
  marker?: ReactNode;
}) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-caption">
      <span className="font-semibold">{label}</span>
      <span data-risk-meter={value} role="img" aria-label={valueLabel} className="flex gap-1">
        {STEPS.map((step) => (
          <span
            key={step}
            className={cn('size-3 rounded-sm', step <= value ? 'bg-foreground' : 'border border-foreground')}
          />
        ))}
      </span>
      {marker}
    </p>
  );
}

/** One square of the trust-earned meter: filled when earned, dashed while still short of the need, else empty. */
function trustSquare(step: Trust, earned: Trust, needed: Trust): string {
  if (step <= earned) return 'size-3 rounded-sm bg-foreground';
  if (step <= needed) return 'size-3 rounded-sm border border-dashed border-muted-foreground';
  return 'size-3 rounded-sm border border-foreground';
}

/**
 * The "trust earned" meter: three squares, filled up to what the task's check has proved. Squares still short of the
 * trust needed are dashed, the gap its check has yet to close. `was` is the value before the check, when it changed.
 */
export function TrustMeter({
  label,
  value,
  needed,
  valueLabel,
  was,
  marker,
}: {
  label: string;
  value: Trust;
  needed: Trust;
  valueLabel: string;
  was?: string;
  marker?: ReactNode;
}) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-caption">
      <span className="font-semibold">{label}</span>
      <span data-trust-meter={value} role="img" aria-label={valueLabel} className="flex gap-1">
        {STEPS.map((step) => (
          <span key={step} className={trustSquare(step, value, needed)} />
        ))}
      </span>
      {marker}
      {was === undefined ? null : <span className="text-muted-foreground">{was}</span>}
    </p>
  );
}

/** A muted caption line of a note, left out when the note has none. */
function Aside({ text }: { text: string | undefined }) {
  return text === undefined ? null : <p className="text-caption text-muted-foreground">{text}</p>;
}

export interface TaskNoteProps {
  readonly label: string;
  readonly fact: string;
  /** What the task was before it got its check, under the fact. */
  readonly was?: string;
  /** The trust-needed meter, set by risk. */
  readonly risk: ReactNode;
  /** The trust-earned meter, set by the check. */
  readonly trust: ReactNode;
  readonly ifWrong: string;
  readonly checkedBy?: string;
  /** The task's level: its oversight pill, or the move of its pill. */
  readonly level: ReactNode;
  readonly agent: string;
  readonly className?: string;
  readonly targetProps?: TargetProps;
}

/**
 * One party task as an agent's note on the board: its card, what it delivers, what a wrong result can do and what
 * checks it, then the level its risk and its check allow.
 */
export function TaskNote(props: TaskNoteProps) {
  const { label, fact, was, risk, trust, ifWrong, checkedBy, level, agent, className, targetProps } = props;
  return (
    <div
      data-task-note
      {...targetProps}
      className={cn('relative flex flex-col gap-2 rounded-md bg-card p-3 shadow-md', className)}
    >
      <AgentTag label={agent} />
      <p data-task-label className="text-caption text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-body font-semibold">{fact}</p>
      <Aside text={was} />
      {risk}
      <Aside text={ifWrong} />
      {trust}
      <Aside text={checkedBy} />
      {level}
    </div>
  );
}

/** A labelled handoff between two notes: what crosses, over an arrow, pointing down where the board stacks. */
export function Handoff({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn('flex shrink-0 flex-col items-center text-center @4xl:pt-10', className)}>
      <span data-handoff className="text-caption text-muted-foreground">
        {label}
      </span>
      <svg viewBox="0 0 80 16" className="w-8 rotate-90 @4xl:w-full @4xl:rotate-0" aria-hidden="true">
        <path d="M2 8H74M68 3L76 8L68 13" className="fill-none stroke-foreground" strokeWidth={2} />
      </svg>
    </div>
  );
}

/** One check a task can pass, with an optional Context marker after it. */
export interface Check {
  readonly text: string;
  readonly marker?: ReactNode;
}

export interface CheckCardProps {
  readonly heading: string;
  readonly checks: readonly Check[];
  /** One line saying what a check is. */
  readonly meaning: string;
  /** The callout on the heading strip. */
  readonly callout?: ReactNode;
  readonly className?: string;
  readonly targetProps?: TargetProps;
}

/** One check: an empty box, its text and its marker. The boxes stay empty: the `success` tick is reserved. */
function CheckItem({ text, marker }: Check) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className="size-4 shrink-0 rounded-sm border-2 border-foreground" />
      {text}
      {marker}
    </li>
  );
}

/** The check pinned to a task: its heading strip, the Slide's one `primary` fill, over empty boxes it can pass. */
export function CheckCard({ heading, checks, meaning, callout, className, targetProps }: CheckCardProps) {
  return (
    <div
      data-check-card
      {...targetProps}
      className={cn('card-hover card-hover--raise rounded-md bg-card shadow-md', className)}
    >
      <div
        data-check-heading
        className="flex items-center gap-2 rounded-t-md bg-primary px-4 py-1 text-caption font-semibold text-primary-foreground uppercase"
      >
        {callout}
        <span data-check-title>{heading}</span>
      </div>
      <ul className="flex flex-col gap-1 p-3 text-body">
        {checks.map((check) => (
          <CheckItem key={check.text} {...check} />
        ))}
      </ul>
      <p data-check-meaning className="px-3 pb-3 text-caption text-muted-foreground">
        {meaning}
      </p>
    </div>
  );
}
