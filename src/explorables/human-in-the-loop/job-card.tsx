import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { JobArrow } from './diagram-arrows';
import type { JobSlot, UiWords } from './human-in-the-loop.types';
import { JobButton } from './job-button.client';
import { NodePopover } from './node-popover.client';
import { CheckedMark, dashedIf, NAME_BUTTON, Pill, popoverOf } from './stage-card';
import { StateMark } from './state-mark';
import type { JobState } from './workflow-run.pure';
import type { Job, Stage } from './workflow.types';

interface JobCardProps {
  readonly stage: Stage;
  readonly job: Job;
  readonly slot: JobSlot;
  readonly words: UiWords;
  readonly joined: boolean;
  readonly state?: JobState;
  readonly round?: number;
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

function Heading({ stage, job, slot, words }: Pick<JobCardProps, 'stage' | 'job' | 'slot' | 'words'>) {
  return (
    <p className="flex items-center gap-1 text-caption font-semibold">
      <span data-title="">
        <Name stage={stage} job={job} slot={slot} />
      </span>
      {slot.marker && <span className="relative z-10">{slot.marker}</span>}
      {job.optional && <Pill mark="data-optional">{words.optional}</Pill>}
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

function Mark({ state, reviewed, words }: { state?: JobState; reviewed: boolean; words: UiWords }) {
  if (state) return <StateMark state={state} words={words} />;
  return reviewed ? <CheckedMark word={words.checked} /> : null;
}

export function JobCard({ stage, job, slot, words, joined, state, round, onOpen }: JobCardProps) {
  const label = words.tryJob.replace('{job}', job.title).replace('{stage}', stage.name);
  return (
    <li
      data-job-card={job.id}
      className={cn(
        'relative flex flex-col gap-1 rounded-lg border border-border bg-background p-2.5',
        dashedIf(job.optional),
        onOpen && 'hover:shadow-sm',
      )}
    >
      {joined && <JobArrow />}
      {onOpen && <JobButton stage={stage.name} jobId={job.id} round={round} label={label} onOpen={onOpen} />}
      <Heading stage={stage} job={job} slot={slot} words={words} />
      <Detail detail={slot.detail ?? job.detail} />
      <Mark state={state} reviewed={job.reviewed} words={words} />
      {slot.after && <div className="relative z-10">{slot.after}</div>}
    </li>
  );
}
