import { Check, Sparkle } from '@/components/slide-shared/venue-pipeline/glyphs';
import type { TargetProps } from '@/lib/context-link.pure';
import type { ReactNode } from 'react';

interface HumanLoopStripProps {
  label: string;
  you: string;
  youRole: string;
  planner: string;
  workers: string;
  /** A Context marker after the worker chats' label. */
  workersMarker?: ReactNode;
  /** Where the Context drawer lights the worker chats. */
  workersTarget?: TargetProps;
  workerNames: readonly string[];
  handoff: string;
  results: string;
  plannerAgain: string;
  youAgain: string;
  checked: string;
  /** "You check every artifact in between", under the two artifacts. */
  check: string;
}

/** The captain's wheel: a ring with eight spokes. */
function Helm() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="6" className="fill-none stroke-foreground" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.8" className="fill-foreground" />
      <path
        d="M12 1.5v4.5M12 18v4.5M1.5 12H6M18 12h4.5M4.6 4.6l3.2 3.2M16.2 16.2l3.2 3.2M4.6 19.4l3.2-3.2M16.2 7.8l3.2-3.2"
        className="fill-none stroke-foreground"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ARROW = (
  <svg viewBox="0 0 24 10" className="h-2.5 w-4 shrink-0 max-lg:rotate-90 max-lg:self-center" aria-hidden="true">
    <path d="M0 5h20" className="fill-none stroke-foreground" strokeWidth="1.5" />
    <path d="M18 1.5 23 5l-5 3.5z" className="fill-foreground" />
  </svg>
);

const ACTOR = 'flex min-w-0 flex-col justify-center gap-1 rounded-2xl border bg-card px-2.5 py-2 text-caption';
const NAME = 'flex items-center gap-1.5 font-semibold';

/** A chat or you: a card; you carry the accent border. */
function Actor({
  step,
  you,
  target,
  children,
}: {
  step: string;
  you?: boolean;
  target?: TargetProps;
  children: ReactNode;
}) {
  return (
    <li
      data-step={step}
      data-actor
      {...target}
      className={`${ACTOR} ${you ? 'border-2 border-primary' : 'border-border'}`}
    >
      {children}
    </li>
  );
}

function ChatName({ name }: { name: string }) {
  return (
    <span className={NAME}>
      <Sparkle className="size-3.5" />
      {name}
    </span>
  );
}

function YouName({ name }: { name: string }) {
  return (
    <span className={NAME}>
      <Helm />
      {name}
    </span>
  );
}

/** A checked artifact between two chats: the handoff or the results. */
function Artifact({ name, checked }: { name: string; checked: string }) {
  return (
    <li data-step={name} data-artifact className="flex flex-col items-center gap-1">
      <span className="inline-flex items-center gap-1 rounded-full border border-foreground bg-background px-2.5 py-1 text-caption font-semibold">
        <span data-check>
          <Check className="size-3.5" />
        </span>
        {name}
        <span className="sr-only"> {checked}</span>
      </span>
    </li>
  );
}

const Arrow = () => (
  <li aria-hidden="true" className="contents">
    {ARROW}
  </li>
);

function WorkerChats(props: HumanLoopStripProps) {
  return (
    <Actor step={props.workers} target={props.workersTarget}>
      <span className={NAME}>
        {props.workers}
        {props.workersMarker}
      </span>
      <ul className="flex flex-col gap-1">
        {props.workerNames.map((name) => (
          <li key={name} data-worker className="flex items-center gap-1.5 text-muted-foreground">
            <Sparkle className="size-3" />
            {name}
          </li>
        ))}
      </ul>
    </Actor>
  );
}

function Steps(props: HumanLoopStripProps) {
  return (
    <>
      <Actor step={props.you} you>
        <YouName name={props.you} />
        <span className="text-muted-foreground">{props.youRole}</span>
      </Actor>
      <Arrow />
      <Actor step={props.planner}>
        <ChatName name={props.planner} />
      </Actor>
      <Arrow />
      <Artifact name={props.handoff} checked={props.checked} />
      <Arrow />
      <WorkerChats {...props} />
      <Arrow />
      <Artifact name={props.results} checked={props.checked} />
      <Arrow />
      <Actor step={props.plannerAgain}>
        <ChatName name={props.plannerAgain} />
      </Actor>
      <Arrow />
      <Actor step={props.youAgain} you>
        <YouName name={props.youAgain} />
      </Actor>
    </>
  );
}

/** The human-in-the-loop workflow as one ordered strip: you, planner, handoff, workers, results, planner, you. */
export function HumanLoopStrip(props: HumanLoopStripProps) {
  return (
    <div className="flex flex-col gap-2">
      <ol
        aria-label={props.label}
        className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-1"
      >
        <Steps {...props} />
      </ol>
      <p data-check-note className="text-center text-body font-semibold text-primary">
        {props.check}
      </p>
    </div>
  );
}
