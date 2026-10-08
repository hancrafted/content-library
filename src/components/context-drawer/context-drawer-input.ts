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
  /** Names the item in the drawer's head and, in print, above its entry. */
  readonly title: string;
  /** Each note's `target` is the full DOM id of the element it explains; a context reference there carries the same id. */
  readonly notes: readonly SpeakerNoteItem[];
  readonly script: readonly VoiceScriptSegment[];
}

/**
 * Chrome strings, already translated. `sources` and `citation` format a count
 * or number for the locale; they are called on the server and never cross to
 * the client drawer, which takes only the plain strings (`DrawerLabels`).
 */
export interface ContextDrawerLabels {
  readonly title: string;
  readonly open: string;
  readonly close: string;
  readonly shortcut: string;
  readonly tabs: { readonly notes: string; readonly script: string };
  readonly menu: { readonly label: string; readonly layout: string; readonly beside: string; readonly over: string };
  readonly empty: { readonly notes: string; readonly script: string };
  /** The disclosure label of a note's sources, e.g. `Sources (2)`. */
  readonly sources: (count: number) => string;
  /** The accessible name of citation marker `n`, e.g. `Source 2`. */
  readonly citation: (number: number) => string;
  /** Said to assistive tech after a source link, e.g. `opens in a new tab`. */
  readonly opensInNewTab: string;
  readonly keywords: string;
  readonly bridge: string;
  readonly slide: string;
}

export interface ContextDrawerInput {
  readonly items: readonly ContextItem[];
  readonly labels: ContextDrawerLabels;
}
