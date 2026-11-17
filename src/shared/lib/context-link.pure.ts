// decision: FE-010 §4
// decision: FE-010 §8

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
