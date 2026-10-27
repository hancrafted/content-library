import { cn } from '@/shared/lib/utils';
import { Check, CheckCheck, Circle } from 'lucide-react';
import type { UiWords } from './human-in-the-loop.types';
import type { JobState, StageRun } from './workflow-run.pure';

/*
 * What the run says, drawn: a state as an icon and its word, and a stage's count with its state. Both views of the
 * diagram show them once the run has work, and read them from the run model: nothing here works out progress.
 */

const STATE_ICON = { open: Circle, done: Check, checked: CheckCheck } as const;
const STATE_TONE = { open: 'text-muted-foreground', done: 'text-foreground', checked: 'text-primary' } as const;

/** A state as an icon and its word, so colour never carries it alone. */
export function StateMark({ state, words }: { readonly state: JobState; readonly words: UiWords }) {
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

/** The stage's count of jobs done, such as "3/5", from the run. */
export function Count({ run, word }: { readonly run: StageRun; readonly word: string }) {
  return (
    <span data-count="" className="text-caption font-medium text-muted-foreground">
      {run.done}/{run.total}
      <span className="sr-only"> {word}</span>
    </span>
  );
}

/** A stage's progress on its card: the count and the stage's own state. */
export function StageProgress({ run, words }: { readonly run: StageRun; readonly words: UiWords }) {
  return (
    <div data-stage-progress="" className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <Count run={run} word={words.stateDone} />
      <StateMark state={run.state} words={words} />
    </div>
  );
}
