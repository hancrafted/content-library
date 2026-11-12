'use client';

import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { Glyph } from './factory-glyph-view';
import styles from './software-ecology.module.css';

/*
 * A toolbar dropdown, as the reference build's `wireMenu` makes the Model and ⋮ menus: its button toggles it, a click
 * outside or Escape closes it, and Escape hands focus back to its button. Escape closes an open menu before anything
 * else, so it stops there. Which menu is open belongs to the toolbar: one at a time.
 */

export interface ToolbarMenuProps {
  readonly open: boolean;
  readonly onOpen: (open: boolean) => void;
  /** Its glyph; the Scenarios button has none. */
  readonly icon?: string;
  /** The button's visible text; without it the button is an icon with `aria-label`. */
  readonly text?: string;
  readonly ariaLabel?: string;
  readonly tip: string;
  /** The menu group's name. */
  readonly label: string;
  /** The ⋮ menu: aligned to the button's right edge. */
  readonly end?: boolean;
  /** The Scenarios menu: a state-row button, pressed while one of its states is on, its entries a menu. */
  readonly state?: { readonly pressed: boolean };
  /** Extra classes on the menu box. */
  readonly menuClass?: string;
  readonly children: ReactNode;
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

const buttonClass = (p: ToolbarMenuProps) =>
  p.state ? `${styles.state} ${styles.stateMenu} text-caption font-medium` : `${styles.tbtn} text-caption`;

/** The button's glyph and text, and the ▾ after a text. */
function MenuFace(p: ToolbarMenuProps) {
  return (
    <>
      {p.icon ? <Glyph name={p.icon} className={styles.ico} /> : null}
      {p.text ? <span className={p.state ? undefined : styles.tbtnLabel}>{p.text}</span> : null}
      {p.text ? <span aria-hidden="true">▾</span> : null}
    </>
  );
}

function MenuButton(p: ToolbarMenuProps & { btn: RefObject<HTMLButtonElement | null>; menuId: string }) {
  return (
    <button
      ref={p.btn}
      type="button"
      className={buttonClass(p)}
      aria-expanded={p.open}
      aria-controls={p.menuId}
      aria-pressed={p.state?.pressed}
      aria-label={p.ariaLabel}
      data-tip={p.tip || undefined}
      onClick={() => p.onOpen(!p.open)}
    >
      <MenuFace {...p} />
    </button>
  );
}

export function ToolbarMenu(p: ToolbarMenuProps) {
  const id = useId(),
    anchor = useRef<HTMLDivElement>(null);
  const btn = useDismiss(p, anchor);
  return (
    <div ref={anchor} className={p.state ? styles.menuAnchor : `${styles.tgroup} ${styles.menuAnchor}`}>
      <MenuButton {...p} btn={btn} menuId={id} />
      <div
        id={id}
        className={`${styles.menu} ${p.end ? styles.menuEnd : ''} ${p.menuClass ?? ''} text-caption shadow-md`}
        role={p.state ? 'menu' : 'group'}
        aria-label={p.label}
        hidden={!p.open}
      >
        {p.children}
      </div>
    </div>
  );
}
