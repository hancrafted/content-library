/*
 * The context window cornerstone's data shapes. A Chat is what a Claude Code session log holds (claude-log.pure.ts
 * reads and writes it); a Story is what the log does not hold: the words that explain each step, per locale, from
 * context-preset.config.yml. A Preset is one Slide's state of the cornerstone.
 */

/** A part of the context window, named as Claude Code's `/context` names it. */
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

/** The plain-word category a Technical one folds into in the Simple view. */
export type SimpleCategory = 'start' | 'memory' | 'you' | 'ai' | 'read' | 'reminder' | 'summary';

/** What one step adds to the window, in one category. A step holds at most one block per category. */
export interface Block {
  readonly cat: Category;
  readonly tokens: number;
}

/** One tool call of a tool step: the tool, its input as the log records it, and its result text. */
export interface ToolCall {
  readonly name: string;
  readonly input: Readonly<Record<string, string | number | boolean>>;
  readonly result: string;
}

/** A system reminder the app adds to the window and the chat never shows. */
export interface Reminder {
  readonly kind: string;
  readonly text: string;
}

/** What every step holds: its id, its blocks, and the system reminders the app added with it. */
interface StepBase {
  readonly id: string;
  readonly blocks: readonly Block[];
  /** Reminders the app added after this step; their tokens are the step's `reminder` block. */
  readonly reminders?: readonly Reminder[];
}

/**
 * One step of the timeline: one message of the chat. `start` is the starting instructions, `memory` a memory file,
 * `you` and `ai` the visible turns, `tool` one response's tool calls with their results, `compact` an automatic or
 * manual compaction, `cleared` old tool results the app cleared from the window.
 */
export type Step =
  | (StepBase & { readonly kind: 'start' })
  | (StepBase & { readonly kind: 'memory'; readonly path: string })
  | (StepBase & { readonly kind: 'you'; readonly text: string })
  | (StepBase & { readonly kind: 'ai'; readonly text: string })
  | (StepBase & { readonly kind: 'tool'; readonly calls: readonly ToolCall[] })
  | (StepBase & { readonly kind: 'compact'; readonly trigger: 'auto' | 'manual'; readonly summary: string })
  | (StepBase & { readonly kind: 'cleared'; readonly cleared: number });

/** A chat as a session log holds it: its steps in order. */
export interface Chat {
  readonly id: string;
  readonly steps: readonly Step[];
}

/** The words that explain one step, in one locale. Inline `code` and **bold** are the only markup. */
export interface StepStory {
  /** The timeline's one-line name of the step. */
  readonly event: string;
  /** The panel's explanation in plain words. */
  readonly simple: string;
  /** The panel's explanation in technical words. */
  readonly technical: string;
  /** A code block under the technical explanation. */
  readonly pre?: string;
  /** A tool step's or a chip's line in the Simple chat, such as "Searched the web". */
  readonly act?: string;
  /** A tool step's or a chip's short description, in Simple and Technical. */
  readonly label?: string;
  readonly labelTechnical?: string;
  /** A tool step's result line, such as "Fetched 10 pages · 15k of extracts". */
  readonly out?: string;
  /** The step's dim `#` line in the terminal. */
  readonly term?: string;
  /** A compaction's lists of what the summary kept and dropped. */
  readonly kept?: readonly string[];
  readonly dropped?: readonly string[];
}

/** What the log does not hold about a step: its words and how the chat treats it. */
export interface StepNotes {
  /** A message the AI may fill itself when it gets little attention: a dashed note in the Attention view. */
  readonly mayFill?: boolean;
  /** Earlier steps this one repeats, which keeps their attention up. */
  readonly refs?: readonly string[];
  /** A big jump in the window, drawn as a large mark on the timeline. */
  readonly big?: boolean;
}

export type Mode = 'explain' | 'attention';
export type Depth = 'simple' | 'technical';
export type Part = 'chat' | 'timeline' | 'context' | 'panel';
export type Control = 'show' | 'depth' | 'mode' | 'collapse' | 'meter';
export type Motion = 'off' | 'crisp' | 'rise' | 'spring';

/** A smart-zone line drawn across the bar at a token count. */
export interface Line {
  readonly id: string;
  readonly tokens: number;
  /** The label, for example "Smart zone by Matt Pocock". */
  readonly label: string;
  /** Whose line it is, for the readout "Past Matt Pocock's smart zone". */
  readonly who: string;
  /** The short number on the label, "80K". */
  readonly short: string;
}

/** One window size a Preset can switch to, with the lines drawn on it. */
export interface WindowSize {
  readonly tokens: number;
  readonly bufferTokens: number;
  readonly lines: readonly Line[];
}

/** One Slide's state of the interactive cornerstone. */
export interface Preset {
  readonly id: string;
  readonly chat: string;
  /** The first step, 1-based, on the timeline. */
  readonly step: number;
  readonly mode: Mode;
  readonly depth: Depth;
  /** The part lit at rest: a step id, a block (`m8@tool_result`), a category (`cat:`, `scat:`) or `group:messages`. */
  readonly pinned: string | null;
  readonly show: Readonly<Record<Part, boolean>>;
  readonly controls: readonly Control[];
  readonly controlsHidden: boolean;
  readonly timelineLocked: boolean;
  readonly meterHidden: boolean;
  /** A toolbar button that saves the chat as a Claude Code log. On by default. */
  readonly download: boolean;
  /** A toolbar button that opens a Claude Code log in place of the chat. Off by default. */
  readonly upload: boolean;
  /** The window sizes, the first one shown at rest. */
  readonly windows: readonly WindowSize[];
  /** The 200K | 1M switch between the window sizes, in the context's head. Off by default; it needs two sizes. */
  readonly windowSwitch: boolean;
  readonly motion: Motion;
  /** The height of the main row in rem on a wide container. 38 by default; a Slide short of room sets less. */
  readonly height: number;
}

/** One static mini bar: a chat at a step. */
export interface MiniBar {
  readonly label: string;
  readonly chat: string;
  readonly step: number;
  /** A worker chat that is thrown away once it hands its result back. */
  readonly discarded: boolean;
}

/** A row of static mini bars on one window size. */
export interface MiniPreset {
  readonly id: string;
  readonly mini: readonly MiniBar[];
  readonly window: WindowSize;
}
