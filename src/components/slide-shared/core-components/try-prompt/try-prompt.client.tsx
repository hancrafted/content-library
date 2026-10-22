'use client';

import { externalHref } from '@/lib/external-link.pure';
import { cn } from '@/lib/utils';
import { ChevronRight, Copy } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { ChatGptMark, ClaudeMark } from '../chat-icons/chat-icons';
import { IconButton, OUTLINED_ICON } from '../icon-button/icon-button.client';
import { Tip } from '../tip/tip.client';
import { chatLinks } from './chat-links.pure';

/*
 * One prompt as a disclosure, collapsed by default: a row with the label, the Short toggle where there is one and
 * three icon buttons (copy, ChatGPT, Claude), and the prompt text below when opened. Whether it is open is local to
 * this leaf (it passes the reload test, FE-001); the Short choice is the parent's.
 */

/** The prompt a TryPrompt shows and copies: a prompt, or a one-line command, with an optional short variant. */
export interface PromptView {
  readonly kind: 'prompt' | 'command';
  readonly text: string;
  /** The short grill of an interview prompt; the Short toggle swaps it for `text`. */
  readonly short?: string;
}

/** The words a TryPrompt shows; it owns none (the caller passes them in, in the visitor's language). */
export interface TryPromptWords {
  readonly promptLabel: string;
  readonly commandLabel: string;
  readonly copyPrompt: string;
  readonly copyCommand: string;
  readonly openChatgpt: string;
  readonly openClaude: string;
  readonly short: string;
  readonly shortTip: string;
  readonly newTab: string;
}

/** What a prompt box needs from the modal: its words and the two things it can ask for, as one bundle. */
export interface PromptKit {
  /** The job's short grill is on: the prompt shown and copied is its short variant. */
  readonly short: boolean;
  readonly words: TryPromptWords;
  readonly onShort: () => void;
  readonly onCopy: (text: string) => void;
}

const SHORT =
  'inline-flex min-h-9 cursor-pointer items-center rounded-full border border-border px-3 text-caption font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring';

function ShortToggle({ kit }: { kit: PromptKit }) {
  return (
    <Tip text={kit.words.shortTip} place="above" align="end">
      <button
        type="button"
        aria-pressed={kit.short}
        onClick={kit.onShort}
        className={cn(
          SHORT,
          kit.short ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent',
        )}
      >
        {kit.words.short}
      </button>
    </Tip>
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
    <Tip text={label} place="above" align="end">
      <a
        className={OUTLINED_ICON}
        href={externalHref(url)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label}, ${newTab}`}
      >
        {children}
      </a>
    </Tip>
  );
}

/** The three icon buttons of a prompt: copy it, open it in ChatGPT, open it in Claude. */
function PromptActions({ text, copyLabel, kit }: { text: string; copyLabel: string; kit: PromptKit }) {
  const links = chatLinks(text);
  const { words } = kit;
  return (
    <>
      <IconButton label={copyLabel} place="above" align="end" onClick={() => kit.onCopy(text)}>
        <Copy aria-hidden="true" className="size-4" />
      </IconButton>
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

/** The prompt text: focusable and named, so a keyboard user can scroll it. */
function PromptText({ id, open, text, label }: { id: string; open: boolean; text: string; label: string }) {
  return (
    <pre
      id={id}
      hidden={!open}
      tabIndex={0}
      role="region"
      aria-label={label}
      className="max-h-72 overflow-auto border-t border-border p-3 text-caption whitespace-pre-wrap outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {text}
    </pre>
  );
}

export function TryPrompt({ prompt, kit }: { prompt: PromptView; kit: PromptKit }) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  const { words } = kit;
  const text = kit.short && prompt.short !== undefined ? prompt.short : prompt.text;
  const command = prompt.kind === 'command';
  const label = command ? words.commandLabel : words.promptLabel;
  return (
    <div className="rounded-xl border border-border bg-background" data-prompt={prompt.kind}>
      <div className="flex flex-wrap items-center gap-2 p-1.5 pl-2">
        <Toggle open={open} panel={panel} label={label} onToggle={() => setOpen((now) => !now)} />
        {prompt.short !== undefined && <ShortToggle kit={kit} />}
        <PromptActions text={text} copyLabel={command ? words.copyCommand : words.copyPrompt} kit={kit} />
      </div>
      <PromptText id={panel} open={open} text={text} label={label} />
    </div>
  );
}
