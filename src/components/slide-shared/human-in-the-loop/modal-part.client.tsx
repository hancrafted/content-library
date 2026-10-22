'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ModalProps } from './human-in-the-loop.types';
import { ModalBody, type BodyChrome } from './modal-body';
import { ModalSteps } from './modal-steps.client';
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

function Header({ title, closeLabel, onClose }: { title: string; closeLabel: string; onClose: () => void }) {
  return (
    <header className="flex items-start justify-between gap-3">
      <h2 className="text-body font-semibold">{title}</h2>
      <button
        type="button"
        aria-label={closeLabel}
        title={closeLabel}
        onClick={onClose}
        className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
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
    if (isOpen && element && !element.open) element.showModal();
  }, [isOpen]);
  return dialog;
}

interface JobSectionProps {
  readonly job: JobModalView;
  readonly several: boolean;
  readonly short: boolean;
  readonly chrome: BodyChrome;
  readonly onShort: () => void;
  readonly onCopy: (text: string) => void;
}

/** One job of the stage: its numbered steps, then, below them, its explanation. */
function JobSection({ job, several, short, chrome, onShort, onCopy }: JobSectionProps) {
  return (
    <section data-job={job.id} aria-label={several ? job.title : undefined} className="flex flex-col gap-6">
      {several && <h3 className="text-body font-semibold">{job.title}</h3>}
      <ModalSteps job={job} short={short} words={chrome.words} onShort={onShort} onCopy={onCopy} />
      <ModalBody sections={job.sections} examples={job.examples} chrome={chrome} />
    </section>
  );
}

interface PanelProps {
  readonly stage: StageView;
  readonly shortJobIds: readonly string[];
  readonly chrome: BodyChrome;
  readonly onShort: (jobId: string) => void;
  readonly onClose: () => void;
}

/** The card inside the dialog: the header, then every job of the stage, then the live region a copy announces in. */
function Panel({ stage, shortJobIds, chrome, onShort, onClose }: PanelProps) {
  const [announced, copy] = useCopy(chrome.words.copied);
  const { words } = chrome;
  return (
    <div className="flex max-h-full w-full max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-foreground shadow-lg">
      <Header title={words.tryTitle.replace('{stage}', stage.name)} closeLabel={words.close} onClose={onClose} />
      <div className="flex min-h-0 flex-col gap-8 overflow-y-auto overscroll-contain pr-2">
        {stage.jobs.map((job) => (
          <JobSection
            key={job.id}
            job={job}
            several={stage.jobs.length > 1}
            short={shortJobIds.includes(job.id)}
            chrome={chrome}
            onShort={() => onShort(job.id)}
            onCopy={copy}
          />
        ))}
      </div>
      <p role="status" aria-live="polite" className="h-5 text-caption text-muted-foreground">
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
export function ModalPart({ stage, shortJobIds, onClose, onShort, ...chrome }: ModalProps) {
  const dialog = useModalDialog(stage !== null);
  if (!stage) return null;
  const close = () => dialog.current?.close();
  return (
    <dialog
      ref={dialog}
      data-part="modal"
      data-stage={stage.id}
      aria-label={chrome.words.tryTitle.replace('{stage}', stage.name)}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && close()}
      className="m-0 h-dvh max-h-none w-full max-w-none items-center justify-center overscroll-contain bg-transparent p-4 text-inherit backdrop:bg-overlay/60 backdrop:backdrop-blur-xs open:flex sm:p-6"
    >
      <Panel stage={stage} shortJobIds={shortJobIds} chrome={chrome} onShort={onShort} onClose={close} />
    </dialog>
  );
}
