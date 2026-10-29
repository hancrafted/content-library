'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import { useCopy } from '@/shared/hooks/use-copy';
import { Copy } from 'lucide-react';
import { useId, useState } from 'react';
import { agentOf, DEFAULT_AGENT, DEFAULT_OS, osOf, stuckContext, stuckPrompt } from './first-skill.pure';

/** The troubleshooting box's words, in the visitor's language; `prompt` keeps its `{placeholders}` (FE-003 §3). */
export interface StuckWords {
  readonly title: string;
  readonly step: string;
  readonly field: string;
  readonly placeholder: string;
  readonly copy: string;
  readonly copied: string;
  readonly hint: string;
  readonly empty: string;
  readonly prompt: string;
}

/** Where the viewer is: the page's OS and AI-agent picks. */
function usePlace() {
  const [os] = usePagePick('os', DEFAULT_OS);
  const [agent] = usePagePick('agent', DEFAULT_AGENT);
  return { os: osOf(os), agent: agentOf(agent) };
}

const FIELD =
  'min-h-12 flex-1 resize-y rounded-lg border border-dashed border-border bg-muted/50 px-4 py-3 font-mono text-caption text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring';
const PILL =
  'inline-flex min-h-9 shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 text-caption font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring @xl:self-auto';

interface PasteRowProps {
  readonly words: StuckWords;
  readonly id: string;
  readonly error: string;
  readonly onError: (error: string) => void;
  readonly onCopy: () => void;
}

/** The paste area for the viewer's error and the "Copy prompt" pill beside it. */
function PasteRow({ words, id, error, onError, onCopy }: PasteRowProps) {
  return (
    <div className="flex flex-col gap-3 @xl:flex-row @xl:items-end">
      <label htmlFor={id} className="sr-only">
        {words.field}
      </label>
      <textarea
        id={id}
        rows={2}
        value={error}
        onChange={(event) => onError(event.target.value)}
        placeholder={words.placeholder}
        className={FIELD}
      />
      <button type="button" onClick={onCopy} className={PILL}>
        <Copy aria-hidden className="size-4" />
        {words.copy}
      </button>
    </div>
  );
}

/**
 * The Visual language's troubleshooting box: the viewer pastes an error, and "Copy prompt" copies a prompt for free
 * ChatGPT that wraps it with OS, AI agent and step. The paste is transient (FE-001 §1): a reload loses only text the
 * viewer still has on screen.
 */
export function StuckBox({ words }: { words: StuckWords }) {
  const place = usePlace();
  const [error, setError] = useState('');
  const [announced, copy] = useCopy(words.copied);
  const id = useId();
  const onCopy = () => void copy(stuckPrompt(words.prompt, { ...place, step: words.step, error, empty: words.empty }));
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-3 rounded-xl border border-border p-4 @3xl:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id={`${id}-title`} className="text-body font-semibold">
          {words.title}
        </p>
        <p data-stuck-context className="text-caption text-muted-foreground">
          {stuckContext({ ...place, step: words.step })}
        </p>
      </div>
      <PasteRow words={words} id={id} error={error} onError={setError} onCopy={onCopy} />
      <p className="text-caption text-muted-foreground">
        {words.hint} <span role="status">{announced}</span>
      </p>
    </section>
  );
}
