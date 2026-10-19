'use client';

import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { Sparkle } from './glyphs';

export interface InterviewChatCopy {
  open: string;
  title: string;
  close: string;
  forgotten: string;
  ai: string;
  you: string;
  /** The worked chat, AI first, then turn about: three questions and your three answers. */
  turns: readonly string[];
}

/** The last question is the one you had not thought of. */
const FORGOTTEN_TURN = 4;

/**
 * "See the chat" opens the Interview's worked chat in a native `<dialog>` via `showModal()`: the top layer, so no
 * z-index and no Slide wrapper's `isolate` traps it under the chrome (FE-009 §8). The browser gives Escape, the focus
 * trap and the inert page; a press on the backdrop closes it. Bubbles are tool-neutral: the AI left, you right.
 */
export function InterviewChat({ copy }: { copy: InterviewChatCopy }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();
  return (
    <>
      <OpenButton label={copy.open} onOpen={() => dialog.current?.showModal()} />
      <dialog
        ref={dialog}
        aria-label={copy.title}
        onClick={(event) => event.target === event.currentTarget && close()}
        className="m-0 h-dvh max-h-none w-full max-w-none items-center overscroll-contain justify-center bg-transparent p-4 text-inherit backdrop:bg-overlay/60 backdrop:backdrop-blur-xs open:flex sm:p-6"
      >
        <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 text-foreground shadow-lg">
          <ChatHeader title={copy.title} closeLabel={copy.close} onClose={close} />
          <ol className="mt-4 flex flex-col gap-2 text-caption">
            {copy.turns.map((turn, index) => (
              <ChatTurn key={turn} turn={turn} index={index} copy={copy} />
            ))}
          </ol>
        </div>
      </dialog>
    </>
  );
}

function OpenButton({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={onOpen}
      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-2.5 py-1 text-caption font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
      <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
        <path
          d="M5 11 11 5M6 5h5v5"
          className="fill-none stroke-current"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function ChatHeader({ title, closeLabel, onClose }: { title: string; closeLabel: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
      <p className="flex items-center gap-2 text-body font-semibold">
        <Sparkle className="size-4" />
        {title}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="cursor-pointer rounded-full p-1.5 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" className="fill-none stroke-current" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function ChatTurn({ turn, index, copy }: { turn: string; index: number; copy: InterviewChatCopy }) {
  const ai = index % 2 === 0;
  const forgotten = index === FORGOTTEN_TURN;
  return (
    <li
      data-speaker={ai ? 'ai' : 'you'}
      data-forgotten={forgotten}
      className={cn(
        'flex max-w-md flex-col gap-1 rounded-2xl px-3 py-2',
        ai ? 'rounded-tl-sm border' : 'self-end rounded-tr-sm bg-muted',
        ai && (forgotten ? 'border-ai bg-ai/10' : 'border-ai/40 bg-ai/5'),
      )}
    >
      {forgotten && <span className="font-semibold text-muted-foreground uppercase">{copy.forgotten}</span>}
      <span className="sr-only">{ai ? copy.ai : copy.you}: </span>
      {turn}
    </li>
  );
}
