import { currentItemId, drawerKeyAction, type DrawerTab } from '@/lib/context-drawer.pure';
import type { NoteRef } from '@/lib/context-link.pure';
import { readPrefs, writePrefs } from '@/lib/prefs-storage';
import { DEFAULT_DRAWER_MODE, type DrawerMode } from '@/lib/prefs.pure';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { noteOfRef, useContextLinks, usePinnedNote } from './use-context-links';
import { useActiveSlide } from './use-url-state';

/** Alt+N toggles and Escape closes, from anywhere on the page. */
function useDrawerKeys(open: boolean, toggle: () => void, close: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const action = drawerKeyAction(event, open);
      if (!action) return;
      event.preventDefault();
      if (action === 'toggle') toggle();
      else close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, toggle, close]);
}

/** What had focus when the drawer opened, or the trigger when nothing but the page did. */
function focusedOr(fallback: HTMLElement | null): HTMLElement | null {
  const focused = document.activeElement;
  return focused instanceof HTMLElement && focused !== document.body ? focused : fallback;
}

/**
 * Focus enters the selected tab on open and returns to whatever opened the
 * drawer on close (the trigger when the shortcut opened it from nowhere).
 */
function useFocusHandoff(open: boolean, tab: RefObject<HTMLElement | null>, fallback: RefObject<HTMLElement | null>) {
  const opener = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      opener.current = focusedOr(fallback.current);
      tab.current?.focus();
    }
    if (!open && wasOpen.current) opener.current?.focus();
    wasOpen.current = open;
  }, [open, tab, fallback]);
}

/**
 * Sources sit in closed `<details>`, which print drops; open them for the print
 * job and put them back after (FE-010 §2).
 */
function usePrintDisclosure() {
  useEffect(() => {
    let opened: HTMLDetailsElement[] = [];
    const before = () => {
      opened = [...document.querySelectorAll<HTMLDetailsElement>('[data-slot="context"] details:not([open])')];
      opened.forEach((details) => (details.open = true));
    };
    const after = () => {
      opened.forEach((details) => (details.open = false));
      opened = [];
    };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);
}

/**
 * The layout mode and a setter that persists it (FE-001 §3). Starts on the default
 * and adopts the stored choice after mount, like the theme, so the static page
 * and the first client render agree.
 */
function useDrawerMode(): [DrawerMode, (mode: DrawerMode) => void] {
  const [mode, setModeState] = useState<DrawerMode>(DEFAULT_DRAWER_MODE);
  useEffect(() => {
    setModeState(readPrefs().drawerMode ?? DEFAULT_DRAWER_MODE);
  }, []);
  const setMode = useCallback((next: DrawerMode) => {
    writePrefs({ drawerMode: next });
    setModeState(next);
  }, []);
  return [mode, setMode];
}

/** A note a context reference opened, and the item it was shown for (valid while that item stays current). */
interface Revealed {
  readonly note: NoteRef;
  readonly item: string;
  readonly observed: string | null;
}

/**
 * State of the Context drawer: open, selected tab, layout mode (a stored
 * preference, FE-001 §3), and the item of the active Slide in the URL, falling
 * back to the first of the given ids. A context reference opens the drawer on
 * Notes at its note; that note's item is shown until the reading line moves on.
 */
export function useContextDrawer(ids: readonly string[]) {
  const observed = currentItemId(useActiveSlide(), ids);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<DrawerTab>('notes');
  const [mode, setMode] = useDrawerMode();
  const [revealed, setRevealed] = useState<Revealed | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selectedTab = useRef<HTMLButtonElement>(null);
  const toggle = () => setOpen((value) => !value);
  const close = () => setOpen(false);
  const live = revealed && revealed.observed === observed ? revealed : null;
  const reveal = useCallback(
    (note: NoteRef) => {
      if (noteOfRef(note)) setRevealed({ note, item: note.item, observed });
      setTab('notes');
      setOpen(true);
    },
    [observed],
  );
  useDrawerKeys(open, toggle, close);
  useFocusHandoff(open, selectedTab, trigger);
  usePrintDisclosure();
  useContextLinks(reveal);
  usePinnedNote(open && live ? live.note : null);
  const current = live && ids.includes(live.item) ? live.item : observed;
  return { current, open, tab, setTab, mode, setMode, toggle, close, trigger, selectedTab };
}
