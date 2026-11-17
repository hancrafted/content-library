import type { PromptSection, PromptSlot, PromptTechnique } from './prompt-sections.pure';

export interface PromptView {
  readonly kind: 'prompt' | 'command';
  readonly text: string;
  readonly sections?: readonly PromptSection[];
  readonly instructions?: string;
  readonly slots?: readonly PromptSlot[];
  readonly purposes?: Readonly<Record<string, string>>;
  readonly techniques?: readonly PromptTechnique[];
}

export interface TryPromptWords {
  readonly promptLabel: string;
  readonly commandLabel: string;
  readonly copyPrompt: string;
  readonly copyCommand: string;
  readonly upload?: string;
  readonly addEntry?: string;
  readonly whatToDo: string;
  readonly preview: string;
  readonly showFull: string;
  readonly collapse: string;
  readonly tierBasic?: string;
  readonly tierAdvanced?: string;
  readonly sampleHint: string;
  readonly sampleHintOne: string;
  readonly copied?: string;
}

export interface PromptKit {
  readonly words: TryPromptWords;
  readonly onCopy: (text: string) => Promise<boolean>;
}
