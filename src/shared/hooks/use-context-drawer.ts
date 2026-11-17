import { currentItemId, drawerKeyAction, type DrawerTab } from '@/shared/lib/context-drawer.pure';
import type { NoteRef } from '@/shared/lib/context-link.pure';
import { readPrefs, writePrefs } from '@/shared/lib/prefs-storage';
import { DEFAULT_DRAWER_MODE, type DrawerMode } from '@/shared/lib/prefs.pure';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { noteOfRef, useContextLinks, usePinnedNote } from './use-context-links';
import { useActiveSlide } from './use-url-state';

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

function focusedOr(fallback: HTMLElement | null): HTMLElement | null {
  const focused = document.activeElement;
  return focused instanceof HTMLElement && focused !== document.body ? focused : fallback;
}

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

// decision: FE-010 §2
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

// decision: FE-001 §3
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

interface Revealed {
  readonly note: NoteRef;
  readonly item: string;
  readonly observed: string | null;
}

// decision: FE-001 §3
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
