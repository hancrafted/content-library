'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import { useCopy } from '@/shared/hooks/use-copy';
import { useId, useState } from 'react';
import { AGENTS, DEFAULT_AGENT, DEFAULT_OS, OPERATING_SYSTEMS, pickOf } from './picks.pure';
import { stuckPrompt } from './stuck-prompt.pure';

/** The troubleshooting box's words, from its Slide's own Translation file. */
export interface StuckWords {
  readonly title: string;
  readonly hint: string;
  readonly pasteLabel: string;
  readonly placeholder: string;
  readonly copy: string;
  readonly copied: string;
  readonly adds: string;
  /** The prompt template: `{os}`, `{agent}`, `{step}` and `{error}`. */
  readonly prompt: string;
  readonly noError: string;
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <rect x="5" y="5" width="8" height="9" rx="1.5" className="fill-none stroke-current" strokeWidth="1.5" />
      <path
        d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H10"
        className="fill-none stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Chip({ children }: { children: string }) {
  return <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">{children}</span>;
}

/** The Copy prompt pill: it says "copied" once the clipboard took the prompt. */
function CopyButton({ words, copied, onCopy }: { words: StuckWords; copied: boolean; onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="card-hover card-hover--outline inline-flex min-h-9 cursor-pointer items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 text-caption font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-center"
    >
      <CopyIcon />
      {copied ? words.copied : words.copy}
    </button>
  );
}

interface PasteRowProps {
  readonly words: StuckWords;
  readonly error: string;
  readonly onError: (value: string) => void;
  readonly onCopy: () => void;
  readonly announced: string;
}

/** The paste area and the Copy prompt pill; the pill says "copied" once the clipboard took the prompt. */
function PasteRow({ words, error, onError, onCopy, announced }: PasteRowProps) {
  const field = useId();
  return (
    <div className="flex flex-col items-stretch gap-4 sm:flex-row">
      <label htmlFor={field} className="sr-only">
        {words.pasteLabel}
      </label>
      <textarea
        id={field}
        value={error}
        onChange={(event) => onError(event.target.value)}
        placeholder={words.placeholder}
        rows={2}
        spellCheck={false}
        className="min-h-12 flex-1 resize-y rounded-md border border-dashed border-border bg-muted px-4 py-3 font-mono text-caption text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <CopyButton words={words} copied={announced !== ''} onCopy={onCopy} />
      <span className="sr-only" role="status">
        {announced}
      </span>
    </div>
  );
}

/** The picks as names: the page's operating system and AI agent, or the defaults before the viewer picks. */
function usePickedNames() {
  const [osValue] = usePagePick('os', DEFAULT_OS);
  const [agentValue] = usePagePick('agent', DEFAULT_AGENT);
  return {
    os: pickOf(OPERATING_SYSTEMS, osValue, DEFAULT_OS).name,
    agent: pickOf(AGENTS, agentValue, DEFAULT_AGENT).name,
  };
}

/**
 * "Stuck?" (Visual language "The troubleshooting box"): a paste area for the error and a Copy prompt pill. The
 * prompt wraps the paste with the page's picked operating system and AI agent and this `step`, ready for free
 * ChatGPT. The paste is transient: it lives in this box only (FE-001 §1).
 */
export function StuckBox({ step, words }: { step: string; words: StuckWords }) {
  const { os, agent } = usePickedNames();
  const [error, setError] = useState('');
  const [announced, copy] = useCopy(words.copied);
  const title = useId();
  const onCopy = () => void copy(stuckPrompt(words.prompt, { os, agent, step, error, noError: words.noError }));
  return (
    <section
      className="flex flex-col gap-3 rounded-xl border border-border p-6"
      aria-labelledby={title}
      data-stuck-box=""
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p id={title} className="text-body font-semibold">
          {words.title}
        </p>
        <p className="text-caption text-muted-foreground">{words.hint}</p>
      </div>
      <PasteRow words={words} error={error} onError={setError} onCopy={onCopy} announced={announced} />
      <p className="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
        {words.adds}
        <Chip>{os}</Chip>
        <Chip>{agent}</Chip>
        <Chip>{step}</Chip>
      </p>
    </section>
  );
}
