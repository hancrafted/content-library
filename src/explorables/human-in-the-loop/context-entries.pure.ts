import {
  sampleOf,
  sampleSummary,
  slotKeys,
  type PromptSection,
  type PromptSlot,
} from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import type { UiWords } from './human-in-the-loop.types';

export interface Entry {
  readonly key: string;
  readonly label: string;
  readonly info?: string;
  readonly sample?: string;
  readonly placeholder?: string;
}

type Values = Readonly<Record<string, string>>;

export const shownValue = (entry: Entry, values: Values): string => values[entry.key] ?? entry.sample ?? '';

export const needsInput = (entries: readonly Entry[], values: Values): boolean =>
  entries.some((entry) => entry.sample === undefined && !(values[entry.key] ?? '').trim());

function hintOf(sample: string | undefined, words: UiWords): string | undefined {
  if (sample === undefined) return undefined;
  const { title, lines } = sampleSummary(sample);
  return (lines === 1 ? words.sampleHintOne : words.sampleHint)
    .replace('{title}', title)
    .replace('{lines}', String(lines));
}

export function entriesOf(slot: PromptSlot, sections: readonly PromptSection[], words: UiWords): Entry[] {
  return slotKeys(slot, sections).map((key, at) => {
    const into = sections.find((section) => section.text.includes(`{{${key}}}`))?.heading;
    return {
      key,
      label: slot.mode === 'multiple' ? `${slot.label} ${at + 1}` : slot.label,
      info: into === undefined ? undefined : words.insertedAt.replace('{section}', into),
      sample: sampleOf(slot, key),
      placeholder: hintOf(sampleOf(slot, key), words),
    };
  });
}

export function splitSlots(slots: readonly PromptSlot[], previous: readonly string[]) {
  return {
    own: slots.filter((slot) => !previous.includes(slot.id)),
    earlier: slots.filter((slot) => previous.includes(slot.id)),
  };
}

export function contextEntries(
  prompt: { readonly slots: readonly PromptSlot[]; readonly sections: readonly PromptSection[] },
  previous: readonly string[],
  words: UiWords,
) {
  const { own, earlier } = splitSlots(prompt.slots, previous);
  const entries = (slots: readonly PromptSlot[]) => slots.flatMap((slot) => entriesOf(slot, prompt.sections, words));
  return { own: entries(own), earlier: entries(earlier) };
}
