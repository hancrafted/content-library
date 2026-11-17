import { AgentTag } from '@/episodes/components/slide-shared/party-notes/agent-tag';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import type { Trust } from './trust.pure';

const STEPS: readonly Trust[] = [1, 2, 3];

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

function trustSquare(step: Trust, earned: Trust, needed: Trust): string {
  if (step <= earned) return 'size-3 rounded-sm bg-foreground';
  if (step <= needed) return 'size-3 rounded-sm border border-dashed border-muted-foreground';
  return 'size-3 rounded-sm border border-foreground';
}

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

function Aside({ text }: { text: string | undefined }) {
  return text === undefined ? null : <p className="text-caption text-muted-foreground">{text}</p>;
}

export interface TaskNoteProps {
  readonly label: string;
  readonly fact: string;
  readonly was?: string;
  readonly risk: ReactNode;
  readonly trust: ReactNode;
  readonly ifWrong: string;
  readonly checkedBy?: string;
  readonly level: ReactNode;
  readonly agent: string;
  readonly className?: string;
  readonly targetProps?: TargetProps;
}

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

export interface Check {
  readonly text: string;
  readonly marker?: ReactNode;
}

export interface CheckCardProps {
  readonly heading: string;
  readonly checks: readonly Check[];
  readonly meaning: string;
  readonly callout?: ReactNode;
  readonly className?: string;
  readonly targetProps?: TargetProps;
}

function CheckItem({ text, marker }: Check) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className="size-4 shrink-0 rounded-sm border-2 border-foreground" />
      {text}
      {marker}
    </li>
  );
}

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
