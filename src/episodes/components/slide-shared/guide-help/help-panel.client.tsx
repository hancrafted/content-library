'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import {
  ChatButtons,
  DEFAULT_CHAT_BUTTONS,
  type ChatButtonsWords,
} from '@/shared/components/core-components/chat-buttons/chat-buttons';
import { CopyButton } from '@/shared/components/core-components/try-prompt/prompt-actions.client';
import { useCopy } from '@/shared/hooks/use-copy';
import { cn } from '@/shared/lib/utils';
import { CircleQuestionMark } from 'lucide-react';
import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { helpPrompt } from './help-prompt.pure';

/** The Help button's and panel's words, from the Slide's own Translation file. */
export interface HelpWords {
  /** The button's name, "Help", and the panel's accessible name. */
  readonly button: string;
  /** The textarea's accessible name. */
  readonly label: string;
  readonly placeholder: string;
  readonly copy: string;
  readonly copied: string;
  /** The tooltip on Copy prompt: where the prompt goes. */
  readonly copyTip: string;
  /** The prompt template: `{os}`, `{agent}`, `{step}` and `{error}`. */
  readonly prompt: string;
  /** What the prompt says when nothing was typed. */
  readonly noError: string;
  readonly chats: ChatButtonsWords;
}

/** Each pick's product names by value, and the value read until the viewer picks. */
export interface HelpPicks {
  readonly os: { readonly fallback: string; readonly names: Readonly<Record<string, string>> };
  readonly agent: { readonly fallback: string; readonly names: Readonly<Record<string, string>> };
}

export interface HelpPanelProps {
  /** The step the prompt names: "Step 3: Install your AI agent". */
  readonly step: string;
  readonly words: HelpWords;
  readonly picks: HelpPicks;
}

/** The page's OS and AI agent as names, or the defaults before the viewer picks. */
function usePickedNames(picks: HelpPicks) {
  const [os] = usePagePick('os', picks.os.fallback);
  const [agent] = usePagePick('agent', picks.agent.fallback);
  return {
    os: picks.os.names[os] ?? picks.os.names[picks.os.fallback] ?? os,
    agent: picks.agent.names[agent] ?? picks.agent.names[picks.agent.fallback] ?? agent,
  };
}

function HelpButton({
  open,
  panel,
  label,
  onToggle,
}: {
  open: boolean;
  panel: string;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={panel}
      data-help-button=""
      onClick={onToggle}
      className={cn(
        'ml-auto inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-1 text-caption font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'border-brand-accent bg-brand-accent text-on-brand-accent hover:bg-brand-accent/85',
        open && 'ring-2 ring-ring',
      )}
    >
      <CircleQuestionMark aria-hidden="true" className="size-4" />
      {label}
    </button>
  );
}

interface FieldProps {
  readonly id: string;
  readonly words: HelpWords;
  readonly text: string;
  readonly onText: (value: string) => void;
  readonly inputRef: RefObject<HTMLTextAreaElement | null>;
}

function HelpField({ id, words, text, onText, inputRef }: FieldProps) {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {words.label}
      </label>
      <textarea
        ref={inputRef}
        id={id}
        value={text}
        onChange={(event) => onText(event.target.value)}
        placeholder={words.placeholder}
        rows={3}
        spellCheck={false}
        className="min-h-20 flex-1 resize-y rounded-md border border-dashed border-border bg-muted px-4 py-3 font-mono text-caption text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
    </>
  );
}

function HelpActions({ words, onCopy }: { words: HelpWords; onCopy: () => Promise<boolean> }) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
      <CopyButton label={words.copy} done={words.copied} tip={words.copyTip} onCopy={onCopy} lead />
      <ChatButtons buttons={DEFAULT_CHAT_BUTTONS} words={words.chats} />
    </div>
  );
}

/**
 * The Slide's Help (Visual language "Help"): a button at the right end of the title row and, closed until it is
 * pressed, a panel under the header that pushes the Scene down. The panel holds a field for a question or a pasted
 * error, Copy prompt, and the AI chats to paste into. The prompt wraps the field with the page's OS and AI agent and
 * `step`. The field is transient (FE-001 §1): it lives here only, and keeps its text while the panel is closed.
 */
export function HelpPanel({ step, words, picks }: HelpPanelProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [announced, copy] = useCopy(words.copied);
  const names = usePickedNames(picks);
  const panel = useId();
  const field = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);
  const onCopy = () => copy(helpPrompt(words.prompt, { ...names, step, error: text, noError: words.noError }));
  return (
    <>
      <HelpButton open={open} panel={panel} label={words.button} onToggle={() => setOpen((now) => !now)} />
      <section
        id={panel}
        hidden={!open}
        aria-label={words.button}
        data-help-panel=""
        className="flex basis-full flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-start"
      >
        <HelpField id={`${panel}-field`} words={words} text={text} onText={setText} inputRef={field} />
        <HelpActions words={words} onCopy={onCopy} />
        <span className="sr-only" role="status">
          {announced}
        </span>
      </section>
    </>
  );
}
