'use client';

import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { useEffect, useRef, useState } from 'react';
import type { ModalProps } from './human-in-the-loop.types';
import { ModalHeader } from './modal-header.client';
import type { SlotState, StepKit } from './step-kit.types';
import { Stepper } from './stepper.client';
import { tryTitle } from './words.pure';
import type { StageRun } from './workflow-run.pure';
import type { StageView } from './workflow-view.pure';

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

type PanelProps = Omit<ModalProps, 'stage' | 'run' | 'jobId' | 'slotValues' | 'onSlots' | 'onClose'> & {
  readonly stage: StageView;
  readonly run: StageRun;
  readonly jobId: string | null;
  readonly slots: SlotState;
};

function Panel({ stage, run, jobId, slots, level, onLevel, ...chrome }: PanelProps) {
  const [announced, copy] = useCopy(chrome.words.copied);
  const [showContext, setShowContext] = useState(false);
  const { words } = chrome;
  const first = stage.jobs[0];
  const kit: StepKit = { words, onCopy: copy, info: showContext };
  return (
    <>
      <ModalHeader {...{ stage, words, level, onLevel, showContext }} onContext={setShowContext} />
      {showContext && (
        <DialogDescription data-intro="" className="shrink-0">
          {[stage.goal, words.intro].filter(Boolean).join(' ')}
        </DialogDescription>
      )}
      <div
        data-scroll=""
        className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto overscroll-contain md:flex-initial md:pr-2"
      >
        {first && <Stepper stage={stage} run={run} kit={kit} slots={slots} jobId={jobId} />}
      </div>
      <p role="status" aria-live="polite" className="h-5 shrink-0 text-caption text-muted-foreground">
        {announced}
      </p>
    </>
  );
}

/** The title takes the first focus, so no control (and no tooltip) greets the viewer. */
function focusTitle(event: Event) {
  event.preventDefault();
  document.querySelector<HTMLElement>('[data-part="modal"] [data-autofocus]')?.focus();
}

/** What opened the modal: a stage's name, and the job whose card was pressed in the Detailed view. */
interface Opener {
  readonly stage: string;
  readonly jobId: string | null;
}

/** Closing returns focus to the stage's Practice it button, found by its name: the column re-renders while open. */
function focusOpener(event: Event, opener: Opener | null) {
  if (!opener) return;
  const job = opener.jobId === null ? '' : `[data-try-job="${opener.jobId}"]`;
  const button = document.querySelector<HTMLElement>(`[data-human-in-the-loop] [data-try="${opener.stage}"]${job}`);
  if (!button) return;
  event.preventDefault();
  button.focus();
}

/**
 * The stage modal part: a shadcn Dialog (Radix) open while a stage is open, so it gives the top layer, Escape, the
 * focus trap and a close on the overlay. The title takes the first focus, so no control greets the viewer; closing
 * returns focus to the opener. A copy announces `words.copied` in a polite live region.
 */
export function ModalPart({ stage, run, jobId, slotValues, onSlots, onClose, ...rest }: ModalProps) {
  const opener = useRef<Opener | null>(null);
  useEffect(() => {
    if (stage) opener.current = { stage: stage.name, jobId };
  }, [stage, jobId]);
  return (
    <Dialog open={stage !== null} onOpenChange={(open) => !open && onClose()}>
      {stage && run && (
        <DialogContent
          data-part="modal"
          data-stage={stage.id}
          aria-label={tryTitle(rest.words, stage.name)}
          onOpenAutoFocus={focusTitle}
          onCloseAutoFocus={(event) => focusOpener(event, opener.current)}
          className="h-dvh md:h-auto md:max-h-[calc(100dvh-3rem)] md:max-w-5xl md:p-5"
        >
          <Panel {...{ stage, run, jobId, ...rest }} slots={{ values: slotValues, onChange: onSlots }} />
        </DialogContent>
      )}
    </Dialog>
  );
}
