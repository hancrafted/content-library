'use client';

import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { Tip } from '../tip/tip.client';
import { explanation, joinPrompt, sectionText, type PromptParts, type SlotValues } from './prompt-sections.pure';
import { SlotInput } from './slot-input.client';
import type { TryPromptWords } from './try-prompt.types';

/*
 * The opened prompt as two panels, each a disclosure: "What to do" (open by default: the step's instructions and its
 * slot fields; absent when it has neither) and "Prompt preview" (closed by default: each section under its H2 and
 * purpose marker). Nothing in it sets a width: text wraps, so the box never outgrows the modal.
 */

/** The marker beside a section's H2: its purpose, with the explanation as the tooltip. */
function PurposeMarker({ purpose, text }: { purpose: string; text: string }) {
  return (
    <Tip text={text} place="below" align="start">
      <span
        tabIndex={0}
        role="note"
        aria-label={`${purpose}: ${text}`}
        data-purpose={purpose}
        className="inline-flex min-h-6 cursor-help items-center rounded-full border border-border px-2 text-caption text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {purpose}
      </span>
    </Tip>
  );
}

interface BodyProps {
  readonly id: string;
  readonly open: boolean;
  readonly parts: PromptParts;
  readonly purposes: Readonly<Record<string, string>>;
  readonly instructions?: string;
  readonly values: SlotValues;
  readonly words: TryPromptWords;
  readonly onValue: (key: string, value: string) => void;
}

function Sections({ parts, purposes, values }: Pick<BodyProps, 'parts' | 'purposes' | 'values'>) {
  return parts.sections.map((section, at) => {
    const why = explanation(section, purposes);
    return (
      <section key={at} data-section={at} className="flex min-w-0 flex-col gap-1">
        {section.heading !== undefined && (
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-body font-semibold">{section.heading}</h2>
            {why !== undefined && <PurposeMarker purpose={section.purpose!} text={why} />}
          </div>
        )}
        <p className="text-caption wrap-anywhere whitespace-pre-wrap">
          {sectionText({ ...section, heading: undefined }, parts, values)}
        </p>
      </section>
    );
  });
}

interface PanelProps {
  readonly name: 'todo' | 'preview';
  readonly title: string;
  readonly initiallyOpen: boolean;
  readonly children: ReactNode;
}

/** A disclosure: a full-width toggle with `aria-expanded`, and the panel it shows or hides. */
function Panel({ name, title, initiallyOpen, children }: PanelProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const panel = useId();
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <button
        type="button"
        data-panel-toggle={name}
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => setOpen((now) => !now)}
        className="inline-flex min-h-9 w-full cursor-pointer items-center gap-1.5 rounded-lg text-left text-caption font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRight aria-hidden="true" className={cn('size-4 transition-transform', open && 'rotate-90')} />
        {title}
      </button>
      <div id={panel} data-panel={name} hidden={!open} className="flex min-w-0 flex-col gap-3">
        {children}
      </div>
    </div>
  );
}

/** The panel of what the visitor does: the step's instructions, then its slot fields. */
function Todo({ instructions, parts, values, words, onValue }: Omit<BodyProps, 'id' | 'open' | 'purposes'>) {
  return (
    <Panel name="todo" title={words.whatToDo} initiallyOpen>
      {instructions !== undefined && <p className="text-caption wrap-anywhere">{instructions}</p>}
      {parts.slots.map((slot) => (
        <SlotInput
          key={slot.id}
          slot={slot}
          sections={parts.sections}
          values={values}
          words={words}
          onValue={onValue}
        />
      ))}
    </Panel>
  );
}

export function PromptBody({ id, open, purposes, ...rest }: BodyProps) {
  const { parts, values, words, instructions } = rest;
  const [only] = parts.sections;
  const plain = parts.sections.length === 1 && only?.heading === undefined;
  const todo = instructions !== undefined || parts.slots.length > 0;
  return (
    // `data-prompt-text` carries the prompt as it is copied, for the page's tests and tools.
    <div
      id={id}
      hidden={!open}
      data-prompt-text={joinPrompt(parts, values)}
      className="flex min-w-0 flex-col gap-3 border-t border-border p-3"
    >
      {todo && <Todo {...rest} />}
      <Panel name="preview" title={words.preview} initiallyOpen={false}>
        {plain ? (
          <p className="text-caption wrap-anywhere whitespace-pre-wrap">{joinPrompt(parts, values)}</p>
        ) : (
          <Sections parts={parts} purposes={purposes} values={values} />
        )}
      </Panel>
    </div>
  );
}
