'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import type { ReactNode } from 'react';
import { osOf, type Os } from './picks.pure';
import { unzipGesture } from './unzip.pure';

export interface UnzipWords {
  readonly downloads: string;
  readonly zip: string;
  readonly justNow: string;
  readonly older: string;
  readonly lastWeek: string;
  readonly menuLabel: string;
  readonly action: Readonly<Record<Os, string>>;
  readonly menu: Readonly<Record<'windows' | 'linux', { before: readonly string[]; after: readonly string[] }>>;
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2h9A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"
        className="fill-muted stroke-muted-foreground"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ZipIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6z" className="fill-card stroke-primary" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M11 6h2M11 9h2M11 12h2" className="stroke-primary" strokeWidth="1.5" />
    </svg>
  );
}

function MenuItems({ items }: { items: readonly string[] }) {
  return items.map((item) => (
    <li key={item} className="rounded-md px-3 py-1.5 text-muted-foreground">
      {item}
    </li>
  ));
}

interface UnzipMenuProps {
  readonly label: string;
  readonly before: readonly string[];
  readonly action: string;
  readonly after: readonly string[];
}

function UnzipMenu({ label, before, action, after }: UnzipMenuProps) {
  return (
    <ul
      aria-label={label}
      className="absolute top-24 left-6 w-56 max-w-[calc(100%-2rem)] rounded-xl border border-border bg-card p-1.5 text-caption shadow-md sm:left-1/4"
    >
      <MenuItems items={before} />
      <li className="flex items-center justify-between rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-foreground">
        {action} <span aria-hidden="true">←</span>
      </li>
      <MenuItems items={after} />
    </ul>
  );
}

function DoubleClick({ label }: { label: string }) {
  return (
    <p className="absolute top-24 left-12 flex items-center gap-2 text-caption font-semibold text-primary">
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
        <path
          d="M5 3l6 16 2.2-6.8L20 10z"
          className="fill-card stroke-primary"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">{label}</span>
    </p>
  );
}

function DownloadsList({ words }: { words: UnzipWords }) {
  return (
    <ul className="flex flex-col gap-1 p-3 pb-52 text-caption">
      <li className="flex items-center justify-between gap-3 rounded-lg bg-primary/10 px-3 py-2">
        <span className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
          <ZipIcon />
          <span className="truncate">{words.zip}</span>
        </span>
        <span className="shrink-0 text-muted-foreground">{words.justNow}</span>
      </li>
      <li className="flex items-center justify-between gap-3 px-3 py-2 text-muted-foreground">
        <span className="truncate">{words.older}</span>
        <span className="shrink-0">{words.lastWeek}</span>
      </li>
    </ul>
  );
}

export function UnzipView({ words, warning }: { words: UnzipWords; warning: ReactNode }) {
  const [pick] = usePagePick('os', 'mac');
  const os = osOf(pick);
  const gesture = unzipGesture(os);
  return (
    <>
      <div className="relative rounded-2xl border border-border bg-background">
        <p className="flex items-center gap-2 border-b border-border px-4 py-2 text-caption text-muted-foreground">
          <FolderIcon />
          {words.downloads}
        </p>
        <DownloadsList words={words} />
        {os === 'mac' ? (
          <DoubleClick label={words.action.mac} />
        ) : (
          <UnzipMenu label={words.menuLabel} action={words.action[os]} {...words.menu[os]} />
        )}
      </div>
      {gesture.warn ? (
        <p className="rounded-xl bg-(--warning)/25 px-4 py-3 text-caption text-foreground">{warning}</p>
      ) : null}
    </>
  );
}
