import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface Question {
  slug: string;
  text: string;
}

export interface Zone {
  label: string;
  questions: readonly Question[];
}

export interface Echo extends Question {
  unwritten: boolean;
}

export interface Handover {
  title: string;
  body: ReactNode;
  due: string;
  dueDay: string;
  echoes: readonly Echo[];
}

interface NewHireStackProps {
  task: string;
  obvious: Zone;
  riders: readonly Question[];
  hidden: Zone;
  hiddenNote: ReactNode;
  rail: { ask: string; asked: string };
  switchLabel: string;
  handover: Handover;
  /** The `data-target` of the unwritten zone and of the hand-off card, which the Speaker notes explain. */
  targets: { hidden: string; handover: string };
}

/** A rail label on the left track: a pill, neutral while you ask, primary once you are asked. */
function RailPill({ children, asked = false }: { children: ReactNode; asked?: boolean }) {
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-caption font-medium whitespace-nowrap',
        asked ? 'bg-primary text-primary-foreground' : 'border border-border bg-card',
      )}
    >
      {children}
    </span>
  );
}

/** How a question pill reads: solid when obvious, small and muted when it rides along, dashed when unwritten. */
type PillKind = 'obvious' | 'rider' | 'unwritten';

const PILL: Record<PillKind, string> = {
  obvious: 'border-border bg-card px-5 py-2 text-body shadow-sm',
  rider: 'border-border bg-muted px-3 py-1 text-caption text-muted-foreground',
  unwritten: 'border-dashed border-muted-foreground bg-background px-5 py-2 text-body',
};

/** A zone's question pills, a focus group: pointing at one dims the others. */
function QuestionList({ groups }: { groups: readonly { kind: PillKind; questions: readonly Question[] }[] }) {
  return (
    <ul className="focus-group focus-group--dim-others mt-5 flex flex-wrap items-center gap-3">
      {groups.flatMap(({ kind, questions }) =>
        questions.map((question) => (
          <li key={question.slug} className={cn('focus-group__item rounded-full border', PILL[kind])}>
            {question.text}
          </li>
        )),
      )}
    </ul>
  );
}

/** A zone card: its label, its line and its questions. */
function ZoneCard(props: { label: string; className: string; target?: string; children: ReactNode }) {
  return (
    <section data-target={props.target} className={cn('rounded-2xl p-6 @2xl:p-8', props.className)}>
      <p className="text-caption tracking-wide text-muted-foreground uppercase">{props.label}</p>
      {props.children}
    </section>
  );
}

/** The top half: the task, the obvious questions with their riders, and the unwritten ones. */
function AskZones(props: Pick<NewHireStackProps, 'task' | 'obvious' | 'riders' | 'hidden' | 'hiddenNote' | 'targets'>) {
  const { task, obvious, riders, hidden, hiddenNote, targets } = props;
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <ZoneCard label={obvious.label} className="border border-border bg-card">
        <p className="mt-3 text-body font-semibold">{task}</p>
        <QuestionList
          groups={[
            { kind: 'obvious', questions: obvious.questions },
            { kind: 'rider', questions: riders },
          ]}
        />
      </ZoneCard>
      <ZoneCard label={hidden.label} target={targets.hidden} className="border border-dashed border-border bg-muted">
        <p className="mt-3 max-w-3xl text-body text-muted-foreground">{hiddenNote}</p>
        <QuestionList groups={[{ kind: 'unwritten', questions: hidden.questions }]} />
      </ZoneCard>
    </div>
  );
}

/** The rail's turn: the hairline coming down from "You ask" loops round and leaves downwards to "You are asked". */
function TurnArrow() {
  return (
    <svg viewBox="0 0 40 64" className="h-16 w-10 shrink-0" aria-hidden="true">
      <path
        d="M20 0V18C20 30 34 30 34 40C34 50 20 52 12 46C4 40 10 30 20 34C26 36 20 44 20 52V62M15.5 57.5 20 63l4.5-5.5"
        className="fill-none stroke-primary"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The break between the halves: a full-width band where the rail turns, the Slide's pivot. */
function SwitchBand({ label }: { label: string }) {
  return (
    <div className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-4 rounded-2xl bg-primary/10 px-2 py-2 @2xl:grid-cols-[9rem_minmax(0,1fr)] @2xl:gap-8">
      <div className="flex justify-center">
        <TurnArrow />
      </div>
      <p className="text-subheading font-semibold text-primary">{label}</p>
    </div>
  );
}

/** The hand-off's lead: its title and line, and the deadline beside them. */
function HandoverLead({ handover }: { handover: Handover }) {
  return (
    <div className="flex flex-col items-start justify-between gap-6 @xl:flex-row">
      <div>
        <p className="text-subheading font-semibold">{handover.title}</p>
        <p className="mt-3 max-w-2xl text-body">{handover.body}</p>
      </div>
      <p className="flex shrink-0 flex-col items-center rounded-xl bg-background px-5 py-3 text-foreground">
        <span className="text-caption tracking-wide text-muted-foreground uppercase">{handover.due}</span>
        <span className="text-body font-semibold">{handover.dueDay}</span>
      </p>
    </div>
  );
}

/** The bottom half: the one focal card, the hand-off, echoing every question above as what the newcomer now needs. */
function HandoverCard({ handover, target }: { handover: Handover; target: string }) {
  return (
    <section
      data-target={target}
      className="flex min-w-0 flex-col gap-6 rounded-2xl bg-primary p-6 text-primary-foreground shadow-md @2xl:p-8"
    >
      <HandoverLead handover={handover} />
      <ul className="flex flex-wrap gap-3 text-caption">
        {handover.echoes.map((echo) => (
          <li
            key={echo.slug}
            className={cn(
              'rounded-full border border-primary-foreground/40 px-4 py-1',
              echo.unwritten && 'border-dashed',
            )}
          >
            {echo.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The hairline rail beside the top half, running down (`stroke-border`) from "You ask" into the band. */
function RailArrow() {
  return (
    <svg viewBox="0 0 12 200" preserveAspectRatio="none" className="hidden w-3 flex-1 @2xl:block" aria-hidden="true">
      <path
        d="M6 0V200"
        className="fill-none stroke-border"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The new hire's stack (Spec Option 1a): a tall stack read top to bottom, with no AI on it. Above the band you ask:
 * the obvious questions, then the ones nobody thinks to ask. In the band the rail turns, carrying "You ask" round to
 * "You are asked": the roles switch, and below it the one dark card echoes every question back.
 */
export function NewHireStack(props: NewHireStackProps) {
  const { rail, switchLabel, handover, targets } = props;
  return (
    <div className="@container flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-[9rem_minmax(0,1fr)] @2xl:gap-8">
        <div className="flex items-center gap-3 @2xl:flex-col @2xl:pt-2">
          <RailPill>{rail.ask}</RailPill>
          <RailArrow />
        </div>
        <AskZones {...props} />
      </div>
      <SwitchBand label={switchLabel} />
      <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-[9rem_minmax(0,1fr)] @2xl:gap-8">
        <div className="flex items-center @2xl:flex-col">
          <RailPill asked>{rail.asked}</RailPill>
        </div>
        <HandoverCard handover={handover} target={targets.handover} />
      </div>
    </div>
  );
}
