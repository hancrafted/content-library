import { menuItemAfter } from '@/shared/lib/roving-focus.pure';
import type { TocPresentation } from '@/shared/lib/table-of-contents.pure';
import { cn } from '@/shared/lib/utils';
import { Check, EllipsisVertical } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import type { TocLabels } from './toc-heading';

const MODES: readonly TocPresentation[] = ['zoom', 'tree'];

interface OptionsProps {
  labels: TocLabels;
  mode: TocPresentation;
  onChange: (mode: TocPresentation) => void;
}

function useDismissal(open: boolean, wrapper: RefObject<HTMLDivElement | null>, dismiss: () => void) {
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) dismiss();
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, wrapper, dismiss]);
}

function moveFocus(event: KeyboardEvent, id: string) {
  const current = MODES.find((mode) => document.activeElement?.id === `${id}-${mode}`);
  const next = current && menuItemAfter(event.key, current, MODES);
  if (!next) return;
  event.preventDefault();
  document.getElementById(`${id}-${next}`)?.focus();
}

function keyHandler(menu: { open: boolean; setOpen: (open: boolean) => void; close: () => void; id: string }) {
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
      moveFocus(event, menu.id);
    }
  };
}

function useOptions(mode: TocPresentation) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  useDismissal(open, wrapper, () => setOpen(false));
  useEffect(() => {
    if (open) document.getElementById(`${id}-${mode}`)?.focus();
  }, [open, id, mode]);
  const onKeyDown = keyHandler({ open, setOpen, close, id });
  return { open, wrapper, trigger, id, close, onKeyDown, toggle: () => setOpen((value) => !value) };
}

function ModeItem(props: OptionsProps & { item: TocPresentation; id: string; close: () => void }) {
  return (
    <button
      id={`${props.id}-${props.item}`}
      type="button"
      role="menuitemradio"
      aria-checked={props.mode === props.item}
      tabIndex={-1}
      onClick={() => {
        props.onChange(props.item);
        props.close();
      }}
      className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-caption hover:bg-accent focus-visible:outline-2"
    >
      <Check aria-hidden className={cn('size-4', props.mode !== props.item && 'invisible')} />
      {props.labels[props.item]}
    </button>
  );
}

function OptionsPopover(props: OptionsProps & { id: string; close: () => void }) {
  return (
    <div
      id={props.id}
      role="menu"
      aria-label={props.labels.presentation}
      className="absolute right-0 bottom-full z-50 mb-2 min-w-40 rounded-xl border bg-background p-1 shadow-header"
    >
      {MODES.map((item) => (
        <ModeItem key={item} {...props} item={item} />
      ))}
    </div>
  );
}

/** A transient presentation choice, deliberately tucked away from the navigation actions. */
export function TocOptions(props: OptionsProps) {
  const menu = useOptions(props.mode);
  return (
    <div ref={menu.wrapper} className="relative shrink-0" onKeyDown={menu.onKeyDown}>
      <button
        ref={menu.trigger}
        type="button"
        aria-label={props.labels.options}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-controls={menu.open ? menu.id : undefined}
        onClick={menu.toggle}
        className="grid size-11 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 md:size-8"
      >
        <EllipsisVertical aria-hidden className="size-4" />
      </button>
      {menu.open && <OptionsPopover {...props} id={menu.id} close={menu.close} />}
    </div>
  );
}
