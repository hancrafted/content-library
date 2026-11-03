import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/** The plain-word card: one line in the chat, the whole file read behind it. */
export function JumpCard({
  title,
  lead,
  more,
  target,
}: {
  title: string;
  lead: ReactNode;
  more: ReactNode;
  target: TargetProps;
}) {
  return (
    <div
      {...target}
      className="flex flex-col gap-3 rounded-xl border-2 border-primary bg-card p-5 shadow-md md:col-span-7"
    >
      <p className="text-body font-semibold">{title}</p>
      <p className="text-body">{lead}</p>
      <p className="text-caption text-muted-foreground">{more}</p>
    </div>
  );
}

/** What a bar means, and so its colour: something you typed, the AI wrote, it searched, or the file it read. */
export type BarTone = 'you' | 'ai' | 'searched' | 'read';

const TONE: Readonly<Record<BarTone, string>> = {
  you: 'fill-human',
  ai: 'fill-ai',
  searched: 'fill-muted-foreground/40',
  read: 'fill-(--success)',
};

/** The narrowest bar drawn, in percent, so 15 tokens beside 55,000 still shows as a sliver. */
const SLIVER = 0.6;

export interface SizeBarRow {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly percent: number;
  readonly tone: BarTone;
}

/** One labelled bar: its name and size above, its length below. */
function SizeBarItem({ row }: { row: SizeBarRow }) {
  return (
    <li className="flex flex-col gap-1">
      <span className="flex justify-between gap-2">
        <span className="text-muted-foreground">{row.label}</span>
        <span className="font-mono font-semibold">{row.value}</span>
      </span>
      <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="h-2 w-full" aria-hidden="true">
        <rect x="0" y="0" width="100" height="6" rx="1" className="fill-card" />
        <rect x="0" y="0" width={Math.max(row.percent, SLIVER)} height="6" rx="1" className={cn(TONE[row.tone])} />
      </svg>
    </li>
  );
}

/** Bars on one scale: what was asked and answered set against what was read to answer it. */
export function SizeBars({
  heading,
  label,
  rows,
  target,
}: {
  heading: string;
  label: string;
  rows: readonly SizeBarRow[];
  target: TargetProps;
}) {
  return (
    <div {...target} className="flex flex-col gap-3 rounded-xl bg-muted p-5 md:col-span-5">
      <p className="text-caption font-semibold tracking-wide text-muted-foreground uppercase">{heading}</p>
      <ul className="flex flex-col gap-2 text-caption" aria-label={label}>
        {rows.map((row) => (
          <SizeBarItem key={row.key} row={row} />
        ))}
      </ul>
    </div>
  );
}
