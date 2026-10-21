import type { Attention } from './context-usage.pure';
import type { ContextWords } from './context-words.types';
import type { Frame } from './context.pure';
import type { Chat, RenderMode, StepNotes, StepStory } from './context.types';

/* What the parent hands each part: a slice of its state, never the whole of it. Parts are controlled: they hold no
 * state of the Context, and tell the parent what happened through callbacks. */

/** The brushed and pinned key, as every part reads it. A part turns it into one `on` boolean per item. */
export interface Lighting {
  /** The key lit now: the hovered one, else the pinned one. */
  readonly lit: string | null;
  /** A pinned step the timeline has not reached yet. */
  readonly ghost: string | null;
  readonly pinned: string | null;
}

/** The words and story every part says things with. */
export interface Speech {
  readonly words: ContextWords;
  readonly locale: string;
  readonly story: Readonly<Record<string, StepStory>>;
  readonly renderMode: RenderMode;
}

/** The chat as every part draws it at one step. */
export interface Progress {
  readonly chat: Chat;
  readonly frames: readonly Frame[];
  /** The step on screen: the preview while scrubbing, else the committed one. */
  readonly vis: number;
  readonly attention: readonly Attention[];
}

export interface ConversationProps extends Lighting, Speech, Progress {
  readonly notes: Readonly<Record<string, StepNotes>>;
  readonly collapsed: boolean;
  /** Whether the scrub hint belongs in the head: the timeline is shown and not locked. */
  readonly hint: boolean;
  readonly hintSeen: boolean;
}

export interface TimelineProps extends Speech {
  readonly chat: Chat;
  readonly notes: Readonly<Record<string, StepNotes>>;
  readonly step: number;
  readonly previewStep: number | null;
  readonly locked: boolean;
  /** The sentence the range input reads out. */
  readonly valueText: string;
  readonly onPreview: (step: number) => void;
  readonly onPreviewEnd: () => void;
  readonly onCommit: (step: number) => void;
}
