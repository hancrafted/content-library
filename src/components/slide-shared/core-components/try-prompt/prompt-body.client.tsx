'use client';

import { Tip } from '../tip/tip.client';
import { explanation, joinPrompt, sectionText, type PromptParts, type SlotValues } from './prompt-sections.pure';
import { SlotInput } from './slot-input.client';
import type { TryPromptWords } from './try-prompt.types';

/* The opened prompt: the slots to fill, then each section under its H2 and marker, then the text as it is copied. */

const PROMPT_TEXT =
  'max-h-72 overflow-auto p-3 text-caption whitespace-pre-wrap outline-none focus-visible:ring-2 focus-visible:ring-ring';

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
  readonly label: string;
  readonly parts: PromptParts;
  readonly purposes: Readonly<Record<string, string>>;
  readonly values: SlotValues;
  readonly words: TryPromptWords;
  readonly onValue: (key: string, value: string) => void;
}

function Sections({ parts, purposes, values }: Pick<BodyProps, 'parts' | 'purposes' | 'values'>) {
  return parts.sections.map((section, at) => {
    const why = explanation(section, purposes);
    return (
      <section key={at} data-section={at} className="flex flex-col gap-1">
        {section.heading !== undefined && (
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-body font-semibold">{section.heading}</h2>
            {why !== undefined && <PurposeMarker purpose={section.purpose!} text={why} />}
          </div>
        )}
        <p className="text-caption whitespace-pre-wrap">
          {sectionText({ ...section, heading: undefined }, parts, values)}
        </p>
      </section>
    );
  });
}

export function PromptBody({ id, open, label, parts, purposes, values, words, onValue }: BodyProps) {
  const [only] = parts.sections;
  const plain = parts.sections.length === 1 && only?.heading === undefined && parts.slots.length === 0;
  return (
    <div id={id} hidden={!open} className="flex flex-col gap-3 border-t border-border p-3">
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
      {!plain && <Sections parts={parts} purposes={purposes} values={values} />}
      {/* The prompt as it is copied: focusable and named, so a keyboard user can scroll it. */}
      <pre data-prompt-text="" tabIndex={0} role="region" aria-label={label} className={PROMPT_TEXT}>
        {joinPrompt(parts, values)}
      </pre>
    </div>
  );
}
