'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import { useCopy } from '@/shared/hooks/use-copy';
import { useId, useState } from 'react';
import { agentOf, osOf, stuckPrompt, type PickNames } from './stuck-prompt.pure';

/** The troubleshooting box's words, in the viewer's language; `template` keeps its `{placeholders}`. */
export interface StuckWords {
  readonly title: string;
  readonly hint: string;
  readonly label: string;
  readonly placeholder: string;
  readonly adds: string;
  readonly step: string;
  readonly copy: string;
  readonly copied: string;
  readonly noError: string;
  readonly template: string;
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M8 8h11v12H8zM5 16V4h11" className="fill-none stroke-current" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** The paste area: the viewer's own text, the one place it appears on the page. */
function PasteArea({
  words,
  value,
  onChange,
}: {
  words: StuckWords;
  value: string;
  onChange: (value: string) => void;
}) {
  const field = useId();
  return (
    <>
      <label htmlFor={field} className="sr-only">
        {words.label}
      </label>
      <textarea
        id={field}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={words.placeholder}
        rows={3}
        spellCheck={false}
        className="min-h-20 w-full resize-y rounded-xl border border-dashed border-border bg-muted px-4 py-3 font-mono text-caption text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
    </>
  );
}

/** What the prompt adds, by name, and the "Copy prompt" pill. */
function CopyRow({ words, adds, onCopy }: { words: StuckWords; adds: readonly string[]; onCopy: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-caption text-muted-foreground">
        {words.adds}{' '}
        {adds.map((item, index) => (
          <span key={item}>
            {index > 0 ? ' · ' : null}
            <span className="font-semibold text-foreground">{item}</span>
          </span>
        ))}
      </p>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-foreground px-4 py-2 text-caption font-semibold text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <CopyIcon />
        {words.copy}
      </button>
    </div>
  );
}

/**
 * The Visual language's troubleshooting box under the step card: a paste area for the viewer's error and a "Copy
 * prompt" pill that wraps it with the picked OS, AI agent and this step, ready for free ChatGPT. The pasted text is
 * transient (FE-001): it lives in this leaf and is gone on reload.
 */
export function StuckBox({ words, names }: { words: StuckWords; names: PickNames }) {
  const [os] = usePagePick('os', 'mac');
  const [agent] = usePagePick('agent', 'claude-code');
  const [error, setError] = useState('');
  const [announced, copy] = useCopy(words.copied);
  const onCopy = () =>
    void copy(stuckPrompt(words.template, names, { os, agent, step: words.step, error, noError: words.noError }));
  return (
    <section
      aria-label={words.title}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-body font-semibold text-foreground">{words.title}</p>
        <p className="text-caption text-muted-foreground">{words.hint}</p>
      </div>
      <PasteArea words={words} value={error} onChange={setError} />
      <CopyRow words={words} adds={[names.os[osOf(os)], names.agent[agentOf(agent)], words.step]} onCopy={onCopy} />
      <p aria-live="polite" className="text-caption text-muted-foreground empty:hidden">
        {announced}
      </p>
    </section>
  );
}
