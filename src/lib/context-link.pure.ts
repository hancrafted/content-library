/*
 * The link between a Slide and its Speaker note items in the Context drawer
 * (FE-010 §4, §8). Both sides render, and the delegated listeners find each
 * other, by the data attributes and selectors below, so neither side can drift
 * from the other. Everything is scoped by the drawer item's id, which is the id
 * of the Slide's element: a note's `target` is a short name, marked
 * `data-target` inside that element, and a Context reference names its note by
 * slug, inside the same element. Strings only: the DOM queries live in
 * `src/hooks/use-context-links.ts`.
 */

/** On a Context reference's button; its value is the note's slug. */
export const CONTEXT_REF_ATTR = 'data-context-ref';
/** On the element a note explains, inside its item's element; its value is the note's short `target`. */
export const TARGET_ATTR = 'data-target';
/** What a Slide's `target(name)` returns: spread it on the element a note explains. */
export interface TargetProps {
  readonly 'data-target': string;
}

/** On a Speaker note item in the drawer; its value is the note's slug. */
export const NOTE_ATTR = 'data-note';
/** Tags each item's entry in the slot; its value is the item's `id`. */
export const CONTEXT_ITEM_ATTR = 'data-context-for';
/** Lights up the element on the other side of a hovered or focused link. */
export const CONTEXT_ACTIVE_ATTR = 'data-context-active';
/** On a Speaker note item in the drawer; its value is the note's short `target`. */
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

/** One Speaker note item, by the id of the item holding it and its slug: what a Context reference names. */
export interface NoteRef {
  readonly item: string;
  readonly note: string;
}

/** A drawer item's entry, as the one holding a note. */
export const ITEM_SELECTOR = `[${CONTEXT_ITEM_ATTR}]`;

/** The drawer's entries for item `id`. */
export function itemSelector(id: string): string {
  return `[data-slot="context"] [${CONTEXT_ITEM_ATTR}=${quoted(id)}]`;
}

/** The Speaker note item a Context reference names: note `note` in the entry of item `item`. */
export function noteSelector(ref: NoteRef): string {
  return `${itemSelector(ref.item)} [${NOTE_ATTR}=${quoted(ref.note)}]`;
}

/** The element a note explains, to be queried inside its item's element only. */
export function targetSelector(target: string): string {
  return `[${TARGET_ATTR}=${quoted(target)}]`;
}

/** The link of source `number` inside a note's sources, as a citation marker names it. */
export function sourceLinkSelector(number: string): string {
  return `[${SOURCE_ATTR}=${quoted(number)}] a`;
}
