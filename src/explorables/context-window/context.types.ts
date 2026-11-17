import type { Curve, Falloff } from './attention-curve.pure';
import type { ControlMap } from './context-controls.pure';

export type Category =
  | 'sysprompt'
  | 'systools'
  | 'mcp'
  | 'skills'
  | 'memory'
  | 'reminder'
  | 'user'
  | 'assistant'
  | 'tool_use'
  | 'tool_result'
  | 'summary';

export type SimpleCategory = 'start' | 'memory' | 'you' | 'ai' | 'read' | 'reminder' | 'summary';

export interface Block {
  readonly cat: Category;
  readonly tokens: number;
}

export interface ToolCall {
  readonly name: string;
  readonly input: Readonly<Record<string, string | number | boolean>>;
  readonly result: string;
}

export interface Reminder {
  readonly kind: string;
  readonly text: string;
}

interface StepBase {
  readonly id: string;
  readonly blocks: readonly Block[];
  readonly reminders?: readonly Reminder[];
}

export type Step =
  | (StepBase & { readonly kind: 'start' })
  | (StepBase & { readonly kind: 'memory'; readonly path: string })
  | (StepBase & { readonly kind: 'you'; readonly text: string })
  | (StepBase & { readonly kind: 'ai'; readonly text: string })
  | (StepBase & { readonly kind: 'tool'; readonly calls: readonly ToolCall[] })
  | (StepBase & { readonly kind: 'compact'; readonly trigger: 'auto' | 'manual'; readonly summary: string })
  | (StepBase & { readonly kind: 'cleared'; readonly cleared: number });

export interface Chat {
  readonly id: string;
  readonly steps: readonly Step[];
}

export interface StepStory {
  readonly event: string;
  readonly simple: string;
  readonly technical: string;
  readonly pre?: string;
  readonly act?: string;
  readonly label?: string;
  readonly labelTechnical?: string;
  readonly out?: string;
  readonly term?: string;
  readonly kept?: readonly string[];
  readonly dropped?: readonly string[];
}

export interface StepNotes {
  readonly mayFill?: boolean;
  readonly refs?: readonly string[];
  readonly big?: boolean;
}

export type Depth = 'simple' | 'technical';
export type RenderMode = Depth;
export type PartId = 'conversation' | 'timeline' | 'context-window' | 'category' | 'details' | 'attention';
export type Part = 'chat' | 'timeline' | 'context' | 'category' | 'panel' | 'attention';
export type AttentionLayout = 'list' | 'pinned' | 'compressed';
export type Motion = 'off' | 'crisp' | 'rise' | 'spring';

export interface Line {
  readonly id: string;
  readonly tokens: number;
  readonly label: string;
  readonly who: string;
  readonly short: string;
}

export interface WindowSize {
  readonly tokens: number;
  readonly bufferTokens: number;
  readonly lines: readonly Line[];
}

export interface Preset {
  readonly id: string;
  readonly chat: string;
  readonly step: number;
  readonly depth: Depth;
  readonly pinned: string | null;
  readonly show: Readonly<Record<Part, boolean>>;
  readonly order: readonly Part[];
  readonly controls: ControlMap;
  readonly fade: boolean;
  readonly attention: {
    readonly layout: AttentionLayout;
    readonly curve: Curve;
    readonly falloff: Falloff;
  };
  readonly timelineLocked: boolean;
  readonly windows: readonly WindowSize[];
  readonly motion: Motion;
  readonly height: number;
}

export interface MiniBar {
  readonly label: string;
  readonly chat: string;
  readonly step: number;
  readonly discarded: boolean;
  readonly lit: readonly SimpleCategory[] | null;
  readonly litFrom: string | null;
  readonly ring: readonly string[];
}

export interface MiniPreset {
  readonly id: string;
  readonly mini: readonly MiniBar[];
  readonly window: WindowSize;
}
