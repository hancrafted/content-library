import {
  CITATION_ATTR,
  CONTEXT_ACTIVE_ATTR,
  CONTEXT_ITEM_ATTR,
  CONTEXT_REF_ATTR,
  ITEM_SELECTOR,
  NOTE_SELECTOR,
  NOTE_TARGET_ATTR,
  noteSelector,
  PINNED_ATTR,
  sourceLinkSelector,
} from '@/lib/context-link.pure';
import { useEffect } from 'react';

/** The note inside the drawer that a context reference's wrapper id names. */
export function noteOfRef(refId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(noteSelector(refId));
}

/** The id of the drawer item holding the note a context reference's wrapper id names. */
export function itemOfNote(refId: string): string | null {
  return noteOfRef(refId)?.closest(ITEM_SELECTOR)?.getAttribute(CONTEXT_ITEM_ATTR) ?? null;
}

/** The page element a note explains: its `target` is that element's full id. */
function targetOfNote(note: Element): HTMLElement | null {
  return document.getElementById(note.getAttribute(NOTE_TARGET_ATTR) ?? '');
}

/** The element on the other side of a note and its Slide element, for whichever one `from` sits in. */
function counterpart(from: EventTarget | null): Element | null {
  if (!(from instanceof Element)) return null;
  const note = from.closest(NOTE_SELECTOR);
  if (note) return targetOfNote(note);
  const id = refButton(from)?.parentElement?.id;
  return id ? noteOfRef(id) : null;
}

/** The context reference button `from` sits in, if any. */
function refButton(from: EventTarget | null): Element | null {
  return from instanceof Element ? from.closest(`[${CONTEXT_REF_ATTR}]`) : null;
}

/** A context reference's click target: the wrapper's id, which is also its note's `target`. */
function refOf(from: EventTarget | null): string | null {
  return refButton(from)?.parentElement?.id || null;
}

/**
 * Hovering or focusing a note lights up the page element it explains, and a
 * context reference lights up its note, by `data-context-active` (CSS draws it
 * without shifting layout). Clicking a context reference calls `reveal`.
 * Delegated from `document`, so the Slides stay server components (FE-006).
 */
export function useContextLinks(reveal: (noteId: string) => void) {
  useEffect(() => {
    const set = (on: boolean) => (event: Event) => {
      const other = counterpart(event.target);
      if (!other) return;
      if (on) other.setAttribute(CONTEXT_ACTIVE_ATTR, '');
      else other.removeAttribute(CONTEXT_ACTIVE_ATTR);
    };
    const [over, out] = [set(true), set(false)];
    const click = (event: MouseEvent) => {
      const id = refOf(event.target);
      if (id) reveal(id);
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

/** Pins a note (so it stays lit, and in view) while `id` is set; unpins when it clears. */
export function usePinnedNote(id: string | null) {
  useEffect(() => {
    if (!id) return;
    const note = noteOfRef(id);
    note?.setAttribute(PINNED_ATTR, '');
    note?.scrollIntoView({ block: 'nearest' });
    return () => note?.removeAttribute(PINNED_ATTR);
  }, [id]);
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
