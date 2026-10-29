'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import { useCopy } from '@/shared/hooks/use-copy';
import { useId, useState } from 'react';
import {
  agentOf,
  DEFAULT_AGENT,
  DEFAULT_OS,
  osOf,
  stuckPrompt,
  type AgentPick,
  type OsPick,
} from './stuck-prompt.pure';

/** The box's words, in the viewer's language; `prompt` is the template the box fills (`{os}`, `{agent}`, …). */
export interface StuckWords {
  readonly title: string;
  readonly hint: string;
  readonly paste: string;
  readonly placeholder: string;
  readonly includes: string;
  readonly copy: string;
  readonly copied: string;
  readonly prompt: string;
  readonly empty: string;
  readonly step: string;
  readonly os: Readonly<Record<OsPick, string>>;
  readonly agents: Readonly<Record<AgentPick, string>>;
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" className="fill-none stroke-current" strokeWidth="1.4" />
      <path
        d="M10.5 3.5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v6.5a1 1 0 0 0 1 1h.5"
        className="fill-none stroke-current"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function Chips({ label, chips }: { label: string; chips: readonly string[] }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
      {label}
      {chips.map((chip) => (
        <span key={chip} data-chip className="rounded-full bg-muted px-3 py-0.5 text-foreground">
          {chip}
        </span>
      ))}
    </p>
  );
}

/** The page's picks in the box's words: the computer and the AI agent the prompt names. */
function usePicked(words: StuckWords) {
  const [os] = usePagePick('os', DEFAULT_OS);
  const [agent] = usePagePick('agent', DEFAULT_AGENT);
  return { os: words.os[osOf(os)], agent: words.agents[agentOf(agent)] };
}

function CopyButton({ label, announced, onCopy }: { label: string; announced: string; onCopy: () => void }) {
  return (
    <span className="flex items-center gap-3">
      <span role="status" className="text-caption text-muted-foreground">
        {announced}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="card-hover card-hover--outline inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-1.5 text-caption font-semibold"
      >
        <CopyIcon />
        {label}
      </button>
    </span>
  );
}

function PasteArea({ words, value, onChange }: { words: StuckWords; value: string; onChange: (next: string) => void }) {
  const field = useId();
  return (
    <>
      <label htmlFor={field} className="sr-only">
        {words.paste}
      </label>
      <textarea
        id={field}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={words.placeholder}
        className="min-h-16 rounded-xl border border-dashed border-border bg-background px-4 py-3 font-mono text-caption placeholder:text-muted-foreground"
      />
    </>
  );
}

/**
 * The Visual language's troubleshooting box: the viewer pastes what they see, and "Copy prompt" copies a prompt for
 * free ChatGPT that wraps it with their computer, their AI agent and this step. What they paste lives here only
 * (transient, FE-001): a reload loses it, and pasting it again is one action.
 */
export function StuckBox({ words }: { words: StuckWords }) {
  const [error, setError] = useState('');
  const [announced, copy] = useCopy(words.copied);
  const picked = usePicked(words);
  const prompt = () => stuckPrompt(words.prompt, { ...picked, step: words.step, error, empty: words.empty });
  return (
    <div data-stuck className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-body font-semibold">{words.title}</p>
        <p className="text-caption text-muted-foreground">{words.hint}</p>
      </div>
      <PasteArea words={words} value={error} onChange={setError} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Chips label={words.includes} chips={[picked.os, picked.agent, words.step]} />
        <CopyButton label={words.copy} announced={announced} onCopy={() => void copy(prompt())} />
      </div>
    </div>
  );
}
