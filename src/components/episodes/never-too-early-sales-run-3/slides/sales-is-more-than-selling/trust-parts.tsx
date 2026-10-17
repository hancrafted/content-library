import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './slide.module.css';

interface BarRow {
  label: string;
  percent: number;
}

/** One factor as one `dt` + `dd` group: its label and share on a line, the share shown on hover, its bar below. */
function Bar({ row, lead, format }: { row: BarRow; lead: boolean; format: Intl.NumberFormat }) {
  return (
    <div className={cn('grid grid-cols-[1fr_auto] gap-x-2', lead ? 'font-semibold' : 'text-primary-foreground/70')}>
      <dt>{row.label}</dt>
      <dd className="contents">
        <span className="hover-reveal__detail">{format.format(row.percent / 100)}</span>
        <span aria-hidden="true" className="col-span-2 mt-1 h-2 rounded-full bg-primary-foreground/10">
          <span
            style={{ '--bar': `${row.percent}%` } as CSSProperties}
            className={cn(
              styles.bar,
              'block h-2 rounded-full',
              lead ? 'bg-primary-foreground' : 'bg-primary-foreground/40',
            )}
          />
        </span>
      </dd>
    </div>
  );
}

/** What investors weigh, as bars; the first row leads, the rest recede. */
export function SignalBars({ heading, rows, locale }: { heading: string; rows: BarRow[]; locale: string }) {
  const format = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 });
  return (
    <div className="hover-reveal mt-6 rounded-md bg-primary-foreground/10 p-4">
      <p className="font-mono text-caption tracking-widest text-primary-foreground/70 uppercase">{heading}</p>
      <dl className="mt-3 flex flex-col gap-2 text-caption">
        {rows.map((row, index) => (
          <Bar key={row.label} row={row} lead={index === 0} format={format} />
        ))}
      </dl>
    </div>
  );
}

/** The payoffs trust earns, as checked chips on the `primary` note. */
export function CheckedChips({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 flex flex-wrap gap-2 text-caption">
      {items.map((label) => (
        <li key={label} className="flex items-center gap-2 rounded-full border border-primary-foreground/30 px-3 py-1">
          <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true">
            <path
              d="M3 8.5 L6.5 12 L13 4.5"
              className="fill-none stroke-primary-foreground"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {label}
        </li>
      ))}
    </ul>
  );
}

/** The "Before revenue" stamp over the trust note's corner. */
export function Stamp({ label }: { label: string }) {
  return (
    <p className="absolute -top-5 -right-4 rotate-6 rounded-md border-2 border-primary bg-card px-3 py-1 font-mono text-caption font-semibold tracking-widest text-primary uppercase shadow-md">
      {label}
    </p>
  );
}
