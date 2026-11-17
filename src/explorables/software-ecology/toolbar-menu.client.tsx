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

export const MenuFace = ({ text }: { readonly text: string }) => (
  <>
    <span>{text}</span>
    <span aria-hidden="true">▾</span>
  </>
);

export interface ToolbarMenuProps {
  readonly open: boolean;
  readonly onOpen: (open: boolean) => void;
  readonly face: ReactNode;
  readonly ariaLabel?: string;
  readonly tip: string;
  readonly label: string;
  readonly control: string;
  readonly buttonClass: string;
  readonly pressed?: boolean;
  readonly role: 'menu' | 'dialog';
  readonly placement?: 'below' | 'window';
  readonly menuClass?: string;
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
