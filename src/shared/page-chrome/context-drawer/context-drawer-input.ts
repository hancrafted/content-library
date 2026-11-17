import type { SpeakerNoteItem, VoiceScriptSegment } from '@/shared/lib/context-drawer.pure';

/*
 * The Context drawer's whole input contract (FE-010 §8). The drawer knows
 * nothing about Episodes, Sections, anchors, the table of contents or the
 * Translation file: everything it renders, and every item id it matches against the active Slide, arrives here.
 * Whoever owns the content builds one of these (today the adapter in
 * `src/episodes/components/episode-page/context-drawer-input.ts`); the drawer never asks where
 * it came from.
 */

export interface ContextItem {
  readonly id: string;
  readonly title?: string;
  readonly notes: readonly SpeakerNoteItem[];
  readonly script: readonly VoiceScriptSegment[];
  readonly explainer?: string;
}

/** Chrome strings, already translated: plain strings only, so they cross to the client drawer as they are (FE-006 §4). */
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

/**
 * Every label the drawer renders. `strings` go to the client drawer whole;
 * `sources` and `citation` format a count or number for the locale, are
 * called on the server while the entries render, and never cross.
 */
export interface ContextDrawerLabels {
  readonly strings: DrawerStrings;
  readonly sources: (count: number) => string;
  readonly citation: (number: number) => string;
}

export interface ContextDrawerInput {
  readonly items: readonly ContextItem[];
  readonly labels: ContextDrawerLabels;
}
