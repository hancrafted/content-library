'use client';

import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import type { ModalProps } from './human-in-the-loop.types';
import { ModalHeader } from './modal-header.client';
import type { SlotState, StepKit } from './step-kit.types';
import { Stepper } from './stepper.client';
import { tryTitle } from './words.pure';
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

type PanelProps = Omit<ModalProps, 'stage' | 'slotValues' | 'onSlots' | 'onClose'> & {
  readonly stage: StageView;
  readonly slots: SlotState;
};

function Panel({ stage, slots, level, onLevel, ...chrome }: PanelProps) {
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
        {first && <Stepper jobs={stage.jobs} kit={kit} slots={slots} />}
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

/**
 * The stage modal part: a shadcn Dialog (Radix) open while a stage is open, so it gives the top layer, Escape, the
 * focus trap and a close on the overlay. The title takes the first focus, so no control greets the viewer; closing
 * returns focus to the opener. A copy announces `words.copied` in a polite live region.
 */
export function ModalPart({ stage, slotValues, onSlots, onClose, ...rest }: ModalProps) {
  return (
    <Dialog open={stage !== null} onOpenChange={(open) => !open && onClose()}>
      {stage && (
        <DialogContent
          data-part="modal"
          data-stage={stage.id}
          aria-label={tryTitle(rest.words, stage.name)}
          onOpenAutoFocus={focusTitle}
          className="h-dvh md:h-auto md:max-h-[calc(100dvh-3rem)] md:max-w-5xl md:p-5"
        >
          <Panel {...{ stage, ...rest }} slots={{ values: slotValues, onChange: onSlots }} />
        </DialogContent>
      )}
    </Dialog>
  );
}
