import { cn } from '@/lib/utils';
import { Check, CheckCheck, Circle } from 'lucide-react';
import type { ReactNode } from 'react';
import { JobArrow } from './diagram-arrows';
import type { JobSlot, UiWords } from './human-in-the-loop.types';
import { JobButton } from './job-button.client';
import { NodePopover } from './node-popover.client';
import { CheckedMark, NAME_BUTTON, popoverOf } from './stage-card';
import type { JobState } from './workflow-run.pure';
import type { Job, Stage } from './workflow.types';

/*
 * The job card of the Detailed view: the job's title, its one-line summary, a labelled check mark where the job is
 * reviewed. The Slide's `diagram.jobs` slot lays in its own detail, marker, popover and what hangs after the card.
 * Where the Scene can try, the whole card presses open the stage's modal at this job.
 */

interface JobCardProps {
  readonly stage: Stage;
  readonly job: Job;
  readonly slot: JobSlot;
  readonly words: UiWords;
  /** A card after the first: an arrow comes down into it from the card above. */
  readonly joined: boolean;
  /** Where the run says the job stands, drawn as a mark in Hands-on; none in the other views. */
  readonly state?: JobState;
  /** Opens the modal at this job; none where a readonly Preset tries nothing. */
  readonly onOpen: (() => void) | undefined;
}

function Name({ stage, job, slot }: Pick<JobCardProps, 'stage' | 'job' | 'slot'>) {
  const popover = popoverOf(slot.popover, stage.name);
  if (!popover) return job.title;
  return (
    <NodePopover copy={popover} className={NAME_BUTTON}>
      {job.title}
    </NodePopover>
  );
}

function Heading({ stage, job, slot }: Pick<JobCardProps, 'stage' | 'job' | 'slot'>) {
  return (
    <p className="flex items-center gap-1 text-caption font-semibold">
      <span data-title="">
        <Name stage={stage} job={job} slot={slot} />
      </span>
      {slot.marker && <span className="relative z-10">{slot.marker}</span>}
    </p>
  );
}

function Detail({ detail }: { readonly detail: ReactNode }) {
  if (!detail) return null;
  return (
    <p data-summary="" className="text-caption text-muted-foreground">
      {detail}
    </p>
  );
}

const STATE_ICON = { open: Circle, done: Check, checked: CheckCheck } as const;
const STATE_TONE = { open: 'text-muted-foreground', done: 'text-foreground', checked: 'text-primary' } as const;

/** A job's state as an icon and its word, so colour never carries it alone. */
function StateMark({ state, words }: { state: JobState; words: UiWords }) {
  const Icon = STATE_ICON[state];
  const word = { open: words.stateOpen, done: words.stateDone, checked: words.checked }[state];
  return (
    <span
      data-state={state}
      className={cn('inline-flex items-center gap-1 text-caption font-medium', STATE_TONE[state])}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {word}
    </span>
  );
}

/** Hands-on says where the job stands; the other views only say that a job is reviewed. */
function Mark({ state, reviewed, words }: { state?: JobState; reviewed: boolean; words: UiWords }) {
  if (state) return <StateMark state={state} words={words} />;
  return reviewed ? <CheckedMark word={words.checked} /> : null;
}

export function JobCard({ stage, job, slot, words, joined, state, onOpen }: JobCardProps) {
  const label = words.tryJob.replace('{job}', job.title).replace('{stage}', stage.name);
  return (
    <li
      data-job-card={job.id}
      className={cn(
        'relative flex flex-col gap-1 rounded-lg border border-border bg-background p-2.5',
        onOpen && 'hover:shadow-sm',
      )}
    >
      {joined && <JobArrow />}
      {onOpen && <JobButton stage={stage.name} jobId={job.id} label={label} onOpen={onOpen} />}
      <Heading stage={stage} job={job} slot={slot} />
      <Detail detail={slot.detail ?? job.detail} />
      <Mark state={state} reviewed={job.reviewed} words={words} />
      {slot.after && <div className="relative z-10">{slot.after}</div>}
    </li>
  );
}
