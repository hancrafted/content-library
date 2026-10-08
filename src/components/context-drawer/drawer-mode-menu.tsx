import { menuItemAfter } from '@/lib/context-drawer.pure';
import { DRAWER_MODES, type DrawerMode } from '@/lib/prefs.pure';
import { cn } from '@/lib/utils';
import { Check, Ellipsis } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

export interface ModeMenuLabels {
  readonly label: string;
  readonly layout: string;
  readonly beside: string;
  readonly over: string;
}

/** Closes when a pointer lands outside `wrapper`, since a menu item button does not always take focus on click. */
function useDismissOutside(open: boolean, wrapper: RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) close();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, wrapper, close]);
}

type Itemize = (item: string) => string;

function arrowTo(event: KeyboardEvent, itemId: Itemize) {
  const focused = DRAWER_MODES.find((item) => document.activeElement?.id === itemId(item));
  const next = focused ? menuItemAfter(event.key, focused, DRAWER_MODES) : null;
  if (next === null) return;
  event.preventDefault();
  document.getElementById(itemId(next))?.focus();
}

/** Escape closes the menu alone: stopped here, it never reaches the drawer's handler on `window`. */
function menuKeyHandler(menu: {
  open: boolean;
  setOpen: (open: boolean) => void;
  escape: () => void;
  itemId: Itemize;
}) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Escape' && menu.open) {
      event.preventDefault();
      event.stopPropagation();
      return menu.escape();
    }
    if (event.key === 'Tab') return menu.setOpen(false);
    if (!menu.open && event.key === 'ArrowDown') {
      event.preventDefault();
      return menu.setOpen(true);
    }
    arrowTo(event, menu.itemId);
  };
}

/** Open state, the ids it needs and its keyboard handling, kept apart from the markup. */
function useModeMenu(mode: DrawerMode) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const itemId: Itemize = (item) => `${menuId}-${item}`;
  useDismissOutside(open, wrapper, () => setOpen(false));
  useEffect(() => {
    if (open) document.getElementById(`${menuId}-${mode}`)?.focus();
  }, [open, mode, menuId]);
  const closeToButton = () => {
    setOpen(false);
    button.current?.focus();
  };
  const onKeyDown = menuKeyHandler({ open, setOpen, escape: closeToButton, itemId });
  return { open, toggle: () => setOpen((value) => !value), closeToButton, wrapper, button, menuId, itemId, onKeyDown };
}

function MenuItems(props: {
  labels: ModeMenuLabels;
  mode: DrawerMode;
  itemId: (item: string) => string;
  onChoose: (mode: DrawerMode) => void;
}) {
  const { labels, mode } = props;
  return (
    <div role="group" aria-label={labels.layout}>
      {DRAWER_MODES.map((item) => (
        <button
          key={item}
          id={props.itemId(item)}
          type="button"
          role="menuitemradio"
          aria-checked={item === mode}
          tabIndex={-1}
          onClick={() => props.onChoose(item)}
          className={cn(
            'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent',
            item === mode && 'font-medium',
          )}
        >
          <Check aria-hidden className={cn('size-4', item !== mode && 'invisible')} />
          {labels[item]}
        </button>
      ))}
    </div>
  );
}

function Popover(props: {
  menu: ReturnType<typeof useModeMenu>;
  labels: ModeMenuLabels;
  mode: DrawerMode;
  onChange: (mode: DrawerMode) => void;
}) {
  const { menu } = props;
  return (
    <div
      id={menu.menuId}
      role="menu"
      aria-label={props.labels.label}
      className="absolute top-full right-0 z-20 mt-1 min-w-44 rounded-xl border bg-background p-1 shadow-header"
    >
      <MenuItems
        labels={props.labels}
        mode={props.mode}
        itemId={menu.itemId}
        onChoose={(item) => {
          props.onChange(item);
          menu.closeToButton();
        }}
      />
    </div>
  );
}

/**
 * The "more" menu in the card's head: pick how the card sits beside the Slides.
 * A menu button with `menuitemradio` items. Hidden below `xl`, where the card
 * is always an overlay.
 */
export function ModeMenu(props: { labels: ModeMenuLabels; mode: DrawerMode; onChange: (mode: DrawerMode) => void }) {
  const { labels, mode } = props;
  const menu = useModeMenu(mode);
  return (
    <div ref={menu.wrapper} onKeyDown={menu.onKeyDown} className="relative max-xl:hidden print:hidden">
      <button
        ref={menu.button}
        type="button"
        aria-label={labels.label}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-controls={menu.open ? menu.menuId : undefined}
        onClick={menu.toggle}
        className="grid size-8 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Ellipsis aria-hidden className="size-4" />
      </button>
      {menu.open && <Popover menu={menu} labels={labels} mode={mode} onChange={props.onChange} />}
    </div>
  );
}
