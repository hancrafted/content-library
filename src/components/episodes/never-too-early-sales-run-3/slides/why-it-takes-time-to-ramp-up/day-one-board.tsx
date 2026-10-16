import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import { useId, type CSSProperties, type ReactNode } from 'react';
import styles from './why-it-takes-time-to-ramp-up.module.css';

type Column = 'preparation' | 'market' | 'metrics';

interface PreparationNote {
  id: 'before' | 'during' | 'deal';
  label: string;
  items: string;
}

interface DayOneBoardProps {
  stamp: string;
  columns: Record<Column, string>;
  preparation: readonly PreparationNote[];
  questions: readonly string[];
  metrics: readonly { label: string; unknown: string }[];
  hints: Record<Column, string>;
  close: ReactNode;
  targets: Record<Column, TargetProps>;
}

/** Paper tilt per note, so the board reads as hand-pinned. */
const BLANK_TILT = ['-rotate-1', 'rotate-1', '-rotate-1'];
const QUESTION_TILT = ['rotate-1', '-rotate-2', 'rotate-1'];
const METRIC_TILT = ['-rotate-1', 'rotate-2'];

/**
 * The founder's board on day one: dashed notes for material not written yet, question notes for the unknown market
 * and two dark "?" notes for the metrics, stamped "Day one" over its corner. A server part with plain props.
 */
export function DayOneBoard({ stamp, close, ...lanes }: DayOneBoardProps) {
  return (
    <div className="@container mt-10 flex flex-col gap-10">
      <BoardSurface stamp={stamp}>
        <Lanes {...lanes} />
      </BoardSurface>
      <div className={cn('flex items-center gap-4', styles.close)}>
        <svg viewBox="0 0 120 24" className="w-16 shrink-0 @3xl:w-28" aria-hidden="true">
          <path d="M2 12 H108 M98 4 L112 12 L98 20" className="fill-none stroke-foreground" strokeWidth="3" />
        </svg>
        <p className="text-body text-foreground">{close}</p>
      </div>
    </div>
  );
}

/** The three lanes, placed one per voice beat. */
function Lanes({
  columns,
  preparation,
  questions,
  metrics,
  hints,
  targets,
}: Omit<DayOneBoardProps, 'stamp' | 'close'>) {
  return (
    <div className="relative grid grid-cols-1 gap-6 @3xl:grid-cols-3">
      <Lane beat={0} label={columns.preparation} hint={hints.preparation} target={targets.preparation}>
        {preparation.map((note, index) => (
          <BlankNote key={note.id} note={note} tilt={BLANK_TILT[index % BLANK_TILT.length]} />
        ))}
      </Lane>
      <Lane beat={1} label={columns.market} hint={hints.market} target={targets.market}>
        {questions.map((question, index) => (
          <QuestionNote key={question} question={question} tilt={QUESTION_TILT[index % QUESTION_TILT.length]} />
        ))}
      </Lane>
      <Lane beat={2} label={columns.metrics} hint={hints.metrics} target={targets.metrics}>
        {metrics.map((metric, index) => (
          <MetricNote key={metric.label} metric={metric} index={index} />
        ))}
      </Lane>
    </div>
  );
}

/** The board: a muted, inset surface with a dot pattern, the stamp lying over its corner. */
function BoardSurface({ stamp, children }: { stamp: string; children: ReactNode }) {
  const dots = `day-one-dots-${useId()}`;
  return (
    <div className="relative mt-4 rounded-xl border border-border bg-muted p-5 shadow-inner @3xl:p-8">
      <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <pattern id={dots} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" className="fill-foreground/10" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${dots})`} />
      </svg>
      {children}
      {/* Last in the board, so it lies on top of the lanes without a z-index. */}
      <p
        className={cn(
          'absolute -top-6 right-2 rotate-6 rounded-md border-4 border-foreground bg-background px-5 py-2 font-mono text-body font-semibold tracking-widest text-foreground uppercase shadow-lg @3xl:-right-4',
          styles.stamp,
        )}
      >
        {stamp}
      </p>
    </div>
  );
}

interface LaneProps {
  /** The voice beat that places the lane. */
  beat: number;
  label: string;
  hint: string;
  target: TargetProps;
  children: ReactNode;
}

function Lane({ beat, label, hint, target, children }: LaneProps) {
  return (
    <div
      {...target}
      className={cn('flex min-w-0 flex-col gap-4 rounded-lg bg-foreground/5 p-5', styles.lane)}
      style={{ '--beat': beat } as CSSProperties}
    >
      <span className="self-start rounded-full bg-foreground px-4 py-1 text-caption font-semibold text-background">
        {label}
      </span>
      {children}
      <p className="text-caption text-muted-foreground">{hint}</p>
    </div>
  );
}

/** An open question about the market, answered only by real conversations. */
function QuestionNote({ question, tilt }: { question: string; tilt?: string }) {
  return (
    <p className={cn('rounded-sm bg-card p-4 text-body font-medium text-foreground shadow-md', tilt)}>{question}</p>
  );
}

/** Material not written yet: a dashed outline with its headline and items. */
function BlankNote({ note, tilt }: { note: PreparationNote; tilt?: string }) {
  return (
    <div
      className={cn(
        'rounded-sm border-2 border-dashed border-muted-foreground p-4 text-caption text-muted-foreground',
        tilt,
      )}
    >
      <b className="text-foreground">{note.label}</b>
      <br />
      {note.items}
    </div>
  );
}

/** A metric you plan with, still blank: the one thing to look at. */
function MetricNote({ metric, index }: { metric: { label: string; unknown: string }; index: number }) {
  return (
    <div
      className={cn(
        'rounded-sm bg-primary p-5 text-primary-foreground shadow-xl',
        METRIC_TILT[index % METRIC_TILT.length],
        styles.metric,
      )}
      style={{ '--i': index } as CSSProperties}
    >
      <p className="text-caption">{metric.label}</p>
      <p className="text-heading leading-none font-semibold tabular-nums">{metric.unknown}</p>
    </div>
  );
}
