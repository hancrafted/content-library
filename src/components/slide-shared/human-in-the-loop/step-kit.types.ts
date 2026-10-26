import type { PromptKit } from '../core-components/try-prompt/try-prompt.client';
import type { UiWords } from './human-in-the-loop.types';

/** The Workflow-wide pasted values, owned by the parent, and how a TryPrompt reports a change. */
export interface SlotState {
  readonly values: Readonly<Record<string, string>>;
  readonly onChange: (values: Readonly<Record<string, string>>) => void;
}

/** What every step needs: the words, the copy handler, and whether the info toggle shows each step's explanation. */
export type StepKit = PromptKit & { readonly words: UiWords; readonly info: boolean };
