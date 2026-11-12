'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { placeSettings, type SettingsPlace } from './settings-placement.pure.ts';
import styles from './software-ecology.module.css';
import { ToolTip } from './toolbar-tip.client';

/*
 * A toolbar dropdown, as the reference build's `wireMenu` makes its menus: its button toggles it, a click outside or
 * Escape closes it, and Escape hands focus back to its button. Escape closes an open menu before anything else, so it
 * stops there. Which menu is open belongs to the toolbar: one at a time. A `window` menu (the Settings popover) is
 * fixed to the window and placed by `placeSettings`, so it stays inside it (feedback 08); a `below` menu hangs under
 * its button.
 */

/** A menu button's text and its ▾. */
export const MenuFace = ({ text }: { readonly text: string }) => (
  <>
    <span>{text}</span>
    <span aria-hidden="true">▾</span>
  </>
);

export interface ToolbarMenuProps {
  readonly open: boolean;
  readonly onOpen: (open: boolean) => void;
  /** What the button shows: a glyph, a text and its ▾. */
  readonly face: ReactNode;
  /** The button's name when its face is a glyph alone. */
  readonly ariaLabel?: string;
  /** The site's tooltip on the button; none when empty. */
  readonly tip: string;
  /** The menu group's name. */
  readonly label: string;
  /** The button's eval hook, `toolbar.<name>`. */
  readonly control: string;
  /** The button's classes. */
  readonly buttonClass: string;
  /** Pressed while one of its entries is on (the Scenarios button). */
  readonly pressed?: boolean;
  /** `menu` for a list of choices, `dialog` for a panel of controls (the Settings popover). */
  readonly role: 'menu' | 'dialog';
  /**
   * `below` hangs under the button (the default); `window` is fixed to the window, up to 760 px wide and kept inside
   * it (the Settings popover).
   */
  readonly placement?: 'below' | 'window';
  /** Extra classes on the menu box. */
  readonly menuClass?: string;
  /** The menu's body; a function gets `close`, which closes the menu and hands focus back to its button. */
  readonly children: ReactNode | ((close: () => void) => ReactNode);
}

function useDismiss(p: ToolbarMenuProps, anchor: RefObject<HTMLDivElement | null>) {
  const btn = useRef<HTMLButtonElement>(null);
  const { open, onOpen } = p;
  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => {
      if (!anchor.current?.contains(e.target as Node)) onOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onOpen(false);
      btn.current?.focus();
    };
    document.addEventListener('click', click);
    document.addEventListener('keydown', key, { capture: true });
    return () => {
      document.removeEventListener('click', click);
      document.removeEventListener('keydown', key, { capture: true });
    };
  }, [open, onOpen, anchor]);
  return btn;
}

/** The Settings popover's box while it is open, placed again on every resize and scroll. */
function usePlace(open: boolean, on: boolean, btn: RefObject<HTMLButtonElement | null>): SettingsPlace | null {
  const [place, setPlace] = useState<SettingsPlace | null>(null);
  const again = useCallback(() => {
    const b = btn.current?.getBoundingClientRect();
    if (b) setPlace(placeSettings({ button: b, view: { width: innerWidth, height: innerHeight } }));
  }, [btn]);
  useLayoutEffect(() => {
    if (!open || !on) return;
    again();
    addEventListener('resize', again);
    addEventListener('scroll', again, { capture: true, passive: true });
    return () => {
      removeEventListener('resize', again);
      removeEventListener('scroll', again, { capture: true });
    };
  }, [open, on, again]);
  return open && on ? place : null;
}

const boxStyle = (place: SettingsPlace | null) =>
  place ? { left: place.x, top: place.y, width: place.width, maxHeight: place.maxHeight } : undefined;

function MenuButton(p: ToolbarMenuProps & { btn: RefObject<HTMLButtonElement | null>; menuId: string }) {
  return (
    <ToolTip tip={p.tip}>
      <button
        ref={p.btn}
        type="button"
        className={p.buttonClass}
        data-control={p.control}
        aria-expanded={p.open}
        aria-controls={p.menuId}
        aria-haspopup={p.role}
        aria-pressed={p.pressed}
        aria-label={p.ariaLabel}
        onClick={() => p.onOpen(!p.open)}
      >
        {p.face}
      </button>
    </ToolTip>
  );
}

export function ToolbarMenu(p: ToolbarMenuProps) {
  const id = useId(),
    anchor = useRef<HTMLDivElement>(null);
  const btn = useDismiss(p, anchor);
  const inWindow = p.placement === 'window';
  const close = () => {
    p.onOpen(false);
    btn.current?.focus();
  };
  const place = usePlace(p.open, inWindow, btn);
  return (
    <div ref={anchor} className={styles.menuAnchor}>
      <MenuButton {...p} btn={btn} menuId={id} />
      <div
        id={id}
        className={`${styles.menu} ${inWindow ? styles.menuSettings : ''} ${p.menuClass ?? ''} text-caption shadow-md`}
        role={p.role}
        aria-label={p.label}
        hidden={!p.open}
        style={boxStyle(place)}
      >
        {typeof p.children === 'function' ? p.children(close) : p.children}
      </div>
    </div>
  );
}
