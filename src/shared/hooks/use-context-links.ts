import { revealScrollTop } from '@/shared/lib/context-drawer.pure';
import {
  CITATION_ATTR,
  CONTEXT_ACTIVE_ATTR,
  CONTEXT_ITEM_ATTR,
  CONTEXT_REF_ATTR,
  CONTEXT_SCROLL_ATTR,
  ITEM_SELECTOR,
  itemSelector,
  NOTE_SELECTOR,
  NOTE_TARGET_ATTR,
  noteSelector,
  PINNED_ATTR,
  sourceLinkSelector,
  targetSelector,
  type NoteRef,
} from '@/shared/lib/context-link.pure';
import { useEffect } from 'react';

export function noteOfRef(ref: NoteRef): HTMLElement | null {
  return document.querySelector<HTMLElement>(noteSelector(ref));
}

function targetOfNote(note: Element): HTMLElement | null {
  const item = note.closest(ITEM_SELECTOR)?.getAttribute(CONTEXT_ITEM_ATTR) ?? '';
  const target = note.getAttribute(NOTE_TARGET_ATTR) ?? '';
  const scope = document.getElementById(item);
  return scope?.querySelector<HTMLElement>(targetSelector(target)) ?? null;
}

function refButton(from: EventTarget | null): Element | null {
  return from instanceof Element ? from.closest(`[${CONTEXT_REF_ATTR}]`) : null;
}

function refOf(from: EventTarget | null): NoteRef | null {
  const button = refButton(from);
  const note = button?.getAttribute(CONTEXT_REF_ATTR);
  if (!button || !note) return null;
  for (let at = button.parentElement; at; at = at.parentElement) {
    if (at.id && document.querySelector(itemSelector(at.id))) return { item: at.id, note };
  }
  return null;
}

function counterpart(from: EventTarget | null): Element | null {
  if (!(from instanceof Element)) return null;
  const note = from.closest(NOTE_SELECTOR);
  if (note) return targetOfNote(note);
  const ref = refOf(from);
  return ref ? noteOfRef(ref) : null;
}

// decision: FE-006 §1
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

function scrollToTop(note: HTMLElement): void {
  const body = note.closest<HTMLElement>(`[${CONTEXT_SCROLL_ATTR}]`);
  if (!body) return;
  const offset = note.getBoundingClientRect().top - body.getBoundingClientRect().top - body.clientTop + body.scrollTop;
  const inset = Number.parseFloat(getComputedStyle(body).paddingTop) || 0;
  body.scrollTo({
    top: revealScrollTop({ offset, inset, scrollHeight: body.scrollHeight, clientHeight: body.clientHeight }),
  });
}

export function usePinnedNote(ref: NoteRef | null) {
  useEffect(() => {
    if (!ref) return;
    const note = noteOfRef(ref);
    if (!note) return;
    note.setAttribute(PINNED_ATTR, '');
    scrollToTop(note);
    return () => note.removeAttribute(PINNED_ATTR);
  }, [ref]);
}

export function revealCitation(event: { target: EventTarget | null }): void {
  if (!(event.target instanceof Element)) return;
  const marker = event.target.closest(`[${CITATION_ATTR}]`);
  const note = marker?.closest(`[${NOTE_TARGET_ATTR}]`);
  const details = note?.querySelector('details');
  if (!marker || !details) return;
  details.open = true;
  details.querySelector<HTMLElement>(sourceLinkSelector(String(marker.getAttribute(CITATION_ATTR))))?.focus();
}
