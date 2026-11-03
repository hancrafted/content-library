import { useEpisodePortalRoot } from '@/shared/hooks/use-episode-portal-root';
import { menuItemAfter } from '@/shared/lib/roving-focus.pure';
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

type ElementRef = RefObject<HTMLElement | null>;

function menuPosition(trigger: HTMLElement, popup: HTMLElement) {
  const anchor = trigger.getBoundingClientRect();
  const frame = trigger.closest('nav')?.getBoundingClientRect() ?? anchor;
  const dialog = trigger.closest('dialog')?.getBoundingClientRect();
  const bounds = dialog ?? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
  const box = popup.getBoundingClientRect();
  const maxWidth = bounds.right - bounds.left - 32;
  const width = Math.min(box.width, maxWidth);
  return {
    left: Math.max(bounds.left + 16, Math.min(frame.right + 12, bounds.right - width - 16)) - bounds.left,
    top: Math.max(bounds.top + 16, Math.min(anchor.top, bounds.bottom - box.height - 16)) - bounds.top,
    maxWidth,
  };
}

/** Portal out of the rail, but stay inside a native dialog's top layer on mobile. */
function usePosition(open: boolean, trigger: ElementRef, popup: ElementRef) {
  const [position, setPosition] = useState<{ left: number; top: number; maxWidth?: number }>({ left: 0, top: 0 });
  useLayoutEffect(() => {
    if (!open || !popup.current) return;
    const place = () => {
      if (!trigger.current || !popup.current) return;
      setPosition(menuPosition(trigger.current, popup.current));
    };
    const observer = new ResizeObserver(place);
    observer.observe(popup.current);
    if (trigger.current) observer.observe(trigger.current.closest('nav') ?? trigger.current);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { capture: true, passive: true });
    place();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, { capture: true });
    };
  }, [open, trigger, popup]);
  return position;
}

function useDismiss(
  open: boolean,
  { trigger, popup }: { trigger: ElementRef; popup: ElementRef },
  dismiss: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !popup.current?.contains(target)) dismiss();
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, trigger, popup, dismiss]);
}

function moveFocus(event: KeyboardEvent, id: string, items: readonly string[]) {
  const current = items.find((item) => document.activeElement?.id === `${id}-${item}`);
  const next = current && menuItemAfter(event.key, current, items);
  if (!next) return;
  event.preventDefault();
  document.getElementById(`${id}-${next}`)?.focus();
}

function keyHandler(
  menu: { open: boolean; setOpen: (open: boolean) => void; close: () => void; id: string },
  items: readonly string[],
) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Escape' && menu.open) {
      event.preventDefault();
      event.stopPropagation();
      menu.close();
    } else if (event.key === 'Tab') {
      menu.setOpen(false);
    } else if (!menu.open && event.key === 'ArrowDown') {
      event.preventDefault();
      menu.setOpen(true);
    } else if (menu.open) {
      moveFocus(event, menu.id, items);
    }
  };
}

export function useTocMenu(items: readonly string[]) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const root = useEpisodePortalRoot();
  const id = useId();
  const position = usePosition(open, trigger, popup);
  const first = items[0];
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  useDismiss(open, { trigger, popup }, () => setOpen(false));
  useEffect(() => {
    if (open) document.getElementById(`${id}-${first}`)?.focus();
  }, [open, id, first]);
  const onKeyDown = keyHandler({ open, setOpen, close, id }, items);
  return {
    open,
    trigger,
    popup,
    id,
    position,
    root: trigger.current?.closest('dialog') ?? root,
    close,
    onKeyDown,
    toggle: () => setOpen((value) => !value),
  };
}
