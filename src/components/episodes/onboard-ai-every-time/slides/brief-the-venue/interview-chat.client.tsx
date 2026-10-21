'use client';

import { externalHref } from '@/lib/external-link.pure';
import { cn } from '@/lib/utils';
import { useRef, type ReactNode } from 'react';

/** A skill the turn invokes: its slash command, linked to where the skill is published. */
export interface ChatSkill {
  command: string;
  url: string;
}

/** One turn of the worked chat: a question from the AI (its two options and a recommendation), or your reply. */
export interface ChatTurnCopy {
  slug: string;
  speaker: 'ai' | 'you';
  text: string;
  skill?: ChatSkill;
  options?: readonly string[];
  recommended?: string;
  /** The question you had not thought of. */
  forgotten?: boolean;
}

export interface InterviewChatCopy {
  /** The AI sparkle, drawn by the server entry from the shared glyphs. */
  sparkle: ReactNode;
  open: string;
  title: string;
  close: string;
  forgotten: string;
  ai: string;
  you: string;
  recommended: string;
  newTab: string;
  /** The worked chat: you start a grilling, the AI asks one numbered question at a time, you end with a spec. */
  turns: readonly ChatTurnCopy[];
}

/**
 * "See the chat" opens the Interview's worked chat in a native `<dialog>` via `showModal()`: the top layer, so no
 * z-index and no Slide wrapper's `isolate` traps it under the chrome (FE-009 §8). The browser gives Escape, the focus
 * trap and the inert page; a press on the backdrop closes it. Bubbles are tool-neutral: the AI left, you right. The
 * chat scrolls inside the card, so a long chat never runs past the viewport.
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
        <div className="flex max-h-full w-full max-w-2xl flex-col rounded-2xl border border-border bg-card p-5 text-foreground shadow-lg">
          <ChatHeader title={copy.title} sparkle={copy.sparkle} closeLabel={copy.close} onClose={close} />
          <ol className="mt-4 flex min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain pr-2 text-caption">
            {copy.turns.map((turn) => (
              <ChatTurn key={turn.slug} turn={turn} copy={copy} />
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

function ChatHeader({
  title,
  sparkle,
  closeLabel,
  onClose,
}: {
  title: string;
  sparkle: ReactNode;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
      <p className="flex items-center gap-2 text-body font-semibold">
        {sparkle}
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

/** A slash command as a link to the skill's source, opening a new tab. */
function SkillLink({ skill, newTab }: { skill: ChatSkill; newTab: string }) {
  return (
    <a
      href={externalHref(skill.url)}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-sm font-semibold text-primary underline underline-offset-2 outline-none hover:no-underline focus-visible:ring-2 focus-visible:ring-ring"
    >
      {skill.command}
      <span className="sr-only"> {newTab}</span>
    </a>
  );
}

/** A question's two options and the AI's recommendation, under its text. */
function Question({
  options,
  recommended,
  label,
}: {
  options: readonly string[];
  recommended?: string;
  label: string;
}) {
  return (
    <>
      <ul className="flex flex-col gap-0.5 pl-2">
        {options.map((option) => (
          <li key={option}>{option}</li>
        ))}
      </ul>
      {recommended && (
        <p>
          <span className="font-semibold">{label}</span> {recommended}
        </p>
      )}
    </>
  );
}

function ChatTurn({ turn, copy }: { turn: ChatTurnCopy; copy: InterviewChatCopy }) {
  const ai = turn.speaker === 'ai';
  return (
    <li
      data-speaker={turn.speaker}
      data-forgotten={turn.forgotten === true}
      className={cn(
        'flex max-w-md shrink-0 flex-col gap-1 rounded-2xl px-3 py-2',
        ai ? 'rounded-tl-sm border' : 'self-end rounded-tr-sm bg-muted',
        ai && (turn.forgotten ? 'border-ai bg-ai/10' : 'border-ai/40 bg-ai/5'),
      )}
    >
      {turn.forgotten && <span className="font-semibold text-muted-foreground uppercase">{copy.forgotten}</span>}
      <span className="sr-only">{ai ? copy.ai : copy.you}: </span>
      <TurnBody turn={turn} copy={copy} />
    </li>
  );
}

/** What a turn says: its text, after the skill command it invokes, then a question's options. */
function TurnBody({ turn, copy }: { turn: ChatTurnCopy; copy: InterviewChatCopy }) {
  return (
    <>
      {turn.skill ? (
        <span>
          <SkillLink skill={turn.skill} newTab={copy.newTab} /> {turn.text}
        </span>
      ) : (
        turn.text
      )}
      {turn.options && <Question options={turn.options} recommended={turn.recommended} label={copy.recommended} />}
    </>
  );
}
