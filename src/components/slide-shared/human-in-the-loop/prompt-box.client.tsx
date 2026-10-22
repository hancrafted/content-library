'use client';

import { externalHref } from '@/lib/external-link.pure';
import { cn } from '@/lib/utils';
import { ChevronRight, Copy } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { ChatGptMark, ClaudeMark } from './chat-icons';
import type { UiWords } from './human-in-the-loop.types';
import { chatLinks, type PromptView } from './workflow-view.pure';

/*
 * One prompt as a disclosure, collapsed by default: a row with the label, the Short toggle where there is one and
 * three icon buttons (copy, ChatGPT, Claude), and the prompt text below when opened. Whether it is open is local to
 * this leaf (it passes the reload test, FE-001); the Short choice is the parent's.
 */

const ICON =
  'group/tip relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring';

const TIP =
  'pointer-events-none absolute right-0 bottom-full z-20 mb-1.5 hidden w-max max-w-48 rounded-lg bg-foreground px-2 py-1 text-start text-caption font-normal text-background group-hover/tip:block group-focus-visible/tip:block';

function Tip({ children }: { readonly children: ReactNode }) {
  return (
    <span aria-hidden="true" className={TIP}>
      {children}
    </span>
  );
}

interface PromptBoxProps {
  readonly prompt: PromptView;
  /** The job's short grill is on: the prompt shown and copied is its short variant. */
  readonly short: boolean;
  readonly words: UiWords;
  readonly onShort: () => void;
  readonly onCopy: (text: string) => void;
}

const SHORT =
  'inline-flex min-h-9 cursor-pointer items-center rounded-full border border-border px-3 text-caption font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring';

function ShortToggle({ on, words, onShort }: { on: boolean; words: UiWords; onShort: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={words.shortTip}
      onClick={onShort}
      className={cn(
        SHORT,
        on ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent',
      )}
    >
      {words.short}
    </button>
  );
}

function ChatLink({
  url,
  label,
  newTab,
  children,
}: {
  url: string;
  label: string;
  newTab: string;
  children: ReactNode;
}) {
  return (
    <a
      className={ICON}
      href={externalHref(url)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}, ${newTab}`}
    >
      {children}
      <Tip>{label}</Tip>
    </a>
  );
}

interface ActionsProps {
  readonly text: string;
  readonly copyLabel: string;
  readonly words: UiWords;
  readonly onCopy: (text: string) => void;
}

/** The three icon buttons of a prompt: copy it, open it in ChatGPT, open it in Claude. */
function PromptActions({ text, copyLabel, words, onCopy }: ActionsProps) {
  const links = chatLinks(text);
  return (
    <>
      <button type="button" className={ICON} aria-label={copyLabel} onClick={() => onCopy(text)}>
        <Copy aria-hidden="true" className="size-4" />
        <Tip>{copyLabel}</Tip>
      </button>
      <ChatLink url={links.chatgpt} label={words.openChatgpt} newTab={words.newTab}>
        <ChatGptMark className="size-4" />
      </ChatLink>
      <ChatLink url={links.claude} label={words.openClaude} newTab={words.newTab}>
        <ClaudeMark className="size-4" />
      </ChatLink>
    </>
  );
}

function Toggle({
  open,
  label,
  panel,
  onToggle,
}: {
  open: boolean;
  label: string;
  panel: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={panel}
      onClick={onToggle}
      className="inline-flex min-h-9 flex-1 cursor-pointer items-center gap-1.5 rounded-lg text-left text-caption font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ChevronRight aria-hidden="true" className={cn('size-4 transition-transform', open && 'rotate-90')} />
      {label}
    </button>
  );
}

function PromptText({ id, open, text }: { id: string; open: boolean; text: string }) {
  return (
    <pre
      id={id}
      hidden={!open}
      className="max-h-72 overflow-auto border-t border-border p-3 text-caption whitespace-pre-wrap"
    >
      {text}
    </pre>
  );
}

export function PromptBox({ prompt, short, words, onShort, onCopy }: PromptBoxProps) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  const text = short && prompt.short !== undefined ? prompt.short : prompt.text;
  const command = prompt.kind === 'command';
  return (
    <div className="rounded-xl border border-border bg-background" data-prompt={prompt.kind}>
      <div className="flex flex-wrap items-center gap-2 p-1.5 pl-2">
        <Toggle
          open={open}
          panel={panel}
          label={command ? words.commandLabel : words.promptLabel}
          onToggle={() => setOpen((now) => !now)}
        />
        {prompt.short !== undefined && <ShortToggle on={short} words={words} onShort={onShort} />}
        <PromptActions
          text={text}
          copyLabel={command ? words.copyCommand : words.copyPrompt}
          words={words}
          onCopy={onCopy}
        />
      </div>
      <PromptText id={panel} open={open} text={text} />
    </div>
  );
}
