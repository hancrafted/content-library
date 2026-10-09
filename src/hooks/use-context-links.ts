import {
  CITATION_ATTR,
  CONTEXT_ACTIVE_ATTR,
  CONTEXT_ITEM_ATTR,
  CONTEXT_REF_ATTR,
  ITEM_SELECTOR,
  itemSelector,
  NOTE_SELECTOR,
  NOTE_TARGET_ATTR,
  noteSelector,
  PINNED_ATTR,
  sourceLinkSelector,
  targetSelector,
  type NoteRef,
} from '@/lib/context-link.pure';
import { useEffect } from 'react';

/** The Speaker note item a Context reference names, inside the drawer. */
export function noteOfRef(ref: NoteRef): HTMLElement | null {
  return document.querySelector<HTMLElement>(noteSelector(ref));
}

/**
 * The page element a note explains: the `data-target` it names, inside the
 * element of the note's item (the Slide wrapper), so two Slides may both say
 * `prose`.
 */
function targetOfNote(note: Element): HTMLElement | null {
  const item = note.closest(ITEM_SELECTOR)?.getAttribute(CONTEXT_ITEM_ATTR) ?? '';
  const target = note.getAttribute(NOTE_TARGET_ATTR) ?? '';
  const scope = document.getElementById(item);
  return scope?.querySelector<HTMLElement>(targetSelector(target)) ?? null;
}

/** The context reference button `from` sits in, if any. */
function refButton(from: EventTarget | null): Element | null {
  return from instanceof Element ? from.closest(`[${CONTEXT_REF_ATTR}]`) : null;
}

/**
 * The note a context reference names: its own slug, in the item whose element
 * holds the reference. Found by walking up to the nearest ancestor that is a
 * drawer item's element, so the drawer needs no knowledge of Slides.
 */
function refOf(from: EventTarget | null): NoteRef | null {
  const button = refButton(from);
  const note = button?.getAttribute(CONTEXT_REF_ATTR);
  if (!button || !note) return null;
  for (let at = button.parentElement; at; at = at.parentElement) {
    if (at.id && document.querySelector(itemSelector(at.id))) return { item: at.id, note };
  }
  return null;
}

/** The element on the other side of a note and its Slide element, for whichever one `from` sits in. */
function counterpart(from: EventTarget | null): Element | null {
  if (!(from instanceof Element)) return null;
  const note = from.closest(NOTE_SELECTOR);
  if (note) return targetOfNote(note);
  const ref = refOf(from);
  return ref ? noteOfRef(ref) : null;
}

/**
 * Hovering or focusing a note lights up the page element it explains, and a
 * context reference lights up its note, by `data-context-active` (CSS draws it
 * without shifting layout). Clicking a context reference calls `reveal`.
 * Delegated from `document`, so the Slides stay server components (FE-006).
 */
export function useContextLinks(reveal: (ref: NoteRef) => void) {
  useEffect(() => {
    const set = (on: boolean) => (event: Event) => {
      const other = counterpart(event.target);
      if (!other) return;
      if (on) other.setAttribute(CONTEXT_ACTIVE_ATTR, '');
      else other.removeAttribute(CONTEXT_ACTIVE_ATTR);
    };
    const [over, out] = [set(true), set(false)];
    const click = (event: MouseEvent) => {
      const ref = refOf(event.target);
      if (ref) reveal(ref);
    };
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerout', out);
    document.addEventListener('focusin', over);
    document.addEventListener('focusout', out);
    document.addEventListener('click', click);
    return () => {
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerout', out);
      document.removeEventListener('focusin', over);
      document.removeEventListener('focusout', out);
      document.removeEventListener('click', click);
    };
  }, [reveal]);
}

/** Pins a note (so it stays lit, and in view) while `ref` is set; unpins when it clears. */
export function usePinnedNote(ref: NoteRef | null) {
  useEffect(() => {
    if (!ref) return;
    const note = noteOfRef(ref);
    note?.setAttribute(PINNED_ATTR, '');
    note?.scrollIntoView({ block: 'nearest' });
    return () => note?.removeAttribute(PINNED_ATTR);
  }, [ref]);
}

/**
 * A citation marker's click: open its note's Sources and focus source n. The
 * markers are server-rendered buttons; the card delegates the click here.
 */
export function revealCitation(event: { target: EventTarget | null }): void {
  if (!(event.target instanceof Element)) return;
  const marker = event.target.closest(`[${CITATION_ATTR}]`);
  const note = marker?.closest(`[${NOTE_TARGET_ATTR}]`);
  const details = note?.querySelector('details');
  if (!marker || !details) return;
  details.open = true;
  details.querySelector<HTMLElement>(sourceLinkSelector(String(marker.getAttribute(CITATION_ATTR))))?.focus();
}
