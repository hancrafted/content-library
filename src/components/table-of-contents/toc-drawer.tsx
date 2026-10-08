import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useRef, type MouseEvent, type ReactNode, type RefObject } from 'react';
import type { TocLabels } from './toc-heading';

const DIALOG = cn(
  'fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-transparent p-3 text-inherit',
  '-translate-x-full opacity-0 transition-all transition-discrete duration-300 ease-out motion-reduce:transition-none',
  'open:translate-x-0 open:opacity-100 starting:open:-translate-x-full starting:open:opacity-0',
  'backdrop:bg-black/0 backdrop:backdrop-blur-none backdrop:transition-all backdrop:transition-discrete backdrop:duration-300',
  'open:backdrop:bg-black/40 open:backdrop:backdrop-blur-sm starting:open:backdrop:bg-black/0',
);

const CLOSE =
  'absolute top-3 right-3 z-10 grid size-11 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground';

const PILL =
  'fixed bottom-4 left-4 z-40 flex cursor-pointer min-h-11 max-w-[calc(100vw-9.5rem)] items-center gap-3 rounded-full border bg-background/80 px-4 py-2 text-sm shadow-header backdrop-blur-xl backdrop-saturate-150 md:hidden';

/** The drawer is a narrow-screen affordance; widening past `md` hands over to the sticky panel. */
function useCloseAtDesktop(dialog: RefObject<HTMLDialogElement | null>) {
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 48rem)');
    const close = () => desktop.matches && dialog.current?.close();
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, [dialog]);
}

/** Closes on a backdrop tap and on any link tap, so following an entry reveals the slide. */
function closeOnDismiss(event: MouseEvent<HTMLDialogElement>) {
  const target = event.target as Element;
  if (target === event.currentTarget || target.closest('a')) event.currentTarget.close();
}

interface DrawerProps {
  labels: TocLabels;
  where: { number: string; title: string } | null;
  /** Time left, already formatted. */
  left: string;
  /** False while the table masks its first settle; the pill then reads "Contents · Loading". */
  revealed: boolean;
}

/** Where the reader is, at a glance; tapping it opens the drawer. */
function DrawerPill(props: DrawerProps & { onOpen: () => void }) {
  return (
    <button type="button" aria-haspopup="dialog" data-testid="toc-open" className={PILL} onClick={props.onOpen}>
      <span className="sr-only">{props.labels.open}:</span>
      {props.where && <span className="font-mono text-xs text-muted-foreground">{props.where.number}</span>}
      <span className="truncate font-medium">{props.where?.title ?? props.labels.title}</span>
      <span aria-hidden className="text-muted-foreground">
        ·
      </span>
      <span
        className={cn(
          'shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums',
          !props.revealed && 'animate-pulse',
        )}
      >
        {props.revealed ? props.left : props.labels.loading}
      </span>
    </button>
  );
}

/**
 * Below `md`: a floating pill showing where the reader is, which slides the
 * table of contents in from the left as a native modal dialog — Escape, focus return and
 * an inert page come from the platform.
 */
export function TocDrawer(props: DrawerProps & { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useCloseAtDesktop(dialog);
  return (
    <>
      <DrawerPill {...props} onOpen={() => dialog.current?.showModal()} />
      <dialog ref={dialog} aria-label={props.labels.title} className={DIALOG} onClick={closeOnDismiss}>
        <div className="relative h-full">
          <button
            type="button"
            aria-label={props.labels.close}
            className={CLOSE}
            onClick={() => dialog.current?.close()}
          >
            <X aria-hidden className="size-4" />
          </button>
          {props.children}
        </div>
      </dialog>
    </>
  );
}
