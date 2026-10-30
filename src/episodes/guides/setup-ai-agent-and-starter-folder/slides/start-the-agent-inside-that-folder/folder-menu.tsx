import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/*
 * Move 1's drawing: a file-manager surface (`bg-muted`) with the folder tile, its right-click menu and, on Mac, the
 * submenu, as `bg-card shadow-md` cards; the path to click in `primary`. Drawn, not clickable.
 */

const MENU = 'flex flex-col gap-0.5 rounded-xl border border-border bg-card p-1.5 text-caption shadow-md';

function FolderTile({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <svg viewBox="0 0 64 52" className="h-14 w-16" aria-hidden="true">
        <path
          d="M4 10a4 4 0 0 1 4-4h14l5 5h29a4 4 0 0 1 4 4v29a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
          className="fill-primary/20 stroke-primary"
          strokeWidth="2"
        />
      </svg>
      <span className="rounded-md bg-primary px-2 py-0.5 text-caption font-semibold text-primary-foreground">
        {name}
      </span>
    </div>
  );
}

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path
        d="M3 5h18v14H3zM6 9l3 3-3 3M11 15h5"
        className="fill-none stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Items({ items }: { items: readonly string[] }) {
  return items.map((item) => (
    <li key={item} className="rounded-md px-3 py-1 text-foreground">
      {item}
    </li>
  ));
}

/** The item to click: filled `primary` with the terminal mark when it is the last click, a tint when it opens more. */
function Pick({ children, last }: { children: ReactNode; last: boolean }) {
  return (
    <li
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-1.5 font-semibold',
        last ? 'bg-primary text-primary-foreground' : 'justify-between bg-primary/10 text-primary',
      )}
    >
      {last ? <TerminalIcon /> : null}
      {children}
      {last ? null : <span aria-hidden="true">›</span>}
    </li>
  );
}

/** Mac: Finder's menu on the folder, Services, and its submenu with "New Terminal at Folder". */
export function MacMenu({ label, folder, items, services, pick, other }: MacMenuProps) {
  return (
    <div aria-label={label} role="img" className="grid grid-cols-12 items-start gap-3 rounded-2xl bg-muted p-4 sm:p-5">
      <div className="col-span-12 sm:col-span-3">
        <FolderTile name={folder} />
      </div>
      <ul className={cn(MENU, 'col-span-12 sm:col-span-4')}>
        <Items items={items} />
        <li aria-hidden="true" className="my-1 h-px bg-border" />
        <Pick last={false}>{services}</Pick>
      </ul>
      <ul className={cn(MENU, 'col-span-12 sm:col-span-5 sm:mt-24')}>
        <Pick last>{pick}</Pick>
        <li className="rounded-md px-3 py-1 text-muted-foreground">{other}</li>
      </ul>
    </div>
  );
}

interface MacMenuProps {
  readonly label: string;
  readonly folder: string;
  readonly items: readonly string[];
  readonly services: string;
  readonly pick: string;
  readonly other: string;
}

/** Windows 11: File Explorer's short menu on the folder, no submenu, with "Open in Terminal". */
export function WindowsMenu({ label, folder, before, pick, after }: WindowsMenuProps) {
  return (
    <div aria-label={label} role="img" className="grid grid-cols-12 items-start gap-3 rounded-2xl bg-muted p-4 sm:p-5">
      <div className="col-span-12 sm:col-span-3">
        <FolderTile name={folder} />
      </div>
      <ul className={cn(MENU, 'col-span-12 sm:col-span-6')}>
        <Items items={before} />
        <li aria-hidden="true" className="my-1 h-px bg-border" />
        <Pick last>{pick}</Pick>
        <li className="rounded-md px-3 py-1 text-muted-foreground">{after}</li>
      </ul>
    </div>
  );
}

interface WindowsMenuProps {
  readonly label: string;
  readonly folder: string;
  readonly before: readonly string[];
  readonly pick: string;
  readonly after: string;
}
