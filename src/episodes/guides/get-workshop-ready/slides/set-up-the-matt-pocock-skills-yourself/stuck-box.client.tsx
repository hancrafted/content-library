'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import { useCopy } from '@/shared/hooks/use-copy';
import { useId, useState } from 'react';
import { CopyIcon } from './icons';
import { stuckPrompt } from './stuck-prompt.pure';

/** The words the "Stuck?" box shows, and the prompt template it fills; the box owns none. */
export interface StuckWords {
  readonly title: string;
  readonly hint: string;
  readonly pasteLabel: string;
  readonly placeholder: string;
  readonly copy: string;
  readonly copied: string;
  readonly adds: string;
  readonly step: string;
  readonly noError: string;
  readonly prompt: string;
  /** The operating systems and AI agents by the pick values the page's toolbar sets. */
  readonly os: Readonly<Record<string, string>>;
  readonly agent: Readonly<Record<string, string>>;
}

/** The pick a viewer has before they set one on an earlier Slide: the mock's Mac and Claude Code. */
const DEFAULT_OS = 'mac';
const DEFAULT_AGENT = 'claude-code';

/** The "Copy prompt" pill. */
function CopyPromptPill({ label, onCopy }: { label: string; onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="card-hover card-hover--outline inline-flex min-h-10 cursor-pointer items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 text-caption font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring @md:self-center"
    >
      <CopyIcon />
      {label}
    </button>
  );
}

interface PasteRowProps {
  readonly words: StuckWords;
  readonly error: string;
  readonly onError: (value: string) => void;
  readonly onCopy: () => void;
}

/** The paste area for the error and the "Copy prompt" pill beside it. */
function PasteRow({ words, error, onError, onCopy }: PasteRowProps) {
  const field = useId();
  return (
    <div className="flex flex-col gap-3 @md:flex-row @md:items-stretch @md:gap-4">
      <label htmlFor={field} className="sr-only">
        {words.pasteLabel}
      </label>
      <textarea
        id={field}
        rows={2}
        value={error}
        onChange={(event) => onError(event.target.value)}
        placeholder={words.placeholder}
        spellCheck={false}
        autoComplete="off"
        className="min-h-12 flex-1 resize-y rounded-md border border-dashed border-border bg-muted px-4 py-3 font-mono text-caption text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <CopyPromptPill label={words.copy} onCopy={onCopy} />
    </div>
  );
}

/** "The prompt adds" and the chips it adds: the operating system, the AI agent and the step. */
function PromptAdds({ adds, chips }: { adds: string; chips: readonly string[] }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
      {adds}
      {chips.map((chip) => (
        <span key={chip} data-chip className="rounded-full bg-muted px-2 py-0.5 text-foreground">
          {chip}
        </span>
      ))}
    </p>
  );
}

/** The page's operating system and AI agent picks, as words, then this step. */
function useChips(words: StuckWords): readonly [string, string, string] {
  const [os] = usePagePick('os', DEFAULT_OS);
  const [agent] = usePagePick('agent', DEFAULT_AGENT);
  return [words.os[os] ?? os, words.agent[agent] ?? agent, words.step];
}

/**
 * The troubleshooting box under the step card: a paste area for the error and a "Copy prompt" pill that copies the
 * error wrapped with the page's operating system and AI agent picks and this step, ready for free ChatGPT. It reads the
 * picks earlier Slides set (`usePagePick`) and sets none. The paste is this leaf's own, transient (FE-001).
 */
export function StuckBox({ words }: { words: StuckWords }) {
  const chips = useChips(words);
  const [error, setError] = useState('');
  const [announced, copy] = useCopy(words.copied);
  const [os, agent, step] = chips;
  const prompt = stuckPrompt(words.prompt, { os, agent, step, error, noError: words.noError });
  return (
    <section
      data-stuck
      aria-label={words.title}
      className="flex flex-col gap-3 rounded-xl border border-border p-4 @3xl:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-body font-semibold">{words.title}</p>
        <p className="text-caption text-muted-foreground">{words.hint}</p>
      </div>
      <PasteRow words={words} error={error} onError={setError} onCopy={() => void copy(prompt)} />
      <PromptAdds adds={words.adds} chips={chips} />
      <p role="status" aria-live="polite" className="sr-only">
        {announced}
      </p>
    </section>
  );
}
