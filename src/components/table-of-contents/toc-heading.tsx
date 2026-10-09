import { localizePath, type Locale } from '@/lib/locale.pure';
import { hasReadingTime, remainingLabel, wholeMinutes, type RemainingTemplates } from '@/lib/speaking-time.pure';
import type { ReadingTime } from '@/lib/table-of-contents.pure';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { MouseEvent } from 'react';

export interface TocLabels {
  title: string;
  progress: string;
  /** Time left, per plural category; `{count}` stands for the whole minutes. */
  remaining: RemainingTemplates;
  toggle: string;
  loading: string;
  open: string;
  close: string;
}

/** Time left, kept in the HTML for a reader without JavaScript; nothing for an Episode without a Voice script. */
function TimeLeft(props: { labels: TocLabels; locale: Locale; time: ReadingTime; revealed: boolean }) {
  if (!hasReadingTime(props.time.total)) return null;
  return (
    <span className={cn('tabular-nums', !props.revealed && 'hidden noscript:inline')}>
      {remainingLabel(props.labels.remaining, props.locale, props.time.remaining)}
    </span>
  );
}

/**
 * Title on the left, a link to the top of the page (the Title slide), current
 * while the reader is there; time left on the right, or "Loading" while the box
 * masks the first settle. An Episode without a Voice script has no time to show.
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
      <TimeLeft {...props} />
    </div>
  );
}

/** The time-weighted progress bar beneath the heading; only its spacing where the Episode has no Voice script. */
export function ProgressBar(props: { labels: TocLabels; locale: Locale; time: ReadingTime; settled: boolean }) {
  const { time } = props;
  if (!hasReadingTime(time.total)) return <div className="mb-3" />;
  return (
    <div
      role="progressbar"
      aria-label={props.labels.progress}
      aria-valuemin={0}
      aria-valuemax={wholeMinutes(time.total)}
      aria-valuenow={Math.round(time.total - time.remaining)}
      aria-valuetext={remainingLabel(props.labels.remaining, props.locale, time.remaining)}
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
