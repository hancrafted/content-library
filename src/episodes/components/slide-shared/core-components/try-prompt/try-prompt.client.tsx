'use client';

import { useMotion } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useId, useState } from 'react';
import { PromptActions } from './prompt-actions.client';
import { PromptBody } from './prompt-body.client';
import { joinPrompt, type PromptSection, type SlotValues } from './prompt-sections.pure';
import type { PromptKit, PromptView } from './try-prompt.types';

export type { PromptSection, PromptSlot, PromptTechnique } from './prompt-sections.pure';
export type { PromptKit, TryPromptWords } from './try-prompt.types';

/*
 * One prompt as a disclosure, collapsed unless `defaultOpen`: a row with the label and two
 * buttons (copy prompt, open in ChatGPT), and the prompt text below when opened. Whether it is open is local to
 * this leaf (it passes the reload test, FE-001).
 *
 * A prompt may come as sections: opened, each shows its H2 and, when it has a purpose with an explanation, a marker
 * whose tooltip says what that part teaches. Its paste-in slots take a paste or a markdown upload and fill the
 * `{{markers}}` of the text; an empty slot leaves its sample. The pasted values are uncontrolled here and become
 * the parent's when it passes `values`/`onChange`. Copy and "open in" use the joined prompt, markers filled.
 */

function Chevron({ open }: { open: boolean }) {
  const motion = useMotion(open);
  return (
    <ChevronRight aria-hidden="true" className={cn('size-4 transition-transform', open && 'rotate-90')} {...motion} />
  );
}

function Toggle({
  open,
  label,
  panel,
  onToggle,
}: {
  open: boolean;
  label: string;
  panel: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={panel}
      onClick={onToggle}
      className="inline-flex min-h-9 min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-lg text-left text-caption font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Chevron open={open} />
      {label}
    </button>
  );
}

/** The sections a prompt shows: its own, or its text as the one section. */
function sectionsOf(prompt: PromptView): readonly PromptSection[] {
  if (prompt.sections) return prompt.sections;
  return [{ text: prompt.text }];
}

interface TryPromptProps {
  readonly prompt: PromptView;
  readonly kit: PromptKit;
  /** Pasted values by marker name; with `values` the parent owns them, otherwise this leaf does. */
  readonly values?: SlotValues;
  readonly onChange?: (values: SlotValues) => void;
  /** Opens the prompt at first: the first prompt of a modal, so the viewer sees what to do without a click. */
  readonly defaultOpen?: boolean;
}

interface RowProps {
  readonly prompt: PromptView;
  readonly kit: PromptKit;
  readonly open: boolean;
  readonly panel: string;
  readonly text: string;
  readonly onToggle: () => void;
}

/** The pasted values: the parent's when it passes them, this leaf's own otherwise. */
function useSlotValues({ values, onChange }: TryPromptProps) {
  const [own, setOwn] = useState<SlotValues>({});
  const current = values ?? own;
  const onValue = (key: string, value: string) => {
    const next = { ...current, [key]: value };
    if (values === undefined) setOwn(next);
    onChange?.(next);
  };
  return { current, onValue };
}

/** The row above the text: the disclosure toggle and the icon buttons. */
function Row({ prompt, kit, open, panel, text, onToggle }: RowProps) {
  const command = prompt.kind === 'command';
  const { words } = kit;
  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 pl-2">
      <Toggle open={open} panel={panel} label={command ? words.commandLabel : words.promptLabel} onToggle={onToggle} />
      <PromptActions text={text} copyLabel={command ? words.copyCommand : words.copyPrompt} kit={kit} />
    </div>
  );
}

export function TryPrompt(props: TryPromptProps) {
  const { prompt, kit } = props;
  const [open, setOpen] = useState(props.defaultOpen === true);
  const panel = useId();
  const { current, onValue } = useSlotValues(props);
  const parts = { sections: sectionsOf(prompt), slots: prompt.slots ?? [] };
  const text = joinPrompt(parts, current);
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background" data-prompt={prompt.kind}>
      <Row {...{ prompt, kit, open, panel, text }} onToggle={() => setOpen((now) => !now)} />
      <PromptBody
        id={panel}
        open={open}
        instructions={prompt.instructions}
        parts={parts}
        purposes={prompt.purposes ?? {}}
        techniques={prompt.techniques ?? []}
        values={current}
        words={kit.words}
        onValue={onValue}
      />
    </div>
  );
}
