import {
  fillMarkers,
  joinPrompt,
  type PromptParts,
  type SlotValues,
} from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import type { EditState } from './step-kit.types';
import type { Level } from './workflow-state.pure';

/*
 * A viewer's edit of a step's prompt: the text they see and change (the YAML prompt as markdown, markers raw), the key
 * it is stored under, and the text a copy button copies. An edit equal to the YAML text is no edit.
 */

/** Every edit of one Workflow's run, by `editKey`. */
export type PromptEdits = Readonly<Record<string, string>>;

/** The prompt as the viewer edits it: `## Heading` and text per section, `{{markers}}` left in. */
export function rawPrompt({ sections }: PromptParts): string {
  return sections
    .map((section) => (section.heading === undefined ? section.text : `## ${section.heading}\n\n${section.text}`))
    .join('\n\n');
}

/** Where a step's edit is stored: Simple and Technical copy different text, and every round of a stage shares one edit. */
export const editKey = (level: Level, jobId: string, step: 'do' | 'review'): string => `${level}:${jobId}.${step}`;

/** What a copy button copies: the edit with earlier results filled in, else the YAML prompt filled in. */
export function promptText(parts: PromptParts, values: SlotValues, edit: string | undefined): string {
  return edit === undefined ? joinPrompt(parts, values) : fillMarkers(edit, parts, values);
}

/** The edits after the step at `at` is set to `text` (null removes it); a text equal to its `yaml` removes it too. */
export function withEdit(edits: PromptEdits, at: { key: string; yaml: string }, text: string | null): PromptEdits {
  const { key, yaml } = at;
  const others = Object.fromEntries(Object.entries(edits).filter(([each]) => each !== key));
  return text === null || text === yaml ? others : { ...others, [key]: text };
}

/** The edits and their change callback of the modal's props as a step reads them, with the level whose text they edit. */
export const editState = (
  { prompts, onPrompts }: { prompts: PromptEdits; onPrompts: EditState['onChange'] },
  level: Level,
): EditState => ({ values: prompts, level, onChange: onPrompts });
