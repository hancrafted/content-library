/*
 * The pure half of TryPrompt: sections joined into one markdown prompt, with `{{marker}}`s filled from the pasted
 * values and the slots' samples. Core owns its own types; a caller's schema maps onto them structurally.
 */

/** One part of a prompt, joined as an H2 (no `heading`: the text stands alone). */
export interface PromptSection {
  readonly heading?: string;
  /** The key into `purposes`; absent: no marker on this section. */
  readonly purpose?: string;
  /** Replaces the explanation of `purpose` for this section only. */
  readonly explain?: string;
  readonly text: string;
}

/** A paste-in input: `single` fills `{{id}}`; `multiple` fills `{{id_1}}` … `{{id_N}}`, N being the markers in the text. */
export interface PromptSlot {
  readonly id: string;
  readonly mode: 'single' | 'multiple';
  readonly label: string;
  /** Stays in the prompt while the slot is empty. A multiple slot may carry one per entry, in marker order. */
  readonly sample?: string | readonly string[];
}

/** The sample of the entry `key` of `slot`: its own for a list, the one sample for a single slot. */
export function sampleOf(slot: PromptSlot, key: string): string | undefined {
  if (typeof slot.sample !== 'string') {
    const at = Number(key.slice(slot.id.length + 1)) - 1;
    return slot.sample?.[at];
  }
  return slot.sample;
}

/** What the visitor typed, keyed by marker name: `id` of a single slot, `id_K` of a multiple one. */
export type SlotValues = Readonly<Record<string, string>>;

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** How many numbered markers `slot` has across the sections: the cap of a multiple slot. */
export function markerCount(slot: PromptSlot, sections: readonly PromptSection[]): number {
  const marker = new RegExp(`\\{\\{${escape(slot.id)}_(\\d+)\\}\\}`, 'g');
  let count = 0;
  for (const section of sections) {
    for (const found of section.text.matchAll(marker)) count = Math.max(count, Number(found[1]));
  }
  return count;
}

/** The marker names a slot fills, in order. */
export function slotKeys(slot: PromptSlot, sections: readonly PromptSection[]): string[] {
  if (slot.mode === 'single') return [slot.id];
  return Array.from({ length: markerCount(slot, sections) }, (_, at) => `${slot.id}_${at + 1}`);
}

/** What the sections' markers draw on. */
export interface PromptParts {
  readonly sections: readonly PromptSection[];
  readonly slots: readonly PromptSlot[];
}

/** The entries of a multiple slot to show: `added` of them, at least one and every one with a value, at most its markers. */
export function visibleKeys(keys: readonly string[], values: SlotValues, added: number): string[] {
  const filled = keys.reduce((last, key, at) => ((values[key] ?? '').trim() ? at + 1 : last), 0);
  return keys.slice(0, Math.max(1, added, filled));
}

/** The text of a section with its slot markers replaced: the value, or the sample while the value is empty. */
export function fillMarkers(text: string, parts: PromptParts, values: SlotValues): string {
  const fills = new Map<string, string>();
  for (const slot of parts.slots) {
    for (const key of slotKeys(slot, parts.sections)) {
      const value = (values[key] ?? '').trim() ? values[key]! : sampleOf(slot, key);
      if (value !== undefined) fills.set(key, value);
    }
  }
  return text.replace(/\{\{([^{}]+)\}\}/g, (marker, key: string) => fills.get(key.trim()) ?? marker);
}

/** One section as copied: its H2, then its text with markers filled. */
export function sectionText(section: PromptSection, parts: PromptParts, values: SlotValues): string {
  const body = fillMarkers(section.text, parts, values);
  return section.heading === undefined ? body : `## ${section.heading}\n\n${body}`;
}

/** The whole prompt: every section, markers filled, as one markdown document. */
export function joinPrompt(parts: PromptParts, values: SlotValues): string {
  return parts.sections.map((section) => sectionText(section, parts, values)).join('\n\n');
}

/** The explanation a section's marker carries, or none (then there is no marker). */
export function explanation(section: PromptSection, purposes: Readonly<Record<string, string>>): string | undefined {
  if (section.purpose === undefined) return undefined;
  return section.explain ?? purposes[section.purpose];
}

/** The title and line count of a sample: its first H1 (else its first line), and how many lines it has. */
export function sampleSummary(sample: string): { title: string; lines: number } {
  const lines = sample.trimEnd().split('\n');
  const h1 = lines.find((line) => /^#\s+\S/.test(line));
  const first = lines.find((line) => line.trim() !== '') ?? '';
  return { title: (h1 ?? first).replace(/^#\s+/, '').trim(), lines: lines.length };
}
