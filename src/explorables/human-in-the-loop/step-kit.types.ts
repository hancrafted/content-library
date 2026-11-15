import type { PromptKit } from '@/shared/components/core-components/try-prompt/try-prompt.client';
import type { DebugScope } from './debug-footer.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { NextAction } from './next-action.pure';
import type { PromptEdits } from './prompt-edits.pure';
import type { Level } from './workflow-state.pure';

/** The Workflow-wide pasted values, owned by the parent, and how a TryPrompt reports a change. */
export interface SlotState {
  readonly values: Readonly<Record<string, string>>;
  readonly onChange: (values: Readonly<Record<string, string>>) => void;
}

/**
 * What every step needs: the words, the copy handler, and whether the info toggle shows each step's explanation. The
 * `debug` scope is set while debug mode is on: the copy buttons then append the footer instruction.
 */
/** The viewer's prompt edits and how one changes (`prompt-edits.pure.ts`), with the level whose text they edit. */
export interface EditState {
  readonly values: PromptEdits;
  readonly level: Level;
  readonly onChange: (values: PromptEdits) => void;
}

export type StepKit = PromptKit & {
  readonly words: UiWords;
  readonly info: boolean;
  readonly debug?: DebugScope;
  /** The edits of step prompts: each step's pencil and copy buttons read and write them. */
  readonly edits: EditState;
  /** Which control of the item leads the viewer on, and how a step reports its Copy prompt pressed. */
  readonly lead?: Lead;
};

export interface Lead {
  readonly next: NextAction;
  readonly onCopied: (panel: string) => void;
}
