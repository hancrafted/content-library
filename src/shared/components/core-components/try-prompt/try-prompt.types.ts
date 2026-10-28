import type { PromptSection, PromptSlot, PromptTechnique } from './prompt-sections.pure';

/** The prompt a TryPrompt shows and copies: a prompt, or a one-line command. */
export interface PromptView {
  readonly kind: 'prompt' | 'command';
  readonly text: string;
  /** The prompt as sections; absent: `text` is the one section, without heading or purpose. */
  readonly sections?: readonly PromptSection[];
  /** One or two plain sentences on what the user does with this step; shown first in the "What to do" panel. */
  readonly instructions?: string;
  /** The paste-in inputs the sections' markers name. */
  readonly slots?: readonly PromptSlot[];
  /** One explanation per purpose; a section's marker shows its purpose's, or its own `explain`. */
  readonly purposes?: Readonly<Record<string, string>>;
  /** The technique catalogue the sections' `techniques` name. */
  readonly techniques?: readonly PromptTechnique[];
}

/** The words a TryPrompt shows; it owns none (the caller passes them in, in the visitor's language). */
export interface TryPromptWords {
  readonly promptLabel: string;
  readonly commandLabel: string;
  readonly copyPrompt: string;
  readonly copyCommand: string;
  /** The name of a slot's upload button, and of its add-entry button; each falls back to the slot's label. */
  readonly upload?: string;
  readonly addEntry?: string;
  /** The two panels of an opened prompt, and the slot field's eye toggle (`showFull` when collapsed, `collapse` when open). */
  readonly whatToDo: string;
  readonly preview: string;
  readonly showFull: string;
  readonly collapse: string;
  /** The names of the two technique tiers; a tier without a word shows its own key. */
  readonly tierBasic?: string;
  readonly tierAdvanced?: string;
  /** The hint of an empty field, with `{title}` and `{lines}` of its sample filled in; `sampleHintOne` for one line. */
  readonly sampleHint: string;
  readonly sampleHintOne: string;
  /** What the copy button says for a moment after a copy succeeded. */
  readonly copied?: string;
}

/** What a prompt box needs from its parent: its words and the one thing it can ask for, as one bundle. */
export interface PromptKit {
  readonly words: TryPromptWords;
  /** Copies the text; resolves `true` when the clipboard took it, so the copy button can confirm. */
  readonly onCopy: (text: string) => Promise<boolean>;
}
