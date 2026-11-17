import type { Curve, CurveKey } from './attention-curve.pure';
import type { ControlId } from './context-controls.pure';
import type { Attention, Readout } from './context-usage.pure';
import type { ContextWords } from './context-words.types';
import type { Frame } from './context.pure';
import type { AttentionLayout, Category, Chat, RenderMode, StepNotes, StepStory, WindowSize } from './context.types';
import type { Around } from './loupe.pure';

export interface Lighting {
  readonly lit: string | null;
  readonly ghost: string | null;
  readonly pinned: string | null;
}

export interface Speech {
  readonly words: ContextWords;
  readonly locale: string;
  readonly story: Readonly<Record<string, StepStory>>;
  readonly renderMode: RenderMode;
}

export interface Progress {
  readonly chat: Chat;
  readonly vis: number;
  readonly attention: readonly Attention[];
  readonly gone: ReadonlySet<number>;
}

export interface LightingEvents {
  readonly onLight: (key: string | null) => void;
  readonly onPin: (key: string, target: EventTarget | null) => void;
}

export interface ConversationProps extends Lighting, LightingEvents, Speech, Progress {
  readonly notes: Readonly<Record<string, StepNotes>>;
  readonly hint: boolean;
  readonly hintSeen: boolean;
  readonly toggles: readonly HeadToggle[];
}

export interface TimelineProps extends Speech {
  readonly chat: Chat;
  readonly notes: Readonly<Record<string, StepNotes>>;
  readonly step: number;
  readonly previewStep: number | null;
  readonly locked: boolean;
  readonly valueText: string;
  readonly onPreview: (step: number) => void;
  readonly onPreviewEnd: () => void;
  readonly onCommit: (step: number) => void;
}

export interface Flip {
  readonly pressed: boolean;
  readonly onToggle: () => void;
}

export interface HeadToggle extends Flip {
  readonly id: ControlId;
}

export interface ContextWindowProps extends Lighting, LightingEvents, Speech {
  readonly frames: readonly Frame[];
  readonly frame: Frame;
  readonly window: WindowSize;
  readonly sizes: readonly WindowSize[];
  readonly sizeIndex: number;
  readonly switchable: boolean;
  readonly meter: boolean;
  readonly stepOf: ReadonlyMap<string, number>;
  readonly onSize: (index: number) => void;
  readonly zone: boolean;
  readonly zoom?: Around;
  readonly toggles: readonly HeadToggle[];
}

export interface ContextCategoryProps extends Lighting, LightingEvents, Speech {
  readonly frame: Frame;
  readonly window: WindowSize;
  readonly present: ReadonlySet<Category>;
  readonly toggles: readonly HeadToggle[];
}

export interface DetailsProps extends Lighting, LightingEvents, Speech, Omit<Progress, 'attention'> {
  readonly frame: Frame;
  readonly readout: Readout;
  readonly window: WindowSize;
  readonly stepOf: ReadonlyMap<string, number>;
}

export interface AttentionProps extends Lighting, LightingEvents, Speech, Progress {
  readonly readout: Readout;
  readonly stepOf: ReadonlyMap<string, number>;
  readonly layout: AttentionLayout;
  readonly menu?: AttentionMenuModel;
  readonly onReveal: (key: string) => void;
}

export interface Card extends DetailsProps {
  readonly tech: boolean;
  readonly match: (id: string, cat: Category) => boolean;
}

export interface AttentionMenuModel {
  readonly layout: AttentionLayout;
  readonly onLayout: (value: AttentionLayout) => void;
  readonly curve?: {
    readonly shares: Curve;
    readonly onShare: (key: CurveKey, value: number) => void;
    readonly onShares: (value: Readonly<Record<CurveKey, number>>) => void;
  };
}
