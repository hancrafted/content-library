import type { Curve, CurveKey } from './attention-curve.pure';
import type { ControlId } from './context-controls.pure';
import type { Attention, Readout } from './context-usage.pure';
import type { ContextWords } from './context-words.types';
import type { Frame } from './context.pure';
import type { AttentionLayout, Category, Chat, RenderMode, StepNotes, StepStory, WindowSize } from './context.types';
import type { Around } from './loupe.pure';

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
  /** The step on screen: the preview while scrubbing, else the committed one. */
  readonly vis: number;
  readonly attention: readonly Attention[];
  /** The 0-based indices of the steps a compaction or clearing removed from the window by the step on screen. */
  readonly gone: ReadonlySet<number>;
}

/** The events a part sends up when something is lit or pinned inside it; the parent decides what that does. */
export interface LightingEvents {
  /** A key is lit by hover or focus, or null when the pointer or focus leaves. */
  readonly onLight: (key: string | null) => void;
  /** A key is clicked: the parent pins it, and may scroll the conversation to it. */
  readonly onPin: (key: string, target: EventTarget | null) => void;
}

export interface ConversationProps extends Lighting, LightingEvents, Speech, Progress {
  readonly notes: Readonly<Record<string, StepNotes>>;
  /** Whether the scrub hint belongs in the head: the timeline is shown and not locked. */
  readonly hint: boolean;
  readonly hintSeen: boolean;
  /** The head's icon buttons: the local Technical. */
  readonly toggles: readonly HeadToggle[];
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

/** What a toggle shows and does: the parent decides, from the registry's `flips`, which state each one is. */
export interface Flip {
  readonly pressed: boolean;
  readonly onToggle: () => void;
}

/** A toggle in a part's head: the parent decides which are offered. */
export interface HeadToggle extends Flip {
  readonly id: ControlId;
}

export interface ContextWindowProps extends Lighting, LightingEvents, Speech {
  readonly frames: readonly Frame[];
  /** What the window holds at the step on screen. */
  readonly frame: Frame;
  readonly window: WindowSize;
  /** The sizes the switch offers, and which one is shown. */
  readonly sizes: readonly WindowSize[];
  readonly sizeIndex: number;
  readonly switchable: boolean;
  /** The head shows its usage figures: the percent and "used of window". A Preset may hide them. */
  readonly meter: boolean;
  /** Each step's number in the chat, by step id. */
  readonly stepOf: ReadonlyMap<string, number>;
  readonly onSize: (index: number) => void;
  /** The smart-zone side column and the limit label are shown; the dashed lines stay either way. */
  readonly zone: boolean;
  /** How many blocks the zoom shows before and after the hovered one; at most `before + 1 + after`. Default 2 and 2. */
  readonly zoom?: Around;
  /** The head's icon buttons, in order: the smart-zone column, the local Technical. */
  readonly toggles: readonly HeadToggle[];
}

export interface ContextCategoryProps extends Lighting, LightingEvents, Speech {
  readonly frame: Frame;
  readonly window: WindowSize;
  /** The categories the chat ever holds, so a row for one that never lands is left out. */
  readonly present: ReadonlySet<Category>;
  /** The head's icon buttons: the local Technical. */
  readonly toggles: readonly HeadToggle[];
}

export interface DetailsProps extends Lighting, LightingEvents, Speech, Omit<Progress, 'attention'> {
  readonly frame: Frame;
  /** The readout of the step on screen. */
  readonly readout: Readout;
  readonly window: WindowSize;
  readonly stepOf: ReadonlyMap<string, number>;
}

export interface AttentionProps extends Lighting, LightingEvents, Speech, Progress {
  /** The readout of the step on screen. */
  readonly readout: Readout;
  readonly stepOf: ReadonlyMap<string, number>;
  readonly layout: AttentionLayout;
  /** The ⋯ menu: absent when the Preset hides the control. */
  readonly menu?: AttentionMenuModel;
  /** A row is hovered or clicked: the parent scrolls that step's chat message into view. */
  readonly onReveal: (key: string) => void;
}

/** What the Details cards read: the props, whether they are Technical, and the match of the lit key. */
export interface Card extends DetailsProps {
  readonly tech: boolean;
  readonly match: (id: string, cat: Category) => boolean;
}

/** The Attention ⋯ menu's data and events; `curve` is absent while an explicit per-step split is in force. */
export interface AttentionMenuModel {
  readonly layout: AttentionLayout;
  readonly onLayout: (value: AttentionLayout) => void;
  readonly curve?: {
    readonly shares: Curve;
    readonly onShare: (key: CurveKey, value: number) => void;
    readonly onShares: (value: Readonly<Record<CurveKey, number>>) => void;
  };
}
