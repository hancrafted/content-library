'use client';

import { cn } from '@/lib/utils';
import type { ToolbarProps, UiWords } from './human-in-the-loop.types';
import { offers, type ControlId } from './toolbar-controls.pure';
import { WorkflowControls } from './workflow-controls.client';

interface SwitchProps<T extends string> {
  readonly label: string;
  readonly value: T;
  readonly options: readonly { readonly value: T; readonly label: string }[];
  readonly onChange: (value: T) => void;
}

/** A two-way switch of buttons: `aria-pressed` marks the chosen one, and Tab reaches each. */
function Switch<T extends string>({ label, value, options, onChange }: SwitchProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-lg border border-border bg-card p-0.5 text-muted-foreground"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-7 rounded-md px-2.5 text-caption font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
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
 * The toolbar part. In Watch it is only the Watch / Try it yourself switch, so the talk looks as it does today; in Try
 * it adds the Simple / Technical switch, the one-time setup block in Technical, and the picker, download and upload
 * (`WorkflowControls`). The control registry says what shows in which mode and the Slide's Preset can hide any of it.
 * The row keeps its height from Watch to Try, so the diagram stays put.
 */
export function ToolbarPart(props: ToolbarProps) {
  const { mode, level, words, controls, setup, onMode, onLevel } = props;
  const shows = (id: ControlId) => offers(controls, id, mode);
  return (
    <div data-part="toolbar" data-mode={mode} className="mb-3 flex flex-col gap-2">
      <div className="flex min-h-9 flex-wrap items-center gap-x-2 gap-y-1">
        {shows('mode') ? (
          <Switch
            label={`${words.modeWatch} / ${words.modeTry}`}
            value={mode}
            options={modeOptions(words)}
            onChange={onMode}
          />
        ) : null}
        {shows('level') ? (
          <Switch
            label={`${words.levelSimple} / ${words.levelTechnical}`}
            value={level}
            options={levelOptions(words)}
            onChange={onLevel}
          />
        ) : null}
        <WorkflowControls {...props} />
      </div>
      {setup && shows('setup') ? <Setup setup={setup} label={words.setup} /> : null}
    </div>
  );
}
