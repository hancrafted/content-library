import { cn } from '@/lib/utils';
import styles from './vertical-center-spine.module.css';

export interface SpineEntry {
  date: string;
  title: string;
  caption: string;
}

type Side = 'left' | 'right';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Centre spine: entries alternate left and right of one vertical spine, each card joined to a node on it. The spine
 * fills as the page scrolls and each node lights as the fill reaches it (CSS scroll-driven, see the module); hovering
 * an entry lights its node and connector. Below `md` every card sits right of a spine on the left. Document order is
 * top to bottom whatever the side. A server part: the Slide reads its strings and passes them in.
 */
export function CentreSpine({ label, entries }: { label: string; entries: SpineEntry[] }) {
  return (
    <div className={cn(styles.track, 'relative')}>
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-0 left-5 w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-border md:left-1/2',
          '[mask-image:linear-gradient(to_bottom,transparent,black_2rem,black_calc(100%-2rem),transparent)]',
        )}
      >
        <span className={cn(styles.fill, 'absolute inset-0 origin-top bg-brand-accent')} />
      </span>
      <ol aria-label={label} className="relative flex flex-col gap-10 md:gap-4">
        {entries.map((entry, index) => (
          <SpineItem
            key={entry.title}
            entry={entry}
            index={index}
            count={entries.length}
            side={index % 2 === 0 ? 'left' : 'right'}
          />
        ))}
      </ol>
    </div>
  );
}

function SpineItem({ entry, index, count, side }: { entry: SpineEntry; index: number; count: number; side: Side }) {
  return (
    <li className="group relative grid grid-cols-[2.5rem_1fr] gap-y-2 md:grid-cols-[1fr_4rem_1fr] md:gap-y-0">
      <SpineDate date={entry.date} side={side} />
      <SpineNode side={side} />
      <SpineCard entry={entry} index={index} count={count} side={side} />
    </li>
  );
}

/** The entry's year: small beside the card below `md`, a large numeral across the spine from it above. */
function SpineDate({ date, side }: { date: string; side: Side }) {
  return (
    <p
      className={cn(
        styles.date,
        'col-start-2 row-start-1 font-mono text-body text-foreground tabular-nums',
        'md:row-start-1 md:pt-0.5 md:font-sans text-heading md:leading-none md:tracking-tighter',
        side === 'left' ? 'md:col-start-3 md:pl-6 md:text-left' : 'md:col-start-1 md:pr-6 md:text-right',
      )}
    >
      {date}
    </p>
  );
}

/** The node on the spine and the connector to the card, both lighting on hover. */
function SpineNode({ side }: { side: Side }) {
  return (
    <span aria-hidden="true" className="relative col-start-1 row-span-2 row-start-1 md:col-start-2 md:row-span-1">
      <span
        className={cn(
          'absolute top-8 hidden h-px w-1/2 bg-border group-hover:bg-brand-accent md:block',
          'motion-safe:transition-colors motion-safe:duration-300',
          side === 'left' ? 'left-0' : 'right-0',
        )}
      />
      <span
        className={cn(
          styles.node,
          'absolute top-2.5 left-1/2 size-3.5 -translate-1/2 rounded-full border-2 border-brand-accent bg-brand-accent md:top-8',
          'ring-brand-accent/25 group-hover:scale-150 group-hover:ring-4',
          'motion-safe:transition-[scale,box-shadow] motion-safe:duration-300',
        )}
      />
    </span>
  );
}

function SpineCard({ entry, index, count, side }: { entry: SpineEntry; index: number; count: number; side: Side }) {
  return (
    <div
      data-side={side}
      className={cn(
        styles.card,
        'col-start-2 row-start-2 rounded-xl border border-border bg-background p-6 shadow-sm',
        'group-hover:border-brand-accent/60 group-hover:shadow-md',
        'motion-safe:transition-[border-color,box-shadow] motion-safe:duration-300',
        'md:row-start-1',
        side === 'left' ? 'md:col-start-1' : 'md:col-start-3',
      )}
    >
      <p aria-hidden="true" className="font-mono text-body leading-4 tracking-widest text-muted-foreground">
        {pad(index + 1)} / {pad(count)}
      </p>
      <h4 className="mt-3 text-xl font-semibold tracking-tight">{entry.title}</h4>
      <p className="mt-1.5 text-body text-muted-foreground">{entry.caption}</p>
    </div>
  );
}
