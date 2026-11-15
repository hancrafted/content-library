import {
  fillMarkers,
  joinPrompt,
  type PromptParts,
  type SlotValues,
} from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import type { PromptView } from '@/shared/components/core-components/try-prompt/try-prompt.types';
import type { TaskStep } from './workflow-prompts.pure';

/*
 * A viewer's edit of a step's prompt: the text they see and change (the YAML prompt as markdown, markers raw), the key
 * it is stored under, and the text a copy button copies. An edit equal to the YAML text is no edit.
 */

/** Every edit of one Workflow's run, by `editKey`. */
export type PromptEdits = Readonly<Record<string, string>>;

/** Where a step's edit is stored, and the YAML prompt text it is compared with. */
export interface EditAt {
  readonly key: string;
  readonly yaml: string;
}

/** The sections and slots of a step's prompt, as the copy buttons and the editor read them. */
export const partsOf = ({ prompt }: { readonly prompt: PromptView }): PromptParts => ({
  sections: prompt.sections ?? [{ text: prompt.text }],
  slots: prompt.slots ?? [],
});

/** The prompt as the viewer edits it: `## Heading` and text per section, `{{markers}}` left in. */
export function rawPrompt({ sections }: PromptParts): string {
  return sections
    .map((section) => (section.heading === undefined ? section.text : `## ${section.heading}\n\n${section.text}`))
    .join('\n\n');
}

/** Where a step's edit is stored: Simple and Technical copy different text, and every round of a stage shares one edit. */
export const editKey = (level: string, jobId: string, step: 'do' | 'review' | 'then'): string =>
  `${level}:${jobId}.${step}`;

/** What a copy button copies: the edit with earlier results filled in, else the YAML prompt filled in. */
export function promptText(parts: PromptParts, values: SlotValues, edit: string | undefined): string {
  return edit === undefined ? joinPrompt(parts, values) : fillMarkers(edit, parts, values);
}

/** The edits after the step at `at` is set to `text` (null removes it); a text equal to its `yaml` removes it too. */
export function withEdit(edits: PromptEdits, at: EditAt, text: string | null): PromptEdits {
  const { key, yaml } = at;
  const others = Object.fromEntries(Object.entries(edits).filter(([each]) => each !== key));
  return text === null || text === yaml ? others : { ...others, [key]: text };
}

/** A step's edit: whether there is one, the text to show, and how it changes or goes. */
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

/** The edit as a round of a repeated stage copies it: the template's `{{item}}` and slot names rewritten for the round. */
export const roundedEdit = (edit: string | undefined, step: Pick<TaskStep, 'template'>): string | undefined =>
  edit === undefined ? undefined : (step.template?.rewrite(edit) ?? edit);
