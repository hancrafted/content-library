import type { Category, Depth, Mode, Part, SimpleCategory } from './context-window.types';

/** A smart-zone line's words. */
export interface LineWords {
  readonly label: string;
  readonly who: string;
}

/**
 * Every word the cornerstone prints, from context-preset.config.yml or its German twin. A `{name}` placeholder is
 * filled in the browser by `fillTemplate`.
 */
export interface ContextWindowWords {
  readonly controls: string;
  readonly showParts: string;
  readonly parts: Readonly<Record<Part, string>>;
  readonly technical: string;
  readonly technicalTip: string;
  readonly modeGroup: string;
  readonly modes: Readonly<Record<Mode, string>>;
  readonly collapse: string;
  readonly collapseTip: string;
  readonly meter: string;
  readonly meterTip: string;
  readonly windowGroup: string;
  readonly download: string;
  readonly upload: string;
  readonly uploadFailed: string;
  readonly chat: string;
  readonly hint: string;
  readonly appTitle: string;
  readonly terminalTitle: string;
  readonly mayFill: string;
  readonly minimap: string;
  readonly timeline: string;
  readonly steps: string;
  readonly stepEvent: string;
  readonly contextWindow: string;
  readonly meterValue: string;
  readonly bar: string;
  readonly limit: string;
  readonly grid: string;
  readonly usage: string;
  readonly usageTitle: Readonly<Record<Depth, string>>;
  readonly zoom: string;
  readonly zoomTitle: string;
  readonly zoomTokens: string;
  readonly zoomStep: string;
  readonly blockLabel: string;
  readonly boxLabel: string;
  readonly bubbleLabel: string;
  readonly details: string;
  readonly illustrative: string;
  readonly simple: string;
  readonly readoutHead: string;
  readonly readoutSentence: string;
  readonly readoutSentenceCrossed: string;
  readonly crossed: string;
  readonly attentionKicker: string;
  readonly attentionLead: string;
  readonly pinned: string;
  readonly pinnedKicker: string;
  readonly stepKicker: string;
  readonly notYet: string;
  readonly notYetHint: string;
  readonly category: string;
  readonly tokens: string;
  readonly ofWindow: string;
  readonly stepOne: string;
  readonly stepOther: string;
  readonly nothingYet: string;
  readonly gone: string;
  readonly goneCompacted: string;
  readonly goneCleared: string;
  readonly kept: string;
  readonly dropped: string;
  readonly used: string;
  readonly restHint: string;
  readonly compacted: string;
  readonly cleared: string;
  readonly acts: Readonly<Record<'web' | 'read' | 'run', string>>;
  readonly categories: Readonly<Record<Category, string>>;
  readonly simpleCategories: Readonly<Record<SimpleCategory, string>>;
  readonly messages: string;
  readonly free: string;
  readonly buffer: Readonly<Record<Depth, string>>;
  readonly lines: Readonly<Record<string, LineWords>>;
  readonly mini: {
    readonly used: string;
    readonly discarded: string;
    readonly labels: Readonly<Record<string, string>>;
  };
}
