import { localizePath, type Locale } from '@/lib/locale.pure';
import type { ReadingTime } from '@/lib/table-of-contents.pure';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { MouseEvent } from 'react';

export interface TocLabels {
  title: string;
  progress: string;
  /** Time left, per plural category; `#` stands for the whole minutes. */
  remaining: Record<'one' | 'other', string>;
  toggle: string;
  loading: string;
  open: string;
  close: string;
}

/** "12 min left" in the reader's locale, rounded up so the last minute never reads as zero too early. */
export function remainingLabel(labels: TocLabels, locale: Locale, minutes: number): string {
  // Plurals are resolved here, not by ICU: the count changes on the client, and functions cannot cross
  // the server/client boundary. Trim float noise first so 12.000000001 never reads as 13.
  const whole = Math.ceil(Math.round(minutes * 1e6) / 1e6);
  const category = new Intl.PluralRules(locale).select(whole) === 'one' ? 'one' : 'other';
  return labels.remaining[category].replace('#', String(whole));
}

/**
 * Title on the left, a link to the top of the page (the Title slide), current
 * while the reader is there; time left on the right, or "Loading" while the box
 * masks the first settle.
 */
export function TocHeading(props: {
  labels: TocLabels;
  locale: Locale;
  route: string;
  topId: string;
  atTop: boolean;
  onGlide: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  time: ReadingTime;
  revealed: boolean;
}) {
  const { labels } = props;
  return (
    <div className="flex items-baseline justify-between gap-3 px-2 text-xs whitespace-nowrap text-muted-foreground">
      <Link
        href={localizePath(props.route, props.locale, props.topId)}
        replace
        onClick={(event) => props.onGlide(event, props.topId)}
        aria-current={props.atTop ? 'location' : undefined}
        data-testid="toc-top"
        className="rounded font-medium tracking-widest uppercase hover:text-foreground focus-visible:outline-2"
      >
        {labels.title}
      </Link>
      {props.revealed ? null : <span className="animate-pulse noscript:hidden">{labels.loading}</span>}
      <span className={cn('tabular-nums', !props.revealed && 'hidden noscript:inline')}>
        {remainingLabel(labels, props.locale, props.time.remaining)}
      </span>
    </div>
  );
}

/** The time-weighted progress bar beneath the heading. */
export function ProgressBar(props: { labels: TocLabels; locale: Locale; time: ReadingTime; settled: boolean }) {
  const { time } = props;
  return (
    <div
      role="progressbar"
      aria-label={props.labels.progress}
      aria-valuemin={0}
      aria-valuemax={Math.ceil(time.total)}
      aria-valuenow={Math.round(time.total - time.remaining)}
      aria-valuetext={remainingLabel(props.labels, props.locale, time.remaining)}
      className="mx-2 mt-2 mb-3 h-1 shrink-0 overflow-hidden rounded-full bg-border"
    >
      <div
        className={cn(
          'h-full origin-left rounded-full bg-foreground motion-reduce:transition-none',
          props.settled ? 'transition-transform duration-300 ease-out' : 'transition-none',
        )}
        style={{ transform: `scaleX(${time.progress})` }}
      />
    </div>
  );
}
