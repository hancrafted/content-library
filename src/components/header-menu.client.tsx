'use client';

import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

/** Closes the menu on Escape and on a press outside it; menu open is transient (FE-001), so nothing is stored. */
function useDismiss(open: boolean, close: () => void, root: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close, root]);
}

const PANEL =
  'max-lg:absolute max-lg:inset-x-0 max-lg:top-full max-lg:mt-2 max-lg:hidden max-lg:flex-col max-lg:items-start max-lg:gap-4 max-lg:rounded-2xl max-lg:bg-header/95 max-lg:p-4 max-lg:shadow-header max-lg:backdrop-blur-xl max-lg:data-[open=true]:flex lg:contents';

function MenuButton({
  open,
  panel,
  label,
  toggle,
}: {
  open: boolean;
  panel: string;
  label: string;
  toggle: () => void;
}) {
  const Icon = open ? X : Menu;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-11 shrink-0 max-lg:order-last lg:hidden"
      aria-expanded={open}
      aria-controls={panel}
      aria-label={label}
      data-testid="header-menu"
      onClick={toggle}
    >
      <Icon aria-hidden />
    </Button>
  );
}

/**
 * The header's overflow: from `lg` up its children sit inline in the one header row; below it they fold into a panel
 * under a Menu button, so the header never wraps to a second row. The children render once, so every link and toggle
 * keeps one copy in the page.
 */
export function HeaderMenu({ label, children }: { label: string; children: ReactNode }) {
  const [openOn, setOpenOn] = useState<string | null>(null);
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const panel = useId();
  // Following a link closes the menu: it was opened on another page.
  const open = openOn === pathname;
  useDismiss(open, () => setOpenOn(null), root);
  return (
    <div ref={root} className="contents">
      <MenuButton open={open} panel={panel} label={label} toggle={() => setOpenOn(open ? null : pathname)} />
      <div id={panel} data-open={open} className={PANEL}>
        {children}
      </div>
    </div>
  );
}
