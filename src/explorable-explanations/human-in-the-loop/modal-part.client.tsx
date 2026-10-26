'use client';

import type { PromptKit } from '@/episodes/components/slide-shared/core-components/try-prompt/try-prompt.client';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useEffect, useRef, useState } from 'react';
import type { ModalProps, UiWords } from './human-in-the-loop.types';
import { ModalHeader } from './modal-header.client';
import { TaskDetails, TaskSteps, type SlotState } from './task-steps.client';
import { tryTitle } from './words.pure';
import type { JobModalView, StageView } from './workflow-view.pure';

/** Copies text; `true` when the clipboard took it. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** What the live region says after a copy (`done`, or nothing when the clipboard refused), and the copy itself. */
function useCopy(done: string) {
  const [announced, setAnnounced] = useState('');
  const copy = async (text: string): Promise<boolean> => {
    const ok = await copyText(text);
    setAnnounced(ok ? done : '');
    return ok;
  };
  return [announced, copy] as const;
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

interface TasksProps {
  readonly slots: SlotState;
  readonly jobs: readonly JobModalView[];
  readonly kit: PromptKit & { readonly words: UiWords };
  readonly words: UiWords;
}

/** The tasks of a stage: steps on the left and the details of the task in focus on the right; on a phone one column, details folded under each task. */
interface ColumnProps extends TasksProps {
  readonly wide: boolean;
  readonly onActive: (jobId: string) => void;
}

function TaskColumn({ jobs, kit, words, wide, slots, onActive }: ColumnProps) {
  const several = jobs.length > 1;
  return (
    <div data-column={wide ? 'tasks' : undefined} className="flex min-w-0 flex-col gap-8">
      {jobs.map((job, at) => (
        <section
          key={job.id}
          data-job={job.id}
          aria-label={several ? job.title : undefined}
          className="flex flex-col gap-4"
        >
          {several && <h3 className="text-body font-semibold">{job.title}</h3>}
          <TaskSteps task={job.task} kit={kit} slots={slots} openFirst={at === 0} onActive={() => onActive(job.id)} />
          {!wide && <TaskDetails jobId={job.id} task={job.task} words={words} folded />}
        </section>
      ))}
    </div>
  );
}

function Tasks({ jobs, kit, words, slots }: TasksProps) {
  const wide = useMediaQuery('(min-width: 768px)');
  const [active, setActive] = useState(jobs[0]?.id);
  const shown = jobs.find((job) => job.id === active) ?? jobs[0];
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <TaskColumn {...{ jobs, kit, words, wide, slots }} onActive={setActive} />
      {wide && shown && (
        <aside data-column="details" className="min-w-0 md:sticky md:top-0 md:self-start">
          <TaskDetails jobId={shown.id} task={shown.task} words={words} folded={false} />
        </aside>
      )}
    </div>
  );
}

type PanelProps = Omit<ModalProps, 'stage' | 'slotValues' | 'onSlots'> & {
  readonly stage: StageView;
  readonly slots: SlotState;
};

/** The card inside the dialog: the header, then the stage's jobs, then the live region a copy announces in. Full screen on a phone. */
function Panel({ stage, slots, level, onLevel, onClose, ...chrome }: PanelProps) {
  const [announced, copy] = useCopy(chrome.words.copied);
  const { words } = chrome;
  const first = stage.jobs[0];
  const kit = {
    words,
    onCopy: copy,
  };
  return (
    <div className="flex h-full w-full flex-col gap-4 bg-card p-4 text-foreground md:h-auto md:max-h-full md:max-w-5xl md:rounded-2xl md:border md:border-border md:p-5 md:shadow-lg">
      <ModalHeader stage={stage} words={words} level={level} onLevel={onLevel} onClose={onClose} />
      <div
        data-scroll=""
        className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain md:flex-initial md:pr-2"
      >
        {first && <Tasks jobs={stage.jobs} kit={kit} words={words} slots={slots} />}
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
export function ModalPart({ stage, slotValues, onSlots, onClose, ...rest }: ModalProps) {
  const dialog = useModalDialog(stage !== null);
  if (!stage) return null;
  const close = () => dialog.current?.close();
  return (
    <dialog
      ref={dialog}
      data-part="modal"
      data-stage={stage.id}
      aria-label={tryTitle(rest.words, stage.name)}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && close()}
      className="m-0 h-dvh max-h-none w-full max-w-none items-center justify-center overscroll-contain bg-transparent p-0 text-inherit backdrop:bg-overlay/70 open:flex md:p-6"
    >
      <Panel {...{ stage, ...rest }} slots={{ values: slotValues, onChange: onSlots }} onClose={close} />
    </dialog>
  );
}
