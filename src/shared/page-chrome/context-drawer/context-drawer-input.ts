import type { SpeakerNoteItem, VoiceScriptSegment } from '@/shared/lib/context-drawer.pure';

// decision: FE-010 §8

export interface ContextItem {
  readonly id: string;
  readonly title?: string;
  readonly notes: readonly SpeakerNoteItem[];
  readonly script: readonly VoiceScriptSegment[];
  readonly explainer?: string;
}

// decision: FE-006 §4
export interface DrawerStrings {
  readonly title: string;
  readonly open: string;
  readonly close: string;
  readonly shortcut: string;
  readonly slide: string;
  readonly tabs: { readonly notes: string; readonly script: string };
  readonly menu: { readonly label: string; readonly layout: string; readonly beside: string; readonly over: string };
  readonly empty: { readonly notes: string; readonly script: string };
  readonly opensInNewTab: string;
  readonly keywords: string;
  readonly bridge: string;
}

export interface ContextDrawerLabels {
  readonly strings: DrawerStrings;
  readonly sources: (count: number) => string;
  readonly citation: (number: number) => string;
}

export interface ContextDrawerInput {
  readonly items: readonly ContextItem[];
  readonly labels: ContextDrawerLabels;
}
