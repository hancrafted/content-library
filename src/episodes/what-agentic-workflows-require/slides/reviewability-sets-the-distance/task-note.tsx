import { AgentTag } from '@/episodes/components/slide-shared/party-notes/agent-tag';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** How much damage a wrong result can do, on a three-step scale. */
export type RiskValue = 1 | 2 | 3;

const STEPS: readonly RiskValue[] = [1, 2, 3];

/** The "If wrong" meter: three squares, filled up to the task's risk. `value` reads out what the squares show. */
export function RiskMeter({
  label,
  value,
  valueLabel,
  marker,
}: {
  label: string;
  value: RiskValue;
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

/** A muted caption line of a note, left out when the note has none. */
function Aside({ text }: { text: string | undefined }) {
  return text === undefined ? null : <p className="text-caption text-muted-foreground">{text}</p>;
}

export interface TaskNoteProps {
  readonly label: string;
  readonly fact: string;
  /** What the task was before it got its check, under the fact. */
  readonly was?: string;
  /** The risk meter. */
  readonly risk: ReactNode;
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
  const { label, fact, was, risk, ifWrong, checkedBy, level, agent, className, targetProps } = props;
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
export function CheckCard({ heading, checks, className, targetProps }: CheckCardProps) {
  return (
    <div
      data-check-card
      {...targetProps}
      className={cn('card-hover card-hover--raise rounded-md bg-card shadow-md', className)}
    >
      <div
        data-check-heading
        className="rounded-t-md bg-primary px-4 py-1 text-caption font-semibold text-primary-foreground uppercase"
      >
        {heading}
      </div>
      <ul className="flex flex-col gap-1 p-3 text-body">
        {checks.map((check) => (
          <CheckItem key={check.text} {...check} />
        ))}
      </ul>
    </div>
  );
}
