import {
  fillMarkers,
  joinPrompt,
  type PromptParts,
  type SlotValues,
} from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import type { PromptView } from '@/shared/components/core-components/try-prompt/try-prompt.types';
import type { StepKind, TaskStep } from './workflow-prompts.pure';

export type PromptEdits = Readonly<Record<string, string>>;

export interface EditAt {
  readonly key: string;
  readonly yaml: string;
}

export const partsOf = ({ prompt }: { readonly prompt: PromptView }): PromptParts => ({
  sections: prompt.sections ?? [{ text: prompt.text }],
  slots: prompt.slots ?? [],
});

export function rawPrompt({ sections }: PromptParts): string {
  return sections
    .map((section) => (section.heading === undefined ? section.text : `## ${section.heading}\n\n${section.text}`))
    .join('\n\n');
}

export const editKey = (level: string, jobId: string, step: StepKind): string => `${level}:${jobId}.${step}`;

export function promptText(parts: PromptParts, values: SlotValues, edit: string | undefined): string {
  return edit === undefined ? joinPrompt(parts, values) : fillMarkers(edit, parts, values);
}

export function withEdit(edits: PromptEdits, at: EditAt, text: string | null): PromptEdits {
  const { key, yaml } = at;
  const others = Object.fromEntries(Object.entries(edits).filter(([each]) => each !== key));
  return text === null || text === yaml ? others : { ...others, [key]: text };
}

export function editOf(
  { values, onChange }: { values: PromptEdits; onChange: (edits: PromptEdits) => void },
  at: EditAt,
) {
  const edit = values[at.key];
  return {
    edit,
    text: edit ?? at.yaml,
    onText: (text: string) => onChange(withEdit(values, at, text)),
    onReset: () => onChange(withEdit(values, at, null)),
  };
}

export const roundedEdit = (edit: string | undefined, step: Pick<TaskStep, 'template'>): string | undefined =>
  edit === undefined ? undefined : (step.template?.rewrite(edit) ?? edit);
