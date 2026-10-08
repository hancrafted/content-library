import type { SpeakerNoteItem, VoiceScriptSegment } from '@/lib/context-drawer.pure';

/*
 * The Context drawer's whole input contract (FE-010 §8). The drawer knows
 * nothing about Episodes, Sections, anchors, the table of contents or the
 * catalog: everything it renders, and every element id it watches, arrives here.
 * Whoever owns the content builds one of these (today the adapter in
 * `src/components/episode/context-drawer-input.ts`); the drawer never asks where
 * it came from.
 */

/** One thing the drawer can show notes and script for, current while its element spans the reading line. */
export interface ContextItem {
  /** The DOM id of the element whose visibility makes this item current. The drawer observes it as given. */
  readonly id: string;
  /** Names the item in the drawer's head and, in print, above its entry; none for an untitled Slide. */
  readonly title?: string;
  /** Each note's `target` is the full DOM id of the element it explains; a context reference there carries the same id. */
  readonly notes: readonly SpeakerNoteItem[];
  readonly script: readonly VoiceScriptSegment[];
  /** Pre-translated text shown on both tabs in place of the empty message, for an item that explains the drawer itself. */
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
  /** Said to assistive tech after a source link, e.g. `opens in a new tab`. */
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
  /** The disclosure label of a note's sources, e.g. `Sources (2)`. */
  readonly sources: (count: number) => string;
  /** The accessible name of citation marker `n`, e.g. `Source 2`. */
  readonly citation: (number: number) => string;
}

export interface ContextDrawerInput {
  readonly items: readonly ContextItem[];
  readonly labels: ContextDrawerLabels;
}
