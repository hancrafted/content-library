import type { PromptKit } from '@/shared/components/core-components/try-prompt/try-prompt.client';
import type { DebugScope } from './debug-footer.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { NextAction } from './next-action.pure';
import type { PromptEdits } from './prompt-edits.pure';
import type { Level } from './workflow-state.pure';

export interface SlotState {
  readonly values: Readonly<Record<string, string>>;
  readonly onChange: (values: Readonly<Record<string, string>>) => void;
}

export interface EditState {
  readonly values: PromptEdits;
  readonly level: Level;
  readonly onChange: (values: PromptEdits) => void;
}

export type StepKit = PromptKit & {
  readonly words: UiWords;
  readonly info: boolean;
  readonly debug?: DebugScope;
  readonly edits: EditState;
  readonly lead?: Lead;
};

export interface Lead {
  readonly next: NextAction;
  readonly onCopied: (panel: string) => void;
}
