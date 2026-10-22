import type { PromptSection, PromptSlot } from './prompt-sections.pure';

/** The prompt a TryPrompt shows and copies: a prompt, or a one-line command, with an optional short variant. */
export interface PromptView {
  readonly kind: 'prompt' | 'command';
  readonly text: string;
  /** The short grill of an interview prompt; the Short toggle swaps it for `text`. */
  readonly short?: string;
  /** The prompt as sections; absent: `text` is the one section, without heading or purpose. */
  readonly sections?: readonly PromptSection[];
  /** The paste-in inputs the sections' markers name. */
  readonly slots?: readonly PromptSlot[];
  /** One explanation per purpose; a section's marker shows its purpose's, or its own `explain`. */
  readonly purposes?: Readonly<Record<string, string>>;
}

/** The words a TryPrompt shows; it owns none (the caller passes them in, in the visitor's language). */
export interface TryPromptWords {
  readonly promptLabel: string;
  readonly commandLabel: string;
  readonly copyPrompt: string;
  readonly copyCommand: string;
  readonly openChatgpt: string;
  readonly openClaude: string;
  readonly short: string;
  readonly shortTip: string;
  readonly newTab: string;
  /** The "open in" tooltip when the prompt is too long for a link: it is copied and an empty chat opens. */
  readonly tooLong?: string;
  /** The name of a slot's upload button, and of its add-entry button; each falls back to the slot's label. */
  readonly upload?: string;
  readonly addEntry?: string;
}

/** What a prompt box needs from its parent: its words and the two things it can ask for, as one bundle. */
export interface PromptKit {
  /** The job's short grill is on: the prompt shown and copied is its short variant. */
  readonly short: boolean;
  readonly words: TryPromptWords;
  readonly onShort: () => void;
  readonly onCopy: (text: string) => void;
}
