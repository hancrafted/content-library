/*
 * The pure half of TryPrompt: sections joined into one markdown prompt, with `{{marker}}`s filled from the pasted
 * values and the slots' samples. Core owns its own types; a caller's schema maps onto them structurally.
 */

export interface PromptSection {
  readonly heading?: string;
  readonly purpose?: string;
  readonly explain?: string;
  readonly techniques?: readonly string[];
  readonly text: string;
}

export interface PromptTechnique {
  readonly id: string;
  readonly tier: string;
  readonly title: string;
  readonly explain: string;
}

export function techniquesOf(section: PromptSection, catalogue: readonly PromptTechnique[]): PromptTechnique[] {
  return (section.techniques ?? []).flatMap((id) => catalogue.filter((entry) => entry.id === id));
}

export interface PromptSlot {
  readonly id: string;
  readonly mode: 'single' | 'multiple';
  readonly label: string;
  readonly sample?: string | readonly string[];
}

export function sampleOf(slot: PromptSlot, key: string): string | undefined {
  if (typeof slot.sample !== 'string') {
    const at = Number(key.slice(slot.id.length + 1)) - 1;
    return slot.sample?.[at];
  }
  return slot.sample;
}

export type SlotValues = Readonly<Record<string, string>>;

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function markerCount(slot: PromptSlot, sections: readonly PromptSection[]): number {
  const marker = new RegExp(`\\{\\{${escape(slot.id)}_(\\d+)\\}\\}`, 'g');
  let count = 0;
  for (const section of sections) {
    for (const found of section.text.matchAll(marker)) count = Math.max(count, Number(found[1]));
  }
  return count;
}

export function slotKeys(slot: PromptSlot, sections: readonly PromptSection[]): string[] {
  if (slot.mode === 'single') return [slot.id];
  return Array.from({ length: markerCount(slot, sections) }, (_, at) => `${slot.id}_${at + 1}`);
}

export interface PromptParts {
  readonly sections: readonly PromptSection[];
  readonly slots: readonly PromptSlot[];
}

export function visibleKeys(keys: readonly string[], values: SlotValues, added: number): string[] {
  const filled = keys.reduce((last, key, at) => ((values[key] ?? '').trim() ? at + 1 : last), 0);
  return keys.slice(0, Math.max(1, added, filled));
}

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

export function sectionText(section: PromptSection, parts: PromptParts, values: SlotValues): string {
  const body = fillMarkers(section.text, parts, values);
  return section.heading === undefined ? body : `## ${section.heading}\n\n${body}`;
}

export function joinPrompt(parts: PromptParts, values: SlotValues): string {
  return parts.sections.map((section) => sectionText(section, parts, values)).join('\n\n');
}

export function explanation(section: PromptSection, purposes: Readonly<Record<string, string>>): string | undefined {
  if (section.purpose === undefined) return undefined;
  return section.explain ?? purposes[section.purpose];
}

export function sampleSummary(sample: string): { title: string; lines: number } {
  const lines = sample.trimEnd().split('\n');
  const h1 = lines.find((line) => /^#\s+\S/.test(line));
  const first = lines.find((line) => line.trim() !== '') ?? '';
  return { title: (h1 ?? first).replace(/^#\s+/, '').trim(), lines: lines.length };
}
