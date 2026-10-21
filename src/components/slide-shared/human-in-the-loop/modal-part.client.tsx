'use client';

import { useEffect, useRef, useState } from 'react';
import type { ModalProps } from './human-in-the-loop.types';
import { BUTTON, ModalActions } from './modal-actions.client';
import { ModalBody } from './modal-body';
import { workflowView, type JobCardView } from './workflow-view.pure';

/** Copies text and returns what a live region should say: `done` on success, nothing when the clipboard refuses. */
async function copyText(text: string, done: string): Promise<string> {
  try {
    await navigator.clipboard.writeText(text);
    return done;
  } catch {
    return '';
  }
}

type ViewArgs = Pick<ModalProps, 'workflow' | 'mode' | 'level'>;

function cardFor({ workflow, mode, level }: ViewArgs, jobId: string | undefined): JobCardView | undefined {
  const { stages } = workflowView(workflow, { mode, level });
  return stages.flatMap((stage) => stage.jobs).find((each) => each.id === jobId);
}

function Header({ title, closeLabel, onClose }: { title: string; closeLabel: string; onClose: () => void }) {
  return (
    <header className="flex items-start justify-between gap-3">
      <h2 className="text-subheading font-semibold">{title}</h2>
      <button type="button" className={BUTTON} onClick={onClose}>
        {closeLabel}
      </button>
    </header>
  );
}

function useCopy(done: string) {
  const [announced, setAnnounced] = useState('');
  return [announced, (text: string) => void copyText(text, done).then(setAnnounced)] as const;
}

function useModalDialog(open: boolean) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (open && element && !element.open) element.showModal();
  }, [open]);
  return dialog;
}

/**
 * The job modal part: a native `<dialog>` opened with `showModal()` while a job is open, so the browser gives the top
 * layer, Escape and the focus trap, and a press on the backdrop closes it (same pattern as the interview chat). The
 * header holds the quick actions; the body follows in inverted-pyramid order. A copy announces `words.copied` in a
 * polite live region.
 */
export function ModalPart({ workflow, job, mode, level, words, onClose }: ModalProps) {
  const dialog = useModalDialog(job !== null);
  const [announced, copy] = useCopy(words.copied);
  const card = cardFor({ workflow, mode, level }, job?.id);
  if (!job || !card) return null;
  const close = () => dialog.current?.close();
  return (
    <dialog
      ref={dialog}
      data-part="modal"
      data-job={job.id}
      aria-label={card.title}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && close()}
      className="m-0 h-dvh max-h-none w-full max-w-none items-center justify-center overscroll-contain bg-transparent p-4 text-inherit backdrop:bg-overlay/60 backdrop:backdrop-blur-xs open:flex sm:p-6"
    >
      <div className="flex max-h-full w-full max-w-3xl flex-col rounded-2xl border border-border bg-card p-5 text-foreground shadow-lg">
        <Header title={card.title} closeLabel={words.close} onClose={close} />
        <ModalActions
          label={card.title}
          actions={card.modal.actions}
          words={words}
          onCopy={copy}
          announced={announced}
        />
        <ModalBody sections={card.modal.sections} examples={card.modal.examples} words={words} />
      </div>
    </dialog>
  );
}
