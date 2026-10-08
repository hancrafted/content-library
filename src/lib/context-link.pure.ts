/*
 * The link between a Context reference in a Slide and its Speaker note item in
 * the Context drawer (FE-010 §4, §8). Both sides render, and the delegated
 * listeners find each other, by the data attributes and selectors below, so
 * neither side can drift from the other. The note's `target` is the full id of
 * the element it explains; a Context reference's wrapper carries that same id.
 * Strings only: the DOM queries live in `src/hooks/use-context-links.ts`.
 */

/** On a Context reference's button; its value is the note's slug. */
export const CONTEXT_REF_ATTR = 'data-context-ref';
/** Tags each item's entry in the slot; its value is the item's `id`. */
export const CONTEXT_ITEM_ATTR = 'data-context-for';
/** Lights up the element on the other side of a hovered or focused link. */
export const CONTEXT_ACTIVE_ATTR = 'data-context-active';
/** On a Speaker note item in the drawer; its value is the note's `target`. */
export const NOTE_TARGET_ATTR = 'data-note-target';
/** On a citation marker; its value is the 1-based number of the source it cites. */
export const CITATION_ATTR = 'data-citation';
/** On a source of a note; its value is that source's 1-based number, as its citation markers name it. */
export const SOURCE_ATTR = 'data-source';
/** Keeps a note lit (and in view) while the Context reference that opened it is pinned. */
export const PINNED_ATTR = 'data-context-pinned';

/** Any Speaker note item inside the drawer's slot. */
export const NOTE_SELECTOR = `[data-slot="context"] [${NOTE_TARGET_ATTR}]`;

/** A CSS string literal: `"` and `\` escaped, so a value never ends the attribute selector early. */
function quoted(value: string): string {
  return `"${value.replace(/["\\]/g, '\\$&')}"`;
}

/** The Speaker note item whose `target` is `id`: the note a Context reference with wrapper id `id` names. */
export function noteSelector(id: string): string {
  return `${NOTE_SELECTOR}[${NOTE_TARGET_ATTR}=${quoted(id)}]`;
}

/** A drawer item's entry, as the one holding a note. */
export const ITEM_SELECTOR = `[${CONTEXT_ITEM_ATTR}]`;

/** The link of source `number` inside a note's sources, as a citation marker names it. */
export function sourceLinkSelector(number: string): string {
  return `[${SOURCE_ATTR}=${quoted(number)}] a`;
}
