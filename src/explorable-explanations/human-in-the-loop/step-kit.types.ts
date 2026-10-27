import type { PromptKit } from '@/shared/components/core-components/try-prompt/try-prompt.client';
import type { DebugScope } from './debug-footer.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { NextAction } from './next-action.pure';

/** The Workflow-wide pasted values, owned by the parent, and how a TryPrompt reports a change. */
export interface SlotState {
  readonly values: Readonly<Record<string, string>>;
  readonly onChange: (values: Readonly<Record<string, string>>) => void;
}

/**
 * What every step needs: the words, the copy handler, and whether the info toggle shows each step's explanation. The
 * `debug` scope is set while debug mode is on: the copy buttons then append the footer instruction.
 */
export type StepKit = PromptKit & {
  readonly words: UiWords;
  readonly info: boolean;
  readonly debug?: DebugScope;
  /** Which control of the item leads the viewer on, and how a step reports its Copy prompt pressed. */
  readonly lead?: Lead;
};

export interface Lead {
  readonly next: NextAction;
  readonly onCopied: (panel: string) => void;
}
