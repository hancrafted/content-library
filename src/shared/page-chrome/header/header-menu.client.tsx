'use client';

import { Button } from '@/shared/components/ui/button';
import { stripLocale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import styles from './header.module.css';

interface HeaderMenuProps {
  brand: ReactNode;
  label: string;
  closeLabel: string;
  children: ReactNode;
  settings: ReactNode;
  social: ReactNode;
  contact: ReactNode;
}

function useCloseAtDesktop(dialog: RefObject<HTMLDialogElement | null>) {
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 64rem)');
    const close = () => {
      if (desktop.matches) dialog.current?.close();
    };
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, [dialog]);
}

function useHeaderDialog() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useId();
  const page = stripLocale(usePathname());
  useCloseAtDesktop(dialog);
  useEffect(() => {
    dialog.current?.close();
  }, [page]);
  const show = () => {
    dialog.current?.showModal();
    setOpen(true);
  };
  const close = () => dialog.current?.close();
  return { open, dialog, panel, show, close, setOpen };
}

function MenuButton({ label, menu }: { label: string; menu: ReturnType<typeof useHeaderDialog> }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(styles.menuButton, 'size-11 shrink-0')}
      aria-expanded={menu.open}
      aria-controls={menu.panel}
      aria-haspopup="dialog"
      aria-label={label}
      data-testid="header-menu"
      onClick={menu.show}
    >
      <Menu aria-hidden />
    </Button>
  );
}

function MenuHeading({ brand, closeLabel, close }: { brand: ReactNode; closeLabel: string; close: () => void }) {
  return (
    <div className={styles.menuHeading}>
      {brand}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0"
        aria-label={closeLabel}
        onClick={close}
      >
        <X aria-hidden />
      </Button>
    </div>
  );
}

function MenuUtilities({ open, ...props }: HeaderMenuProps & { open: boolean }) {
  const settings = (
    <div key="settings" className={styles.settings}>
      {props.settings}
    </div>
  );
  const social = (
    <div key="social" className={styles.social}>
      {props.social}
    </div>
  );
  return (
    <div className={styles.utilities}>
      {open ? [settings, social] : [social, settings]}
      <div className={styles.contact}>{props.contact}</div>
    </div>
  );
}

function dismissOnEscape(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Escape' || event.currentTarget.querySelector('[role="tooltip"]')) return;
  // The force-mounted navigation layer would otherwise consume Escape before the native dialog.
  event.preventDefault();
  event.stopPropagation();
  event.currentTarget.close();
}

function dismissOnDestination(event: MouseEvent<HTMLDialogElement>) {
  const target = event.target as Element;
  if (target.closest('[data-testid="site-nav"] a, [data-testid="brand"]')) event.currentTarget.close();
}

/** One copy of every link, with native modal focus trapping, Escape and focus return on mobile. */
export function HeaderMenu(props: HeaderMenuProps) {
  const menu = useHeaderDialog();
  const navigation = (
    <div key="navigation" className={styles.menuNavigation}>
      {props.children}
    </div>
  );
  const utilities = <MenuUtilities key="utilities" {...props} open={menu.open} />;
  return (
    <>
      <div className={styles.brand}>{!menu.open && props.brand}</div>
      <MenuButton label={props.label} menu={menu} />
      <dialog
        ref={menu.dialog}
        id={menu.panel}
        role={menu.open ? 'dialog' : 'none'}
        aria-label={menu.open ? props.label : undefined}
        className={styles.menu}
        onKeyDown={dismissOnEscape}
        onClose={() => menu.setOpen(false)}
        onClick={dismissOnDestination}
      >
        <MenuHeading brand={menu.open ? props.brand : null} closeLabel={props.closeLabel} close={menu.close} />
        {menu.open ? [utilities, navigation] : [navigation, utilities]}
      </dialog>
    </>
  );
}
