/*
 * The link between a Slide and its Speaker note items in the Context drawer
 * (FE-010 §4, §8). Both sides render, and the delegated listeners find each
 * other, by the data attributes and selectors below, so neither side can drift
 * from the other. Everything is scoped by the drawer item's id, which is the id
 * of the Slide's element: a note's `target` is a short name, marked
 * `data-target` inside that element, and a Context reference names its note by
 * slug, inside the same element. Strings only: the DOM queries live in
 * `src/shared/hooks/use-context-links.ts`.
 */

export const CONTEXT_REF_ATTR = 'data-context-ref';
export const TARGET_ATTR = 'data-target';
export interface TargetProps {
  readonly 'data-target': string;
}

export const NOTE_ATTR = 'data-note';
export const CONTEXT_ITEM_ATTR = 'data-context-for';
export const CONTEXT_ACTIVE_ATTR = 'data-context-active';
export const NOTE_TARGET_ATTR = 'data-note-target';
export const CITATION_ATTR = 'data-citation';
export const SOURCE_ATTR = 'data-source';
export const PINNED_ATTR = 'data-context-pinned';

export const CONTEXT_SCROLL_ATTR = 'data-context-scroll';

export const NOTE_SELECTOR = `[data-slot="context"] [${NOTE_TARGET_ATTR}]`;

/** A CSS string literal: `"` and `\` escaped, so a value never ends the attribute selector early. */
function quoted(value: string): string {
  return `"${value.replace(/["\\]/g, '\\$&')}"`;
}

export interface NoteRef {
  readonly item: string;
  readonly note: string;
}

export const ITEM_SELECTOR = `[${CONTEXT_ITEM_ATTR}]`;

export function itemSelector(id: string): string {
  return `[data-slot="context"] [${CONTEXT_ITEM_ATTR}=${quoted(id)}]`;
}

export function noteSelector(ref: NoteRef): string {
  return `${itemSelector(ref.item)} [${NOTE_ATTR}=${quoted(ref.note)}]`;
}

export function targetSelector(target: string): string {
  return `[${TARGET_ATTR}=${quoted(target)}]`;
}

export function sourceLinkSelector(number: string): string {
  return `[${SOURCE_ATTR}=${quoted(number)}] a`;
}
