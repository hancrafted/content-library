'use client';

import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Code, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { IconButton, OUTLINED_ICON } from '../core-components/icon-button/icon-button.client';
import type { PromptKit } from '../core-components/try-prompt/try-prompt.client';
import type { ModalProps, UiWords } from './human-in-the-loop.types';
import { ModalBody, type BodyChrome } from './modal-body';
import { ModalSteps } from './modal-steps.client';
import { TaskDetails, TaskSteps } from './task-steps.client';
import { tryTitle } from './words.pure';
import type { Level } from './workflow-state.pure';
import type { JobModalView, StageView } from './workflow-view.pure';

/** Copies text and returns what a live region should say: `done` on success, nothing when the clipboard refuses. */
async function copyText(text: string, done: string): Promise<string> {
  try {
    await navigator.clipboard.writeText(text);
    return done;
  } catch {
    return '';
  }
}

interface HeaderProps {
  readonly stage: StageView;
  readonly words: UiWords;
  readonly level: Level;
  readonly onLevel: (level: Level) => void;
  readonly onClose: () => void;
}

/** The title, the learning goal under it, and at the right the simple/technical toggle beside Close. */
function LevelToggle({ words, level, onLevel }: Pick<HeaderProps, 'words' | 'level' | 'onLevel'>) {
  const technical = level === 'technical';
  return (
    <IconButton
      label={words.technical}
      tip={words.technicalTip}
      align="end"
      aria-pressed={technical}
      className={cn(OUTLINED_ICON, technical && 'bg-primary text-primary-foreground hover:bg-primary')}
      onClick={() => onLevel(technical ? 'simple' : 'technical')}
    >
      <Code aria-hidden="true" className="size-4" />
    </IconButton>
  );
}

function Header({ stage, words, level, onLevel, onClose }: HeaderProps) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 tabIndex={-1} data-autofocus="" className="text-body font-semibold outline-none">
          {tryTitle(words, stage.name)}
        </h2>
        {stage.goal && (
          <p data-goal="" className="mt-1 text-muted-foreground">
            {stage.goal}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LevelToggle words={words} level={level} onLevel={onLevel} />
        <IconButton label={words.close} align="end" onClick={onClose}>
          <X aria-hidden="true" className="size-4" />
        </IconButton>
      </div>
    </header>
  );
}

function useCopy(done: string) {
  const [announced, setAnnounced] = useState('');
  return [announced, (text: string) => void copyText(text, done).then(setAnnounced)] as const;
}

function useModalDialog(isOpen: boolean) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!isOpen || !element || element.open) return;
    element.showModal();
    // The title takes the first focus, so no control (and no tooltip) greets the viewer; closing returns focus to the opener.
    element.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }, [isOpen]);
  return dialog;
}

interface JobSectionProps {
  readonly job: JobModalView;
  readonly several: boolean;
  readonly kit: PromptKit & { readonly words: UiWords };
  readonly chrome: BodyChrome;
}

/** One job of an old-schema stage: its numbered steps, then, below them, its explanation. */
function JobSection({ job, several, kit, chrome }: JobSectionProps) {
  return (
    <section data-job={job.id} aria-label={several ? job.title : undefined} className="flex flex-col gap-6">
      {several && <h3 className="text-body font-semibold">{job.title}</h3>}
      <ModalSteps job={job} kit={kit} />
      <ModalBody sections={job.sections} examples={job.examples} chrome={chrome} />
    </section>
  );
}

interface TasksProps {
  readonly jobs: readonly JobModalView[];
  readonly kit: PromptKit & { readonly words: UiWords };
  readonly words: UiWords;
}

/** The tasks of a new-schema stage: steps on the left and the details of the task in focus on the right; on a phone one column, details folded under each task. */
interface ColumnProps extends TasksProps {
  readonly wide: boolean;
  readonly onActive: (jobId: string) => void;
}

function TaskColumn({ jobs, kit, words, wide, onActive }: ColumnProps) {
  const several = jobs.length > 1;
  return (
    <div data-column={wide ? 'tasks' : undefined} className="flex min-w-0 flex-col gap-8">
      {jobs.map(
        (job) =>
          job.task && (
            <section
              key={job.id}
              data-job={job.id}
              aria-label={several ? job.title : undefined}
              className="flex flex-col gap-4"
            >
              {several && <h3 className="text-body font-semibold">{job.title}</h3>}
              <TaskSteps task={job.task} kit={kit} onActive={() => onActive(job.id)} />
              {!wide && <TaskDetails jobId={job.id} task={job.task} words={words} folded />}
            </section>
          ),
      )}
    </div>
  );
}

function Tasks({ jobs, kit, words }: TasksProps) {
  const wide = useMediaQuery('(min-width: 768px)');
  const [active, setActive] = useState(jobs[0]?.id);
  const shown = jobs.find((job) => job.id === active) ?? jobs[0];
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <TaskColumn {...{ jobs, kit, words, wide }} onActive={setActive} />
      {wide && shown?.task && (
        <aside data-column="details" className="min-w-0 md:sticky md:top-0 md:self-start">
          <TaskDetails jobId={shown.id} task={shown.task} words={words} folded={false} />
        </aside>
      )}
    </div>
  );
}

interface StageBodyProps {
  readonly stage: StageView;
  readonly kitOf: (job: JobModalView) => PromptKit & { readonly words: UiWords };
  readonly chrome: BodyChrome;
}

/** A stage of tasks in the two-column layout, or an old-schema stage as its job sections. */
function StageBody({ stage, kitOf, chrome }: StageBodyProps) {
  const first = stage.jobs[0];
  if (first && stage.jobs.every((job) => job.task))
    return <Tasks jobs={stage.jobs} kit={kitOf(first)} words={chrome.words} />;
  return stage.jobs.map((job) => (
    <JobSection key={job.id} job={job} several={stage.jobs.length > 1} kit={kitOf(job)} chrome={chrome} />
  ));
}

interface PanelProps {
  readonly stage: StageView;
  readonly shortJobIds: readonly string[];
  readonly chrome: BodyChrome;
  readonly level: Level;
  readonly onLevel: (level: Level) => void;
  readonly onShort: (jobId: string) => void;
  readonly onClose: () => void;
}

/** The card inside the dialog: the header, then the stage's jobs, then the live region a copy announces in. Full screen on a phone. */
function Panel({ stage, shortJobIds, chrome, level, onLevel, onShort, onClose }: PanelProps) {
  const [announced, copy] = useCopy(chrome.words.copied);
  const { words } = chrome;
  const kitOf = (job: JobModalView) => ({
    short: shortJobIds.includes(job.id),
    words,
    onShort: () => onShort(job.id),
    onCopy: copy,
  });
  return (
    <div className="flex h-full w-full flex-col gap-4 bg-card p-4 text-foreground md:h-auto md:max-h-full md:max-w-5xl md:rounded-2xl md:border md:border-border md:p-5 md:shadow-lg">
      <Header stage={stage} words={words} level={level} onLevel={onLevel} onClose={onClose} />
      <div
        data-scroll=""
        className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain md:flex-none md:pr-2"
      >
        <StageBody stage={stage} kitOf={kitOf} chrome={chrome} />
      </div>
      <p role="status" aria-live="polite" className="h-5 shrink-0 text-caption text-muted-foreground">
        {announced}
      </p>
    </div>
  );
}

/**
 * The stage modal part: a native `<dialog>` opened with `showModal()` while a stage is open, so the browser gives the
 * top layer, Escape and the focus trap, and a press on the backdrop closes it (same pattern as the interview chat).
 * Every stage's modal has one information architecture: the title and an X at the top right, the numbered steps
 * (collapsed prompts behind copy and chat buttons), then the explanation. A copy announces `words.copied` in a polite
 * live region.
 */
export function ModalPart({ stage, shortJobIds, level, onLevel, onClose, onShort, ...chrome }: ModalProps) {
  const dialog = useModalDialog(stage !== null);
  if (!stage) return null;
  const close = () => dialog.current?.close();
  return (
    <dialog
      ref={dialog}
      data-part="modal"
      data-stage={stage.id}
      aria-label={tryTitle(chrome.words, stage.name)}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && close()}
      className="m-0 h-dvh max-h-none w-full max-w-none items-center justify-center overscroll-contain bg-transparent p-0 text-inherit backdrop:bg-overlay/60 backdrop:backdrop-blur-xs open:flex md:p-6"
    >
      <Panel {...{ stage, shortJobIds, chrome, level, onLevel, onShort }} onClose={close} />
    </dialog>
  );
}
