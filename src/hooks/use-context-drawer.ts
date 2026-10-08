import { useActiveId } from '@/hooks/use-table-of-contents';
import { currentSlideAnchor, drawerKeyAction, type DrawerTab } from '@/lib/context-drawer.pure';
import { useEffect, useRef, useState, type RefObject } from 'react';

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

/** State of the Context drawer: open, selected tab, and the Slide at the reading line. */
export function useContextDrawer(anchors: readonly string[], targetAttribute: string) {
  const current = currentSlideAnchor(useActiveId(anchors, targetAttribute), anchors);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<DrawerTab>('notes');
  const trigger = useRef<HTMLButtonElement>(null);
  const selectedTab = useRef<HTMLButtonElement>(null);
  const toggle = () => setOpen((value) => !value);
  const close = () => setOpen(false);
  useDrawerKeys(open, toggle, close);
  useFocusHandoff(open, selectedTab, trigger);
  return { current, open, tab, setTab, toggle, close, trigger, selectedTab };
}
