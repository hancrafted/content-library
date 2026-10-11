import { cn } from '@/lib/utils';
import styles from './vertical-sticky-years.module.css';
import {
  type ChipTone,
  groupByYear,
  type PlacedEntry,
  type YearEntry,
  type YearGroup,
} from './vertical-sticky-years.pure';

const TONE: Record<ChipTone, string> = {
  machine: 'text-machine bg-machine/10 ring-machine/25',
  human: 'text-human bg-human/10 ring-human/25',
  ai: 'text-ai bg-ai/10 ring-ai/25',
};

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Sticky years: a changelog. Each year pins in a narrow left column while its entries scroll past on the right,
 * separated by hairlines, and unpins when its group ends. The year whose group spans the reading line is lit (CSS
 * scroll-driven, see the module); hovering an entry tints its row and slides in an arrow. Below `md` the year pins as
 * a band above its entries. A server part: the Slide reads its strings and passes them in.
 */
export function StickyYears({ label, entries }: { label: string; entries: YearEntry[] }) {
  return (
    <ol aria-label={label} className="border-b border-border">
      {groupByYear(entries).map((group) => (
        <YearSection key={`${group.year}-${group.entries[0].index}`} group={group} />
      ))}
    </ol>
  );
}

function YearSection({ group }: { group: YearGroup }) {
  return (
    <li className={cn(styles.group, 'grid border-t border-border md:grid-cols-[11rem_1fr]')}>
      <div className="sticky top-32 z-10 self-start bg-background/85 py-4 backdrop-blur md:top-28 md:bg-transparent md:py-12 md:pr-6 md:backdrop-blur-none">
        <h4 className={cn(styles.year, 'text-heading leading-none font-semibold tracking-tighter tabular-nums')}>
          <time dateTime={group.year}>{group.year}</time>
        </h4>
        <span
          aria-hidden="true"
          className={cn(styles.mark, 'mt-3 block h-1 w-10 origin-left rounded-full bg-brand-accent')}
        />
      </div>
      <ol className="divide-y divide-border">
        {group.entries.map((entry) => (
          <EntryRow key={entry.index} entry={entry} />
        ))}
      </ol>
    </li>
  );
}

function EntryRow({ entry }: { entry: PlacedEntry }) {
  return (
    <li
      className={cn(
        'group/entry relative isolate grid grid-cols-[auto_1fr_auto] items-start gap-x-4 py-10 md:gap-x-6 md:px-6 md:py-14',
        'before:absolute before:inset-y-0 before:-inset-x-4 before:-z-10 before:bg-muted/0 hover:before:bg-muted/70 md:before:inset-x-0',
        'motion-safe:before:transition-colors motion-safe:before:duration-300',
      )}
    >
      <EntryBadge entry={entry} />
      <div className="min-w-0">
        <h5 className="text-subheading font-semibold tracking-tight">{entry.title}</h5>
        <p className="mt-2 max-w-prose text-body text-muted-foreground">{entry.caption}</p>
      </div>
      <span
        aria-hidden="true"
        className={cn(
          'mt-1 text-xl text-brand-accent opacity-0 group-hover/entry:translate-x-0 group-hover/entry:opacity-100',
          'motion-safe:-translate-x-2 motion-safe:transition-[opacity,translate] motion-safe:duration-300',
        )}
      >
        →
      </span>
    </li>
  );
}

/** The entry's tone glyph and number, decorative: the row's title carries the meaning. */
function EntryBadge({ entry }: { entry: PlacedEntry }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-body leading-none tabular-nums ring-1 ring-inset',
        TONE[entry.tone],
      )}
    >
      <span>{entry.glyph}</span>
      {pad(entry.index + 1)}
    </span>
  );
}
