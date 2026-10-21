'use client';

import { cn } from '@/lib/utils';
import type { ToolbarProps, UiWords } from './human-in-the-loop.types';
import { workflowView } from './workflow-view.pure';

interface SwitchProps<T extends string> {
  readonly label: string;
  readonly value: T;
  readonly options: readonly { readonly value: T; readonly label: string }[];
  readonly onChange: (value: T) => void;
}

/** A two-way switch of buttons: `aria-pressed` marks the chosen one, and Tab reaches each. */
function Switch<T extends string>({ label, value, options, onChange }: SwitchProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-border bg-card p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-9 rounded-md px-3 text-caption font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
            option.value === value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const modeOptions = (words: UiWords) =>
  [
    { value: 'watch', label: words.modeWatch },
    { value: 'try', label: words.modeTry },
  ] as const;

const levelOptions = (words: UiWords) =>
  [
    { value: 'simple', label: words.levelSimple },
    { value: 'technical', label: words.levelTechnical },
  ] as const;

function Setup({ setup, label }: { setup: string; label: string }) {
  return (
    <section aria-label={label} className="rounded-lg border border-border bg-card p-3">
      <h3 className="text-caption font-medium text-muted-foreground">{label}</h3>
      <pre className="mt-1 text-caption whitespace-pre-wrap">{setup}</pre>
    </section>
  );
}

/**
 * The toolbar part: the Watch / Try it yourself and Simple / Technical switches, and the one-time setup block in
 * Technical. The Workflow picker, upload and download are filled by the toolbar-controls ticket.
 */
export function ToolbarPart({ workflow, mode, level, words, onMode, onLevel }: ToolbarProps) {
  const { setup } = workflowView(workflow, { mode, level });
  return (
    <div data-part="toolbar" data-mode={mode} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Switch
          label={`${words.modeWatch} / ${words.modeTry}`}
          value={mode}
          options={modeOptions(words)}
          onChange={onMode}
        />
        <Switch
          label={`${words.levelSimple} / ${words.levelTechnical}`}
          value={level}
          options={levelOptions(words)}
          onChange={onLevel}
        />
      </div>
      {setup && mode === 'try' ? <Setup setup={setup} label={words.setup} /> : null}
    </div>
  );
}
